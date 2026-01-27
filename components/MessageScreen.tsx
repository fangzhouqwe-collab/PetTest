
import React, { useState, useEffect, useMemo } from 'react';
import { MessageThread } from '../types';
import * as messageService from '../services/messageService';
import * as testUserService from '../services/testUserService';
import { useAuthContext } from '../contexts/AuthContext';

// 固定的系统会话
const FIXED_THREADS: MessageThread[] = [
  {
    id: 'ai',
    name: 'AI 宠物助手',
    avatar: '',
    lastMessage: '随时为您解答宠物问题',
    time: '在线',
    unread: false,
    type: 'ai'
  },
  {
    id: 'sys',
    name: '系统通知',
    avatar: '',
    lastMessage: '欢迎使用宠物社区',
    time: '',
    type: 'system'
  }
];

interface MessageScreenProps {
  onOpenAIChat: () => void;
  onUserClick?: (id: string, name: string, avatar: string) => void;
  lastMessages?: Record<string, string>; // 各聊天的最新消息
}

const MessageScreen: React.FC<MessageScreenProps> = ({ onOpenAIChat, onUserClick, lastMessages = {} }) => {
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载会话列表
  useEffect(() => {
    const loadThreads = async () => {
      setLoading(true);

      try {
        if (user) {
          // 从数据库加载
          const dbThreads = await messageService.getThreads();
          setThreads(dbThreads);
        } else {
          // 演示模式：使用测试用户
          const otherUsers = testUserService.getOtherTestUsers();
          const testThreads = testUserService.getTestThreads();
          const currentUser = testUserService.getCurrentTestUser();

          // 合并已有会话和其他用户
          const allThreads: MessageThread[] = [
            ...FIXED_THREADS,
            // 显示所有其他测试用户
            ...otherUsers.map(u => {
              const existingThread = testThreads.find(t => t.id === u.id);
              return {
                id: u.id,
                name: u.name,
                avatar: u.avatar,
                lastMessage: existingThread?.lastMessage || '点击开始聊天',
                time: existingThread ? formatTime(existingThread.lastMessageTime) : '',
                unread: existingThread?.unread || false
              };
            })
          ];

          setThreads(allThreads);
        }
      } catch (error) {
        console.error('加载会话失败:', error);
        setThreads(FIXED_THREADS);
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, [user]);

  // 根据 lastMessages 更新显示的消息
  const displayThreads = useMemo(() => {
    return threads.map(thread => {
      if (lastMessages[thread.id]) {
        return {
          ...thread,
          lastMessage: lastMessages[thread.id],
          time: '刚刚',
          unread: false
        };
      }
      return thread;
    });
  }, [threads, lastMessages]);

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return displayThreads;
    return displayThreads.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayThreads, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="ios-header px-4 pt-10 pb-4 border-b border-black/5 bg-white/80 ios-blur sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-ios-blue text-lg font-medium">编辑</span>
          <h1 className="text-[17px] font-bold">消息中心</h1>
          <span className="material-symbols-outlined text-ios-blue">edit_square</span>
        </div>
        <div className="mb-4">
          <h2 className="text-3xl font-bold tracking-tight">消息</h2>
          {!user && (
            <p className="text-xs text-ios-gray mt-1">
              演示模式 - 当前用户: {testUserService.getCurrentTestUser().name}
            </p>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined !text-[20px] text-ios-gray">search</span>
          </div>
          <input
            className="w-full bg-black/5 rounded-lg pl-10 pr-10 py-1.5 text-[17px] border-none focus:ring-0 transition-all focus:bg-black/10"
            placeholder="搜索聊天记录"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 inset-y-0 flex items-center text-ios-gray">
              <span className="material-symbols-outlined !text-[18px]">cancel</span>
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-ios-gray text-sm">加载中...</div>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-black/5 animate-in fade-in duration-300">
          {filteredThreads.length > 0 ? filteredThreads.map(thread => (
            <div
              key={thread.id}
              onClick={() => {
                if (thread.type === 'ai') {
                  onOpenAIChat();
                }
                else if (thread.type !== 'system' && onUserClick) {
                  onUserClick(thread.id, thread.name, thread.avatar);
                }
              }}
              className="flex items-center px-4 py-3 active:bg-black/5 transition-colors cursor-pointer group"
            >
              <div className="relative mr-4 shrink-0">
                {thread.type === 'ai' ? (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ios-blue to-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                    <span className="material-symbols-outlined !text-[32px] material-symbols-fill">smart_toy</span>
                  </div>
                ) : thread.type === 'system' ? (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                    <span className="material-symbols-outlined !text-[32px] material-symbols-fill">notifications</span>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-black/5 transition-transform group-hover:scale-105 shadow-sm">
                    <img src={thread.avatar} className="w-full h-full object-cover" />
                  </div>
                )}
                {thread.tag && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-black/5 text-sm">
                    {thread.tag}
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[17px] tracking-tight truncate">{thread.name}</span>
                  <span className={`text-[13px] ${thread.unread ? 'text-ios-blue font-semibold' : 'text-ios-gray'}`}>{thread.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[15px] text-ios-gray truncate max-w-[240px] leading-snug">{thread.lastMessage}</span>
                  {thread.unread && <div className="w-2.5 h-2.5 bg-ios-blue rounded-full shadow-sm shadow-ios-blue/50"></div>}
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center text-ios-gray">
              <p className="text-sm">没有匹配的联系人或消息</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 时间格式化辅助函数
const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 1) return '今天';
  if (diffDays === 1) return '昨天';
  return date.toLocaleDateString('zh-CN');
};

export default MessageScreen;
