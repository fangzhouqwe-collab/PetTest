// 腾讯地图定位服务

declare const TMap: any;

interface LocationResult {
    province: string;
    city: string;
    formatted: string;
}

/**
 * 获取当前位置的省市信息
 * @returns Promise<LocationResult> 返回省市信息
 */
export async function getCurrentLocation(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
        // 检查浏览器是否支持地理定位
        if (!navigator.geolocation) {
            reject(new Error('浏览器不支持地理定位'));
            return;
        }

        // 获取当前位置坐标
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // 使用腾讯地图逆地理编码
                    const geocoder = new TMap.service.Geocoder();
                    const result = await geocoder.getAddress({
                        location: new TMap.LatLng(latitude, longitude)
                    });

                    if (result.status === 0 && result.result) {
                        const addressComponent = result.result.address_component;
                        const province = addressComponent.province || '';
                        const city = addressComponent.city || '';

                        resolve({
                            province,
                            city,
                            formatted: `${province} ${city}`.trim()
                        });
                    } else {
                        reject(new Error('逆地理编码失败'));
                    }
                } catch (error) {
                    reject(error);
                }
            },
            (error) => {
                let message = '定位失败';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = '用户拒绝了定位请求';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = '位置信息不可用';
                        break;
                    case error.TIMEOUT:
                        message = '定位请求超时';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}
