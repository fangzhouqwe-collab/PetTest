// 上传服务：使用 Supabase Storage 上传文件

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// 上传结果类型
export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

// 生成唯一文件名
const generateFileName = (file: File): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'mp4';
    return `${timestamp}_${random}.${ext}`;
};

// 上传视频到 Supabase Storage（如果未配置则使用 base64）
export const uploadVideo = async (file: File): Promise<UploadResult> => {
    // 移除对文件大小和类型的限制，信任用户上传的任何视频类型及大小


    // 如果 Supabase 未配置，使用 base64
    if (!isSupabaseConfigured) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    success: true,
                    url: reader.result as string
                });
            };
            reader.onerror = () => {
                resolve({ success: false, error: '视频读取失败' });
            };
            reader.readAsDataURL(file);
        });
    }

    try {
        const fileName = generateFileName(file);
        const filePath = `uploads/${fileName}`;

        // 上传到 Supabase Storage
        const { data, error } = await supabase.storage
            .from('videos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('上传失败:', error);
            return { success: false, error: error.message };
        }

        // 获取公开 URL
        const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(filePath);

        return {
            success: true,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('上传异常:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '上传失败'
        };
    }
};

// 上传图片到 Supabase Storage
export const uploadImage = async (file: File): Promise<UploadResult> => {
    // 检查文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return { success: false, error: '图片文件过大，请选择小于 10MB 的图片' };
    }

    // 如果 Supabase 未配置，使用 base64
    if (!isSupabaseConfigured) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    success: true,
                    url: reader.result as string
                });
            };
            reader.onerror = () => {
                resolve({ success: false, error: '图片读取失败' });
            };
            reader.readAsDataURL(file);
        });
    }

    try {
        const fileName = generateFileName(file);
        const filePath = `uploads/${fileName}`;

        const { data, error } = await supabase.storage
            .from('videos') // 复用同一个 bucket
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('上传失败:', error);
            return { success: false, error: error.message };
        }

        const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(filePath);

        return {
            success: true,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('上传异常:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '上传失败'
        };
    }
};
