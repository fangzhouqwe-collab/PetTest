// 测试用户服务
// 用于演示模式下的多用户切换和测试
// 使用 localStorage 持久化数据

const STORAGE_KEYS = {
    MESSAGES: 'petconnect_test_messages',
    CURRENT_USER: 'petconnect_current_user'
};

// 预设测试用户
export const TEST_USERS = [
    {
        id: 'user-1',
        name: '张小明',
        avatar: 'https://picsum.photos/seed/user1/200/200',
        bio: '金毛犬主人，热爱户外运动'
    },
    {
        id: 'user-2',
        name: '李美丽',
        avatar: 'https://picsum.photos/seed/user2/200/200',
        bio: '猫咪爱好者，养了三只布偶猫'
    },
    {
        id: 'user-3',
        name: '王大锤',
        avatar: 'https://picsum.photos/seed/user3/200/200',
        bio: '宠物医院医生，7年从业经验'
    }
];

// 消息存储结构
interface MessageStore {
    [threadId: string]: {
        user1Id: string;
        user2Id: string;
        messages: Array<{
            id: string;
            senderId: string;
            text: string;
            timestamp: string; // ISO 字符串，便于 JSON 序列化
        }>;
    };
}

// 从 localStorage 加载消息
const loadMessagesFromStorage = (): MessageStore => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('加载消息失败:', e);
    }
    return {};
};

// 保存消息到 localStorage
const saveMessagesToStorage = (store: MessageStore) => {
    try {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(store));
    } catch (e) {
        console.error('保存消息失败:', e);
    }
};

// 加载当前用户 ID
const loadCurrentUserId = (): string => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (stored && TEST_USERS.some(u => u.id === stored)) {
            return stored;
        }
    } catch (e) {
        console.error('加载当前用户失败:', e);
    }
    return TEST_USERS[0].id;
};

// 全局消息存储
let messageStore: MessageStore = loadMessagesFromStorage();

// 当前用户 ID
let currentTestUserId = loadCurrentUserId();

// 获取当前测试用户
export const getCurrentTestUser = () => {
    return TEST_USERS.find(u => u.id === currentTestUserId) || TEST_USERS[0];
};

// 设置当前测试用户
export const setCurrentTestUser = (userId: string) => {
    const user = TEST_USERS.find(u => u.id === userId);
    if (user) {
        currentTestUserId = userId;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
        return user;
    }
    return null;
};

// 获取测试用户列表（不包含当前用户）
export const getOtherTestUsers = () => {
    return TEST_USERS.filter(u => u.id !== currentTestUserId);
};

// 获取会话 ID（两用户之间唯一）
const getThreadId = (userId1: string, userId2: string) => {
    const ids = [userId1, userId2].sort();
    return `thread-${ids[0]}-${ids[1]}`;
};

// 获取与某用户的聊天消息
export const getTestMessages = (otherUserId: string) => {
    const threadId = getThreadId(currentTestUserId, otherUserId);
    const thread = messageStore[threadId];

    if (!thread) return [];

    return thread.messages.map(m => ({
        id: m.id,
        sender: m.senderId === currentTestUserId ? 'user' as const : 'other' as const,
        text: m.text,
        timestamp: new Date(m.timestamp)
    }));
};

// 发送测试消息
export const sendTestMessage = (otherUserId: string, text: string) => {
    const threadId = getThreadId(currentTestUserId, otherUserId);

    if (!messageStore[threadId]) {
        messageStore[threadId] = {
            user1Id: currentTestUserId,
            user2Id: otherUserId,
            messages: []
        };
    }

    const newMessage = {
        id: Date.now().toString(),
        senderId: currentTestUserId,
        text,
        timestamp: new Date().toISOString()
    };

    messageStore[threadId].messages.push(newMessage);

    // 保存到 localStorage
    saveMessagesToStorage(messageStore);

    return {
        id: newMessage.id,
        sender: 'user' as const,
        text: newMessage.text,
        timestamp: new Date(newMessage.timestamp)
    };
};

// 获取所有会话列表（当前用户视角）
export const getTestThreads = () => {
    const threads: Array<{
        id: string;
        otherUser: typeof TEST_USERS[0];
        lastMessage: string;
        lastMessageTime: Date;
        unread: boolean;
    }> = [];

    for (const [threadId, thread] of Object.entries(messageStore)) {
        // 只显示当前用户参与的会话
        if (thread.user1Id !== currentTestUserId && thread.user2Id !== currentTestUserId) {
            continue;
        }

        const otherUserId = thread.user1Id === currentTestUserId ? thread.user2Id : thread.user1Id;
        const otherUser = TEST_USERS.find(u => u.id === otherUserId);

        if (!otherUser || thread.messages.length === 0) continue;

        const lastMsg = thread.messages[thread.messages.length - 1];

        threads.push({
            id: otherUserId,
            otherUser,
            lastMessage: lastMsg.text,
            lastMessageTime: new Date(lastMsg.timestamp),
            unread: lastMsg.senderId !== currentTestUserId
        });
    }

    // 按时间排序
    return threads.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
};

// 初始化测试消息（只在没有数据时）
export const initTestMessages = () => {
    // 如果已有数据，不覆盖
    if (Object.keys(messageStore).length > 0) {
        return;
    }

    // 用户1 和 用户2 的对话
    const threadId1 = getThreadId('user-1', 'user-2');
    messageStore[threadId1] = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        messages: [
            { id: '1', senderId: 'user-2', text: '你好，请问那只金毛还在吗？', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: '2', senderId: 'user-1', text: '是的，还在呢！你有兴趣吗？', timestamp: new Date(Date.now() - 3500000).toISOString() },
            { id: '3', senderId: 'user-2', text: '太好了！能发些照片看看吗？', timestamp: new Date(Date.now() - 3400000).toISOString() }
        ]
    };

    // 用户1 和 用户3 的对话
    const threadId2 = getThreadId('user-1', 'user-3');
    messageStore[threadId2] = {
        user1Id: 'user-1',
        user2Id: 'user-3',
        messages: [
            { id: '4', senderId: 'user-3', text: '您好，您预约的周三下午疫苗接种已确认', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { id: '5', senderId: 'user-1', text: '好的，谢谢医生！', timestamp: new Date(Date.now() - 85000000).toISOString() }
        ]
    };

    // 保存到 localStorage
    saveMessagesToStorage(messageStore);
};

// 清空所有消息（重置）
export const clearTestMessages = () => {
    messageStore = {};
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
};

// 刷新消息存储（从 localStorage 重新加载）
export const refreshMessages = () => {
    messageStore = loadMessagesFromStorage();
};
