import { supabase, getCurrentUserId, isSupabaseConfigured } from '../lib/supabase';
import { ServiceWorker, ServiceOrder } from '../types';

/**
 * 格式化兼职护工信息
 */
const formatServiceWorker = (item: any): ServiceWorker => {
    return {
        id: item.id,
        workerId: item.worker_id,
        realName: item.real_name,
        photos: item.photos || [],
        title: item.title,
        skills: item.skills || [],
        basePrice: item.base_price,
        serviceArea: item.service_area,
        bioDescription: item.bio_description,
        isVerified: item.is_verified,
        rating: item.rating,
        orderCount: item.order_count,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        workerProfile: item.profiles ? {
            name: item.profiles.name,
            avatar: item.profiles.avatar_url,
            bio: item.profiles.bio,
            bgImage: item.profiles.bg_image_url || '',
            pets: []
        } : undefined
    };
};

/**
 * 格式化邀约订单
 */
const formatServiceOrder = (item: any): ServiceOrder => {
    return {
        id: item.id,
        workerProfileId: item.worker_profile_id,
        employerId: item.employer_id,
        petId: item.pet_id,
        serviceType: item.service_type,
        serviceTime: item.service_time,
        location: item.location,
        offerPrice: item.offer_price,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        employer: item.profiles ? {
            name: item.profiles.name,
            avatar: item.profiles.avatar_url,
            bio: item.profiles.bio,
            bgImage: item.profiles.bg_image_url || '',
            pets: []
        } : undefined,
        pet: item.pets ? {
            id: item.pets.id,
            name: item.pets.name,
            breed: item.pets.breed,
            img: item.pets.avatar_url || 'https://picsum.photos/seed/pet/200/200'
        } : undefined,
        worker: item.service_workers ? formatServiceWorker(item.service_workers) : undefined
    };
};

// ============================================
// 一、兼职者简历相关接口 (Worker Profiles)
// ============================================

/**
 * 获取兼职者简历大厅列表
 */
