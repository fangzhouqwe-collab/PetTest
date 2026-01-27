import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 检查是否配置了 Supabase（非占位符）
const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.includes('supabase.co') &&
    !supabaseUrl.includes('your_supabase') &&
    !supabaseAnonKey.includes('your_supabase')
);

console.log('Supabase 配置状态:', isConfigured ? '已配置' : '未配置');
console.log('Supabase URL:', supabaseUrl);

// 创建 Supabase 客户端
export const supabase: SupabaseClient = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

// 是否 Supabase 已配置
export const isSupabaseConfigured = isConfigured;

// 辅助函数：获取当前用户
export const getCurrentUser = async () => {
    if (!isConfigured) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// 辅助函数：获取当前用户 ID
export const getCurrentUserId = async () => {
    const user = await getCurrentUser();
    return user?.id;
};

export default supabase;
