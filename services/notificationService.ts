// 通知服务：处理消息通知

export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'system' | 'follow';
    avatar?: string;
    title: string;
    content: string;
    time: string;
    read: boolean;
    postId?: string;
    userId?: string;
}

// 本地存储的通知列表
let notifications: Notification[] = [
    {
        id: '1',
        type: 'system',
        title: '系统通知',
        content: '欢迎来到宠物社区！完善资料可以让更多朋友认识你哦。',
        time: '刚刚',
        read: false
    }
];

// 获取所有通知
export const getNotifications = (): Notification[] => {
    return [...notifications];
};

// 获取未读通知数量
export const getUnreadCount = (): number => {
    return notifications.filter(n => !n.read).length;
};

// 添加通知
export const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>): void => {
    const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        time: '刚刚',
        read: false
    };
    notifications = [newNotification, ...notifications];
};

// 添加点赞通知
export const addLikeNotification = (userName: string, userAvatar: string, postTitle: string, postId: string): void => {
    addNotification({
        type: 'like',
        avatar: userAvatar,
        title: userName,
        content: `赞了你的动态 "${postTitle}"`,
        postId
    });
};

// 添加评论通知
export const addCommentNotification = (userName: string, userAvatar: string, comment: string, postId: string): void => {
    addNotification({
        type: 'comment',
        avatar: userAvatar,
        title: userName,
        content: `评论了: ${comment}`,
        postId
    });
};

// 添加关注通知
export const addFollowNotification = (userName: string, userAvatar: string, userId: string): void => {
    addNotification({
        type: 'follow',
        avatar: userAvatar,
        title: userName,
        content: '开始关注你了',
        userId
    });
};

// 标记通知为已读
export const markAsRead = (notificationId: string): void => {
    notifications = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
    );
};

// 标记所有通知为已读
export const markAllAsRead = (): void => {
    notifications = notifications.map(n => ({ ...n, read: true }));
};

// 清空所有通知
export const clearNotifications = (): void => {
    notifications = [];
};
