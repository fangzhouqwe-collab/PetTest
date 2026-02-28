// 免费无限制稳定定位服务 (替代原腾讯地图和脆弱接口)

interface LocationResult {
    province: string;
    city: string;
    formatted: string;
}

/**
 * 获取当前位置的省市信息
 * 首先尝试拿到 GPS 并通过 BigDataCloud 进行高速逆地址解析
 * 如果没有授予 GPS 权限，也会传空参数回落到 BigDataCloud 默认的 IP 定位端点
 * @returns Promise<LocationResult> 返回省市信息
 */
export async function getCurrentLocation(): Promise<LocationResult> {
    const fetchLocation = async (lat?: number, lon?: number): Promise<LocationResult> => {
        try {
            // BigDataCloud 免费高速接口，自动支持经纬度和 IP fallback
            const url = lat && lon
                ? `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
                : `https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh`;

            const response = await fetch(url);
            const data = await response.json();

            if (data) {
                const province = data.principalSubdivision || '';
                const city = data.city || data.locality || province;

                return {
                    province,
                    city,
                    formatted: `${province} ${city}`.trim() || '未知城市'
                };
            }
            throw new Error('定位接口未返回有效信');
        } catch (error) {
            console.error('BigDataCloud 定位获取失败:', error);
            return { province: '', city: '', formatted: '未知位置' };
        }
    };

    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('浏览器不支持地理定位，退化为纯 IP 定位');
            resolve(fetchLocation());
            return;
        }

        // 获取当前位置坐标
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve(fetchLocation(latitude, longitude));
            },
            (error) => {
                console.warn(`获取 GPS 坐标失败 (${error.message})，退化为纯 IP 定位`);
                resolve(fetchLocation());
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 60000
            }
        );
    });
}
