import React, { useState, useEffect } from 'react';
import * as notificationService from '../services/notificationService';
import { Notification } from '../services/notificationService';

interface NotificationScreenProps {
    onBack: () => void;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // 加载通知
        setNotifications(notificationService.getNotifications());
    }, []);

    const handleMarkAsRead = (id: string) => {
        notificationService.markAsRead(id);
        setNotifications(notificationService.getNotifications());
    };

    const handleMarkAllAsRead = () => {
        notificationService.markAllAsRead();
        setNotifications(notificationService.getNotifications());
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="flex flex-col min-h-screen bg-ios-bg animate-in slide-in-from-right duration-300">
            <header className="sticky top-0 z-50 ios-blur bg-white/80 border-b border-black/5 px-4 pt-10 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-black/5 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-[17px] font-bold">消息通知</h1>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-ios-blue text-[14px] font-medium"
                    >
                        全部已读
                    </button>
                )}
            </header>

            <div className="flex-1 p-4 space-y-3">
                {notifications.length === 0 ? (
                    <div className="py-20 text-center text-ios-gray">
                        <span className="material-symbols-outlined !text-[48px] opacity-20">notifications_off</span>
                        <p className="mt-2 text-sm">暂无通知</p>
                    </div>
                ) : (
                    notifications.map(note => (
                        <div
                            key={note.id}
                            onClick={() => handleMarkAsRead(note.id)}
                            className={`bg-white rounded-2xl p-4 flex gap-4 cursor-pointer active:bg-black/5 transition-colors ${!note.read ? 'border-l-4 border-l-ios-blue' : ''}`}
                        >
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
                    ))
                )}

                {notifications.length > 0 && (
                    <div className="py-6 text-center text-ios-gray text-xs">
                        没有更多消息了
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationScreen;
