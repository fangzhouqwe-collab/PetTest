import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// 检查是否配置了 Supabase（非占位符）
const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.includes('supabase.co') &&
    !supabaseUrl.includes('your_supabase') &&
    !supabaseAnonKey.includes('your_supabase')
);

// 检查是否配置了 Service Role Key（管理员级操作）
const hasServiceRole = Boolean(supabaseServiceRoleKey && !supabaseServiceRoleKey.includes('你的'));

console.log('Supabase 配置状态:', isConfigured ? '已配置' : '未配置');
console.log('Admin Client:', hasServiceRole ? '已配置 Service Role' : '未配置，部分写入功能受限');

// 普通用户级别 client（遵守 RLS）
export const supabase: SupabaseClient = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

// 管理员级别 client（绕过 RLS，仅在后台使用）
// 如果未配置 service_role key，则回退到 anon client（某些写入操作可能失败）
export const adminSupabase: SupabaseClient = isConfigured && hasServiceRole
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : supabase; // 回退到 anon client

export const isSupabaseConfigured = isConfigured;
export const isAdminConfigured = hasServiceRole;

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
