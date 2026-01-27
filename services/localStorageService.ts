// 本地存储服务
// 用于演示模式下的数据持久化

import { Post, MarketItem, UserProfile } from '../types';

const STORAGE_KEYS = {
    POSTS: 'petconnect_posts',
    MARKET_ITEMS: 'petconnect_market_items',
    USER_PROFILE: 'petconnect_user_profile',
    AI_CHAT_HISTORY: 'petconnect_ai_chat'
};

// 帖子相关
export const savePosts = (posts: Post[]) => {
    try {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch (e) {
        console.error('保存帖子失败:', e);
    }
};

export const loadPosts = (): Post[] | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('加载帖子失败:', e);
    }
    return null;
};

// 市场商品相关
export const saveMarketItems = (items: MarketItem[]) => {
    try {
        localStorage.setItem(STORAGE_KEYS.MARKET_ITEMS, JSON.stringify(items));
    } catch (e) {
        console.error('保存商品失败:', e);
    }
};

export const loadMarketItems = (): MarketItem[] | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.MARKET_ITEMS);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('加载商品失败:', e);
    }
    return null;
};

// 用户资料相关
export const saveUserProfile = (profile: UserProfile) => {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
        console.error('保存用户资料失败:', e);
    }
};

export const loadUserProfile = (): UserProfile | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('加载用户资料失败:', e);
    }
    return null;
};

// AI 聊天记录
interface AIChatMessage {
    id: string;
    role: 'user' | 'ai';
    text: string;
    image?: string;
    timestamp: string;
}

export const saveAIChatHistory = (messages: AIChatMessage[]) => {
    try {
        // 只保存最近 50 条
        const toSave = messages.slice(-50);
        localStorage.setItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(toSave));
    } catch (e) {
        console.error('保存 AI 聊天记录失败:', e);
    }
};

export const loadAIChatHistory = (): AIChatMessage[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.AI_CHAT_HISTORY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('加载 AI 聊天记录失败:', e);
    }
    return [];
};

export const clearAIChatHistory = () => {
    localStorage.removeItem(STORAGE_KEYS.AI_CHAT_HISTORY);
};

// 清除所有数据
export const clearAllLocalData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
};
