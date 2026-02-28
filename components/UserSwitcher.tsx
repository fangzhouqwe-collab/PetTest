// 用户切换组件
// 用于测试多用户之间的消息互动

import React, { useState } from 'react';
import { TEST_USERS, getCurrentTestUser, setCurrentTestUser } from '../services/testUserService';

interface UserSwitcherProps {
    onUserChange: (user: typeof TEST_USERS[0]) => void;
}

const UserSwitcher: React.FC<UserSwitcherProps> = ({ onUserChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(getCurrentTestUser());

    const handleSelectUser = (user: typeof TEST_USERS[0]) => {
        setCurrentTestUser(user.id);
        setCurrentUser(user);
        onUserChange(user);
        setIsOpen(false);
    };

    return (
        <div className="fixed top-4 right-4 z-[100]">
            {/* 切换按钮 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-ios-card shadow-lg border border-ios-separator hover:shadow-xl transition-all"
            >
                <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-ios-blue"
                />
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="material-symbols-outlined !text-[16px] text-ios-gray">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {/* 用户列表 */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-ios-card rounded-2xl shadow-2xl border border-ios-separator overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 bg-gray-50 border-b border-black/5">
                        <span className="text-xs font-bold text-ios-gray uppercase tracking-wider">切换测试账号</span>
                    </div>

                    {TEST_USERS.map(user => (
                        <button
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${user.id === currentUser.id ? 'bg-ios-blue/5' : ''
                                }`}
                        >
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className={`w-10 h-10 rounded-full object-cover ${user.id === currentUser.id ? 'ring-2 ring-ios-blue' : ''
                                    }`}
                            />
                            <div className="flex-1 text-left">
                                <div className="font-medium text-sm">{user.name}</div>
                                <div className="text-xs text-ios-gray truncate">{user.bio}</div>
                            </div>
                            {user.id === currentUser.id && (
                                <span className="material-symbols-outlined !text-[20px] text-ios-blue material-symbols-fill">
                                    check_circle
                                </span>
                            )}
                        </button>
                    ))}

                    <div className="px-4 py-3 bg-gray-50 border-t border-black/5">
                        <p className="text-xs text-ios-gray">
                            💡 提示：切换用户后可以模拟不同用户之间的聊天
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSwitcher;
