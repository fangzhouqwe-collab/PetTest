// 消息服务：处理消息会话和聊天
import { supabase, getCurrentUserId, isSupabaseConfigured } from '../lib/supabase';
import { MessageThread, ChatMessage } from '../types';

// 固定的 AI 和系统消息条目
const FIXED_THREADS: MessageThread[] = [
    {
        id: 'ai',
        name: 'AI 宠物助手',
        avatar: '',
        lastMessage: '随时为您解答宠物问题',
        time: '在线',
        type: 'ai'
    },
    {
        id: 'system',
        name: '系统通知',
        avatar: '',
        lastMessage: '欢迎使用宠物社区',
        time: '',
        type: 'system'
    }
];

// 时间格式化
const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

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

// 获取消息会话列表
export const getThreads = async (): Promise<MessageThread[]> => {
    if (!isSupabaseConfigured) return FIXED_THREADS;

    const userId = await getCurrentUserId();
    if (!userId) return FIXED_THREADS;

    const { data, error } = await supabase
        .from('message_threads')
        .select(`
      *,
      user1:user1_id (id, name, avatar_url),
      user2:user2_id (id, name, avatar_url)
    `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

    if (error) {
        console.error('获取消息列表失败:', error);
        return FIXED_THREADS;
    }

    const threads: MessageThread[] = (data || []).map((thread: any) => {
        // 确定对方用户
        const otherUser = thread.user1_id === userId ? thread.user2 : thread.user1;

        return {
            id: thread.id,
            name: otherUser?.name || '用户',
            avatar: otherUser?.avatar_url || 'https://picsum.photos/seed/user/100/100',
            lastMessage: thread.last_message || '暂无消息',
            time: formatTime(thread.last_message_at || thread.created_at)
        };
    });

    return [...FIXED_THREADS, ...threads];
};

// 获取某个会话的消息列表
export const getMessages = async (threadId: string): Promise<ChatMessage[]> => {
    if (!isSupabaseConfigured) return [];

    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
        .from('messages')
        .select(`
      *,
      sender:sender_id (id, name, avatar_url)
    `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('获取消息失败:', error);
        return [];
    }

    return (data || []).map((msg: any) => ({
        id: msg.id,
        sender: msg.sender_id === userId ? 'user' : 'other',
        text: msg.text || '',
        image: msg.image_url || undefined,
        video: msg.video_url || undefined,
        timestamp: new Date(msg.created_at)
    }));
};

// 发送消息
export const sendMessage = async (threadId: string, text: string, imageUrl?: string, videoUrl?: string): Promise<ChatMessage | null> => {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data: message, error } = await supabase
        .from('messages')
        .insert({
            thread_id: threadId,
            sender_id: userId,
            text,
            image_url: imageUrl,
            video_url: videoUrl
        } as any)
        .select()
        .single();

    if (error || !message) {
        console.error('发送消息失败:', error);
        return null;
    }

    // 更新会话最后一条消息
    await supabase
        .from('message_threads')
        .update({
            last_message: text || (imageUrl ? '[图片]' : (videoUrl ? '[视频]' : '')),
            last_message_at: new Date().toISOString()
        } as any)
        .eq('id', threadId);

    const m = message as any;
    return {
        id: m.id,
        sender: 'user',
        text: m.text || '',
        image: m.image_url || undefined,
        video: m.video_url || undefined,
        timestamp: new Date(m.created_at)
    };
};

// 创建新会话
export const createThread = async (otherUserId: string): Promise<string | null> => {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    // 检查是否已存在会话
    const { data: existingThread } = await supabase
        .from('message_threads')
        .select('id')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`)
        .single();

    if (existingThread) {
        return (existingThread as any).id;
    }

    // 创建新会话
    const { data: newThread, error } = await supabase
        .from('message_threads')
        .insert({
            user1_id: userId,
            user2_id: otherUserId
        } as any)
        .select()
        .single();

    if (error || !newThread) {
        console.error('创建会话失败:', error);
        return null;
    }

    return (newThread as any).id;
};

// 实时订阅新消息
export const subscribeToMessages = (threadId: string, callback: (message: ChatMessage) => void) => {
    if (!isSupabaseConfigured) return { unsubscribe: () => { } };

    const channel = supabase
        .channel(`messages:${threadId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `thread_id=eq.${threadId}`
            },
            async (payload) => {
                const userId = await getCurrentUserId();
                const msg = payload.new as any;
                callback({
                    id: msg.id,
                    sender: msg.sender_id === userId ? 'user' : 'other',
                    text: msg.text || '',
                    image: msg.image_url || undefined,
                    video: msg.video_url || undefined,
                    timestamp: new Date(msg.created_at)
                });
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        }
    };
};
