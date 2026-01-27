import React from 'react';

interface Notification {
    id: string;
    type: 'like' | 'comment' | 'system' | 'follow';
    avatar?: string;
    title: string;
    content: string;
    time: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'system',
        title: '系统通知',
        content: '欢迎来到宠物社区！完善资料可以让更多朋友认识你哦。',
        time: '刚刚',
        read: false
    },
    {
        id: '2',
        type: 'like',
        avatar: 'https://picsum.photos/seed/user1/100/100',
        title: '旺财妈妈',
        content: '赞了你的动态 "带狗子去公园"',
        time: '1小时前',
        read: false
    },
    {
        id: '3',
        type: 'comment',
        avatar: 'https://picsum.photos/seed/user2/100/100',
        title: '咪咪铲屎官',
        content: '评论了: 真可爱！我也想养一只',
        time: '昨天',
        read: true
    },
    {
        id: '4',
        type: 'follow',
        avatar: 'https://picsum.photos/seed/user3/100/100',
        title: '大黄是只金毛',
        content: '开始关注你了',
        time: '2天前',
        read: true
    }
];

const NotificationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="flex flex-col min-h-screen bg-ios-bg animate-in slide-in-from-right duration-300">
            <header className="sticky top-0 z-50 ios-blur bg-white/80 border-b border-black/5 px-4 pt-10 pb-3 flex items-center gap-4">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-black/5 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                </button>
                <h1 className="text-[17px] font-bold">消息通知</h1>
            </header>

            <div className="flex-1 p-4 space-y-3">
                {MOCK_NOTIFICATIONS.map(note => (
                    <div key={note.id} className={`bg-white rounded-2xl p-4 flex gap-4 ${!note.read ? 'border-l-4 border-l-ios-blue' : ''}`}>
                        <div className="size-12 shrink-0 relative">
                            {note.avatar ? (
                                <img src={note.avatar} className="w-full h-full rounded-full object-cover border border-black/5" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                                    <span className="material-symbols-outlined">notifications</span>
                                </div>
                            )}
                            {/* Type Icon */}
                            <div className={`absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center text-white text-[10px] border-2 border-white
                 ${note.type === 'like' ? 'bg-ios-red' :
                                    note.type === 'comment' ? 'bg-ios-blue' :
                                        note.type === 'follow' ? 'bg-ios-green' : 'bg-gray-500'}`}
                            >
                                <span className="material-symbols-outlined !text-[12px]">
                                    {note.type === 'like' ? 'favorite' :
                                        note.type === 'comment' ? 'chat_bubble' :
                                            note.type === 'follow' ? 'person_add' : 'info'}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start mb-0.5">
                                <h4 className="font-bold text-[15px]">{note.title}</h4>
                                <span className="text-[11px] text-ios-gray">{note.time}</span>
                            </div>
                            <p className="text-[14px] text-[#3A3A3C] leading-relaxed">{note.content}</p>
                        </div>
                    </div>
                ))}

                <div className="py-6 text-center text-ios-gray text-xs">
                    没有更多消息了
                </div>
            </div>
        </div>
    );
};

export default NotificationScreen;