export const getWorkerProfiles = async (options?: { limit?: number; offset?: number; search?: string }): Promise<ServiceWorker[]> => {
    if (!isSupabaseConfigured) return [];
    
    const { limit = 20, offset = 0, search } = options || {};

    let query = supabase
        .from('service_workers')
        .select(`
            *,
            profiles!worker_id(name, avatar_url, bio, bg_image_url)
        `)
        .order('rating', { ascending: false })
        .order('order_count', { ascending: false })
        .range(offset, offset + limit - 1);

    if (search) {
        query = query.or(`title.ilike.%${search}%,service_area.ilike.%${search}%,bio_description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('获取兼职大厅列表失败:', error);
        return [];
    }

    return (data || []).map(formatServiceWorker);
};

/**
 * 获取特定的简历详情
 */
export const getWorkerProfileById = async (id: string): Promise<ServiceWorker | null> => {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
        .from('service_workers')
        .select(`
            *,
            profiles!worker_id(name, avatar_url, bio, bg_image_url)
        `)
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('获取兼职者资料失败:', error);
        return null;
    }

    return formatServiceWorker(data);
};

/**
 * 注册/更新自己的兼职简历卡片
 */
export const upsertWorkerProfile = async (payload: {
    realName?: string;
    photos?: string[];
    title: string;
    skills: string[];
    basePrice: number;
    serviceArea: string;
    bioDescription: string;
}): Promise<{ data: ServiceWorker | null, error: string | null }> => {
    if (!isSupabaseConfigured) return { data: null, error: '网络异常：未检测到环境里的数据库配置' };

    const userId = await getCurrentUserId();
    if (!userId) {
        console.error('未登录用户无法发布兼职简历');
        return { data: null, error: '入驻失败！当前正处于游客体验模式，请返回首页并退出登录使用真实账号重新登入。' };
    }

    // Upsert 逻辑（依赖 worker_id 的 unique constraint 可以当单例更新）
    const { data, error } = await supabase
        .from('service_workers')
        .upsert({
            worker_id: userId,
            real_name: payload.realName || null,
            photos: payload.photos || [],
            title: payload.title,
            skills: payload.skills,
            base_price: payload.basePrice,
            service_area: payload.serviceArea,
            bio_description: payload.bioDescription,
            updated_at: new Date().toISOString()
        }, { onConflict: 'worker_id' })
        .select(`
            *,
            profiles!worker_id(name, avatar_url, bio, bg_image_url)
        `)
        .single();

    if (error || !data) {
        console.error('更新个人兼职档案失败:', error);
        return { data: null, error: error?.message || '写入数据库请求异常' };
    }

    return { data: formatServiceWorker(data), error: null };
};

/**
 * 读取自己的入驻简历信息
 */
export const getMyWorkerProfile = async (): Promise<ServiceWorker | null> => {
    if (!isSupabaseConfigured) return null;
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
        .from('service_workers')
        .select(`*, profiles!worker_id(name, avatar_url, bio, bg_image_url)`)
        .eq('worker_id', userId)
        .single();

    if (error) return null;
    return data ? formatServiceWorker(data) : null;
};

// ============================================
// 二、雇主邀约定向接口 (Service Orders)
// ============================================

/**
 * 雇主向选定的兼职者发起邀约订单
 */
export const createServiceOrder = async (workerProfileId: string, payload: {
    petId?: string;
    serviceType: string;
    serviceTime: string;
    location: string;
    offerPrice: number;
}): Promise<ServiceOrder | null> => {
    if (!isSupabaseConfigured) return null;
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
        .from('service_orders')
        .insert({
            employer_id: userId,
            worker_profile_id: workerProfileId,
            pet_id: payload.petId || null,
            service_type: payload.serviceType,
            service_time: payload.serviceTime,
            location: payload.location,
            offer_price: payload.offerPrice,
            status: 'PENDING'
        })
        .select()
        .single();

    if (error || !data) {
        console.error('发起邀约失败:', error);
        return null;
    }

    return formatServiceOrder(data);
};

/**
 * 兼职者回应邀约 (接单或拒单)
 */
export const respondToOrder = async (orderId: string, action: 'ACCEPTED' | 'REJECTED'): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    // Supabase RLS 已经限制了只有自己相关的单子能更新
    const { error } = await supabase
        .from('service_orders')
        .update({
            status: action,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('status', 'PENDING');

    if (error) {
        console.error('回应订单失败:', error);
        return false;
    }

    return true;
};

/**
 * 修改订单状态为完成 (可由任一方点击，后续可以加更严格的双方确认)
 */
export const completeOrder = async (orderId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
        .from('service_orders')
        .update({
            status: 'COMPLETED',
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('status', 'ACCEPTED');

    if (error) {
        console.error('完成订单失败:', error);
        return false;
    }

    return true;
};

/**
 * 雇主主动取消邀约 (通常仅在 PENDING 状态)
 */
export const cancelOrder = async (orderId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
        .from('service_orders')
        .update({
            status: 'CANCELLED',
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('employer_id', userId)
        .eq('status', 'PENDING');

    if (error) {
        console.error('取消订单失败:', error);
        return false;
    }

    return true;
};

/**
 * 获取与我相关的订单 (我发起的邀约 OR 发给我的邀约)
 */
export const getMyServiceOrders = async (role: 'employer' | 'worker'): Promise<ServiceOrder[]> => {
    if (!isSupabaseConfigured) return [];
    const userId = await getCurrentUserId();
    if (!userId) return [];

    let query = supabase
        .from('service_orders')
        .select(`
            *,
            profiles!employer_id(name, avatar_url, bio, bg_image_url),
            pets(id, name, breed, avatar_url),
            service_workers!worker_profile_id(
                id, worker_id, title, rating, 
                profiles!worker_id(name, avatar_url, bio)
            )
        `)
        .order('created_at', { ascending: false });

    // Filter by role
    if (role === 'employer') {
        query = query.eq('employer_id', userId);
    } else {
        // 查找 service_workers 里 worker_id = userId 的哪些 profile_id 对应的单
        // 因为已经在 RLS 里通过 select 策略做了过滤，或者在这里做 subquery 过滤
        // 为安全和显式，这里我们可以获取自己的 profile_id 在查询中
        const myProfile = await getMyWorkerProfile();
        if (myProfile) {
            query = query.eq('worker_profile_id', myProfile.id);
        } else {
            return []; // 兼职者如果还没发过简历就不可能有接到的单
        }
    }

    const { data, error } = await query;
    if (error) {
        console.error(`获取${role === 'employer' ? '发出' : '收到'}的订单列表失败:`, error);
        return [];
    }

    return (data || []).map(formatServiceOrder);
};
