// 帖子服务：处理社区动态的增删改查
import { supabase, getCurrentUserId, isSupabaseConfigured } from '../lib/supabase';

// 前端使用的帖子类型
export interface Post {
    id: string;
    author: string;
    avatar: string;
    breed: string;
    time: string;
    image: string;
    video?: string; // 新增视频字段
    userId?: string; // 作者 ID
    title: string;
    content: string;
    likes: number;
    comments: number;
    commentsList?: Comment[];
    liked?: boolean;
    location?: string;
    isMine?: boolean;
}

export interface Comment {
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
}

// 时间格式化辅助函数
const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // 如果小于1分钟
    if (diffMs < 60000) return '刚刚';

    // 如果是今天
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    // 如果是昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // 显示完整日期时间
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
};

// 获取帖子列表
export const getPosts = async (options?: {
    limit?: number;
    offset?: number;
    userId?: string;
    search?: string;
}): Promise<Post[]> => {
    if (!isSupabaseConfigured) return [];

    const currentUserId = await getCurrentUserId();
    const { limit = 20, offset = 0, userId, search } = options || {};

    let query = supabase
        .from('posts')
        .select(`
      *,
      profiles:user_id (id, name, avatar_url),
      comments (id, text, created_at, profiles:user_id (name, avatar_url)),
      likes (user_id)
    `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,breed.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('获取帖子列表失败:', error);
        return [];
    }

    return (data || []).map((post: any) => {
        const profile = post.profiles;
        const comments = post.comments || [];
        const likes = post.likes || [];

        return {
            id: post.id,
            userId: post.user_id, // 映射数据库字段
            author: profile?.name || '匿名用户',
            avatar: profile?.avatar_url || 'https://picsum.photos/seed/default/100/100',
            breed: post.breed || '宠物',
            time: formatTime(post.created_at),
            image: post.image_url || 'https://picsum.photos/seed/post/400/400',
            video: post.video_url || undefined,
            title: post.title,
            content: post.content,
            likes: post.likes_count,
            comments: post.comments_count,
            commentsList: comments.map((c: any) => ({
                id: c.id,
                author: c.profiles?.name || '匿名',
                avatar: c.profiles?.avatar_url || 'https://picsum.photos/seed/c/100/100',
                text: c.text,
                time: formatTime(c.created_at)
            })),
            liked: likes.some((l: any) => l.user_id === currentUserId),
            location: post.location || undefined,
            isMine: post.user_id === currentUserId
        };
    });
};

// 获取单个帖子详情
export const getPostById = async (postId: string): Promise<Post | null> => {
    if (!isSupabaseConfigured) return null;

    const currentUserId = await getCurrentUserId();

    const { data: post, error } = await supabase
        .from('posts')
        .select(`
      *,
      profiles:user_id (id, name, avatar_url),
      comments (id, text, created_at, profiles:user_id (name, avatar_url)),
      likes (user_id)
    `)
        .eq('id', postId)
        .single();

    if (error || !post) {
        console.error('获取帖子详情失败:', error);
        return null;
    }

    const p = post as any;
    const profile = p.profiles;
    const comments = p.comments || [];
    const likes = p.likes || [];

    return {
        id: p.id,
        userId: p.user_id, // 映射数据库字段
        author: profile?.name || '匿名用户',
        avatar: profile?.avatar_url || 'https://picsum.photos/seed/default/100/100',
        breed: p.breed || '宠物',
        time: formatTime(p.created_at),
        image: p.image_url || 'https://picsum.photos/seed/post/400/400',
        video: p.video_url || undefined,
        title: p.title,
        content: p.content,
        likes: p.likes_count,
        comments: p.comments_count,
        commentsList: comments.map((c: any) => ({
            id: c.id,
            author: c.profiles?.name || '匿名',
            avatar: c.profiles?.avatar_url || 'https://picsum.photos/seed/c/100/100',
            text: c.text,
            time: formatTime(c.created_at)
        })),
        liked: likes.some((l: any) => l.user_id === currentUserId),
        location: p.location || undefined,
        isMine: p.user_id === currentUserId
    };
};

// 创建帖子
export const createPost = async (data: {
    title: string;
    content: string;
    image_url?: string;
    video_url?: string;
    breed?: string;
    location?: string;
}): Promise<Post | null> => {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data: post, error } = await supabase
        .from('posts')
        .insert({
            user_id: userId,
            title: data.title,
            content: data.content,
            image_url: data.image_url,
            video_url: data.video_url,
            breed: data.breed || '我家宠宝',
            location: data.location
        } as any)
        .select()
        .single();

    if (error || !post) {
        console.error('创建帖子失败:', error);
        return null;
    }

    return getPostById((post as any).id);
};

// 切换点赞状态
export const toggleLike = async (postId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    const userId = await getCurrentUserId();
    if (!userId) return false;

    // 检查是否已点赞
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    if (existingLike) {
        // 取消点赞
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('id', (existingLike as any).id);

        if (error) {
            console.error('取消点赞失败:', error);
            return false;
        }
    } else {
        // 添加点赞
        const { error } = await supabase
            .from('likes')
            .insert({
                post_id: postId,
                user_id: userId
            } as any);

        if (error) {
            console.error('点赞失败:', error);
            return false;
        }
    }

    return true;
};

// 添加评论
export const addComment = async (postId: string, text: string): Promise<Comment | null> => {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data: comment, error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            user_id: userId,
            text
        } as any)
        .select(`
      id,
      text,
      created_at,
      profiles:user_id (name, avatar_url)
    `)
        .single();

    if (error || !comment) {
        console.error('添加评论失败:', error);
        return null;
    }

    const c = comment as any;
    const profile = c.profiles;

    return {
        id: c.id,
        author: profile?.name || '我',
        avatar: profile?.avatar_url || 'https://picsum.photos/seed/me/100/100',
        text: c.text,
        time: '刚刚'
    };
};

// 删除帖子
export const deletePost = async (postId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

    if (error) {
        console.error('删除帖子失败:', error);
        return false;
    }

    return true;
};
