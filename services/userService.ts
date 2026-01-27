// 用户服务：处理用户资料和宠物管理
import { supabase, getCurrentUserId, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Pet } from '../types';

// 获取当前用户资料
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
      *,
      pets (id, name, breed, image_url)
    `)
        .eq('id', userId)
        .single();

    if (error || !profile) {
        console.error('获取用户资料失败:', error);
        return null;
    }

    const p = profile as any;
    return {
        name: p.name,
        bio: p.bio || '',
        avatar: p.avatar_url || 'https://picsum.photos/seed/user/200/200',
        bgImage: p.bg_image_url || 'https://picsum.photos/seed/bg/800/400',
        pets: (p.pets || []).map((pet: any) => ({
            name: pet.name,
            breed: pet.breed,
            img: pet.image_url || 'https://picsum.photos/seed/pet/300/300'
        }))
    };
};

// 获取用户资料（通过 ID）
export const getUserProfileById = async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
      *,
      pets (id, name, breed, image_url)
    `)
        .eq('id', userId)
        .single();

    if (error || !profile) {
        console.error('获取用户资料失败:', error);
        return null;
    }

    const p = profile as any;
    return {
        name: p.name,
        bio: p.bio || '',
        avatar: p.avatar_url || 'https://picsum.photos/seed/user/200/200',
        bgImage: p.bg_image_url || 'https://picsum.photos/seed/bg/800/400',
        pets: (p.pets || []).map((pet: any) => ({
            name: pet.name,
            breed: pet.breed,
            img: pet.image_url || 'https://picsum.photos/seed/pet/300/300'
        }))
    };
};

// 更新用户资料
export const updateUserProfile = async (data: {
    name?: string;
    bio?: string;
    avatar_url?: string;
    bg_image_url?: string;
}): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
        .from('profiles')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        } as any)
        .eq('id', userId);

    if (error) {
        console.error('更新用户资料失败:', error);
        return false;
    }

    return true;
};

// 添加宠物
export const addPet = async (pet: {
    name: string;
    breed: string;
    image_url?: string;
}): Promise<Pet | null> => {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
        .from('pets')
        .insert({
            user_id: userId,
            name: pet.name,
            breed: pet.breed,
            image_url: pet.image_url
        } as any)
        .select()
        .single();

    if (error || !data) {
        console.error('添加宠物失败:', error);
        return null;
    }

    const d = data as any;
    return {
        name: d.name,
        breed: d.breed,
        img: d.image_url || 'https://picsum.photos/seed/pet/300/300'
    };
};

// 删除宠物
export const deletePet = async (petId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)
        .eq('user_id', userId);

    if (error) {
        console.error('删除宠物失败:', error);
        return false;
    }

    return true;
};

// 上传图片到 Supabase Storage
export const uploadImage = async (file: File, bucket: string): Promise<string | null> => {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

    if (uploadError) {
        console.error('上传图片失败:', uploadError);
        return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
};
