// 市场商品服务：处理商品的增删改查
import { supabase, getCurrentUserId, isSupabaseConfigured } from '../lib/supabase';

// 前端使用的商品类型
export interface MarketItem {
    id: string;
    userId?: string;
    name: string;
    image: string;
    price: number;
    category: string;
    verified: boolean;
    age?: string;
    gender?: string;
    location?: string;
    description?: string;
    breed?: string;
    distance?: number;
    isMine?: boolean;
}

// 获取商品列表
export const getMarketItems = async (options?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
    priceSort?: 'asc' | 'desc';
}): Promise<MarketItem[]> => {
    if (!isSupabaseConfigured) return [];

    const currentUserId = await getCurrentUserId();
    const { limit = 20, offset = 0, category, search, priceSort } = options || {};

    let query = supabase
        .from('market_items')
        .select('*')
        .range(offset, offset + limit - 1);

    if (category && category !== '全部') {
        query = query.eq('category', category);
    }

    if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (priceSort) {
        query = query.order('price', { ascending: priceSort === 'asc' });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
        console.error('获取商品列表失败:', error);
        return [];
    }

    return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.image_url || 'https://picsum.photos/seed/item/400/400',
        price: item.price,
        category: item.category,
        verified: item.verified,
        age: item.age || undefined,
        gender: item.gender || undefined,
        location: item.location || undefined,
        description: item.description || undefined,
        breed: item.breed || undefined,
        distance: Math.random() * 10, // 模拟距离数据
        isMine: item.user_id === currentUserId
    }));
};

// 获取单个商品详情
export const getMarketItemById = async (itemId: string): Promise<MarketItem | null> => {
    if (!isSupabaseConfigured) return null;

    const currentUserId = await getCurrentUserId();

    const { data: item, error } = await supabase
        .from('market_items')
        .select('*')
        .eq('id', itemId)
        .single();

    if (error || !item) {
        console.error('获取商品详情失败:', error);
        return null;
    }

    const i = item as any;
    return {
        id: i.id,
        userId: i.user_id,
        name: i.name,
        image: i.image_url || 'https://picsum.photos/seed/item/400/400',
        price: i.price,
        category: i.category,
        verified: i.verified,
        age: i.age || undefined,
        gender: i.gender || undefined,
        location: i.location || undefined,
        description: i.description || undefined,
        breed: i.breed || undefined,
        distance: Math.random() * 10,
        isMine: i.user_id === currentUserId
    };
};

// 创建商品
export const createMarketItem = async (data: {
    name: string;
    image_url?: string;
    price: number;
    category: string;
    breed?: string;
    age?: string;
    gender?: string;
    location?: string;
    description?: string;
}): Promise<MarketItem | null> => {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data: item, error } = await supabase
        .from('market_items')
        .insert({
            user_id: userId,
            ...data
        } as any)
        .select()
        .single();

    if (error || !item) {
        console.error('创建商品失败:', error);
        return null;
    }

    return getMarketItemById((item as any).id);
};

// 更新商品
export const updateMarketItem = async (itemId: string, data: Partial<{
    name: string;
    image_url: string;
    price: number;
    category: string;
    age: string;
    gender: string;
    location: string;
    description: string;
}>): Promise<MarketItem | null> => {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { error } = await supabase
        .from('market_items')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        } as any)
        .eq('id', itemId)
        .eq('user_id', userId);

    if (error) {
        console.error('更新商品失败:', error);
        return null;
    }

    return getMarketItemById(itemId);
};

// 删除商品
export const deleteMarketItem = async (itemId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
        .from('market_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

    if (error) {
        console.error('删除商品失败:', error);
        return false;
    }

    return true;
};
