
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MessageThread, UserProfile } from '../types';
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

// 模拟用户库数据 (同首页，扩充一些昵称以演示搜索)
const MOCK_USERS: UserProfile[] = [
  { petConnectId: 'pet_001', name: '雪原小狼', bio: '一只爱玩的哈士奇', avatar: 'https://picsum.photos/seed/user1/100/100', bgImage: '', pets: [], isFollowing: true },
  { petConnectId: 'pet_888', name: '喵小白', bio: '专注睡大觉', avatar: 'https://picsum.photos/seed/user2/100/100', bgImage: '', pets: [], isFollowing: false },
  { petConnectId: 'pet_520', name: '鹦鹉螺号', bio: '话痨本痨', avatar: 'https://picsum.photos/seed/user3/100/100', bgImage: '', pets: [], isFollowing: false },
  { petConnectId: 'pet_111', name: 'Wangwang', bio: '我是大黄', avatar: 'https://picsum.photos/seed/user4/100/100', bgImage: '', pets: [], isFollowing: false },
  { petConnectId: 'pet_222', name: '布偶猫一家', bio: '三只小布偶', avatar: 'https://picsum.photos/seed/user5/100/100', bgImage: '', pets: [], isFollowing: true },
  { petConnectId: 'pet_333', name: '阿柴', bio: '柴犬的日常', avatar: 'https://picsum.photos/seed/user6/100/100', bgImage: '', pets: [], isFollowing: false }
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 简易关注状态管理器，隔离外部影响
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(() =>
    MOCK_USERS.reduce((acc, u) => ({ ...acc, [u.petConnectId!]: !!u.isFollowing }), {})
  );

  // 计算当前成为本地好友的用户
  const friends = useMemo(() => {
    return MOCK_USERS.filter(u => followingMap[u.petConnectId!]);
  }, [followingMap]);

  // 处理关注事件并发送自动回复
  const handleToggleFollow = (userToFollow: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowFollowing = !followingMap[userToFollow.petConnectId!];

    setFollowingMap(p => ({ ...p, [userToFollow.petConnectId!]: isNowFollowing }));

    // 若动作是“关注”，触发打招呼
    if (isNowFollowing) {
      setThreads(prev => {
        const existingIdx = prev.findIndex(t => t.id === userToFollow.petConnectId);
        const newThread: MessageThread = {
          id: userToFollow.petConnectId!,
          name: userToFollow.name,
          avatar: userToFollow.avatar,
          lastMessage: `你好，我是${userToFollow.name}！很高兴被你关注，我们可以随时聊天交流养宠经验哦～`,
          time: '刚刚',
          unread: true,
          type: 'user'
        };

        if (existingIdx > -1) {
          const newThreads = [...prev];
          newThreads.splice(existingIdx, 1);
          return [newThread, ...newThreads];
        }
        return [newThread, ...prev];
      });
      setIsSearchFocused(false);
      setShowAddFriend(false);
    }
  };

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

    // 点击外部取消搜索高亮状态
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const searchedUsers = useMemo(() => {
    // 这里我们支持内部下拉搜索和外置的加好友全屏搜索共用逻辑
    const q = (showAddFriend ? friendSearchQuery : searchQuery).trim().toLowerCase();
    if (!q) return [];

    return MOCK_USERS.filter(u =>
      u.name.toLowerCase().includes(q) ||
      (u.petConnectId && u.petConnectId.toLowerCase().includes(q))
    );
  }, [searchQuery, friendSearchQuery, showAddFriend]);

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg transition-colors duration-300">
      <header className="ios-header pt-10 pb-2 border-b border-ios-separator bg-ios-card/80 ios-blur sticky top-0 z-50 transition-colors">
        <div className="px-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-ios-blue text-[17px] font-medium">编辑</span>
            <h1 className="text-[17px] font-bold">消息中心</h1>
            <button onClick={() => setShowAddFriend(true)} className="flex items-center text-ios-blue bg-ios-blue/10 p-1.5 rounded-full active:scale-95 transition-transform">
              <span className="material-symbols-outlined !text-[22px]">person_add</span>
            </button>
          </div>
          <div className="mb-4">
            <h2 className="text-3xl font-bold tracking-tight">消息</h2>
            {!user && (
              <p className="text-xs text-ios-gray mt-1">
                演示模式 - 当前用户: {testUserService.getCurrentTestUser().name}
              </p>
            )}
          </div>
          <div className="relative" ref={searchContainerRef}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined !text-[20px] text-ios-gray">search</span>
            </div>
            <input
              className="w-full bg-black/5 rounded-lg pl-10 pr-10 py-1.5 text-[17px] border-none focus:ring-0 transition-all focus:bg-black/10"
              placeholder="搜索联系人、聊天记录或添加好友"
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 inset-y-0 flex items-center text-ios-gray z-10">
                <span className="material-symbols-outlined !text-[18px]">cancel</span>
              </button>
            )}

            {/* --- 浮动搜索下拉面板 --- */}
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-ios-card shadow-2xl rounded-2xl border border-ios-separator overflow-hidden z-[100] max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-black/5 bg-ios-bg/50">
                  <span className="text-[12px] font-bold text-ios-gray ml-2">全局搜索用户 / ID</span>
                </div>
                {searchedUsers.length > 0 ? (
                  <div>
                    {searchedUsers.map(u => (
                      <div key={u.petConnectId} className="flex items-center gap-3 p-3 hover:bg-black/5 transition-colors cursor-pointer border-b border-black/5 last:border-0">
                        <img src={u.avatar} className="size-11 rounded-full border border-black/5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[15px] leading-tight flex items-center gap-1">
                            {u.name}
                          </h4>
                          <p className="text-[12px] text-ios-gray font-mono mt-0.5">ID: {u.petConnectId}</p>
                        </div>
                        <button
                          onClick={(e) => handleToggleFollow(u, e)}
                          className={`px-3 py-1 text-[13px] font-bold rounded-full transition-colors ${followingMap[u.petConnectId!] ? 'bg-black/5 text-ios-gray' : 'bg-ios-blue text-white'}`}
                        >
                          {followingMap[u.petConnectId!] ? '已关注' : '关注'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-[13px] text-ios-gray bg-ios-bg">没有搜索到包含此 ID 或用户名的好友</div>
                )}

                <div className="p-2 border-t border-b border-black/5 mt-1 bg-ios-bg/50">
                  <span className="text-[12px] font-bold text-ios-gray ml-2">本地聊天记录: "{searchQuery}"</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 关注列表横向快选区 */}
        {friends.length > 0 && (
          <div className="mt-4 pt-3 border-t border-black/5 overflow-x-auto no-scrollbar pb-1 px-4">
            <div className="flex gap-4">
              {friends.map(f => (
                <div
                  key={f.petConnectId}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer w-14 group"
                  onClick={() => onUserClick?.(f.petConnectId!, f.name, f.avatar)}
                >
                  <div className="relative">
                    <img src={f.avatar} className="w-12 h-12 rounded-full border border-black/5 shadow-sm group-active:scale-95 transition-transform" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <span className="text-[11px] text-ios-gray font-medium text-center truncate w-full">{f.name.slice(0, 4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-ios-card rounded-full flex items-center justify-center shadow-sm border border-ios-separator text-sm">
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

      {/* ============================== */}
      {/* 独立的“添加好友”全屏界面 */}
      {/* ============================== */}
      {showAddFriend && (
        <div className="fixed inset-0 z-[200] bg-ios-bg flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <header className="px-4 pt-12 pb-3 bg-ios-card border-b border-ios-separator flex items-center gap-3 shrink-0">
            <button
              onClick={() => { setShowAddFriend(false); setFriendSearchQuery(''); }}
              className="text-ios-blue active:opacity-70 transition-opacity flex items-center"
            >
              <span className="material-symbols-outlined !text-[24px]">chevron_left</span>
              <span className="text-[17px] font-medium leading-none">返回</span>
            </button>
            <h2 className="flex-1 text-[17px] font-bold text-center pr-6">添加联系人 / 好友</h2>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="bg-ios-card p-4 mb-3 border-b border-ios-separator">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined !text-[20px] text-ios-gray">search</span>
                </div>
                <input
                  className="w-full bg-black/5 rounded-lg pl-10 pr-10 py-2.5 text-[17px] border-none focus:ring-0 transition-all focus:bg-black/10"
                  placeholder="PetConnect ID / 用户昵称"
                  type="text"
                  autoFocus
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                />
                {friendSearchQuery && (
                  <button onClick={() => setFriendSearchQuery('')} className="absolute right-3 inset-y-0 flex items-center text-ios-gray">
                    <span className="material-symbols-outlined !text-[18px]">cancel</span>
                  </button>
                )}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-[14px] text-ios-gray">
                我的 PetConnect ID: <span className="font-mono text-ios-text">pet_{user?.user_metadata?.name?.length ?? '888'}</span>
                <span className="material-symbols-outlined !text-[16px] text-ios-blue cursor-pointer">qr_code_2</span>
              </div>
            </div>

            {friendSearchQuery.trim() ? (
              <div className="bg-ios-card border-y border-ios-separator py-2">
                <div className="px-4 py-2 border-b border-black/5">
                  <span className="text-[13px] font-bold text-ios-gray">搜索结果</span>
                </div>
                {searchedUsers.length > 0 ? (
                  <div>
                    {searchedUsers.map(u => (
                      <div key={u.petConnectId} className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 transition-colors border-b border-black/5 last:border-0">
                        <img src={u.avatar} className="size-12 rounded-full border border-black/5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[16px] leading-tight flex items-center gap-1 mb-0.5">
                            {u.name}
                          </h4>
                          <p className="text-[13px] text-ios-gray truncate">ID: {u.petConnectId} | {u.bio}</p>
                        </div>
                        <button
                          onClick={(e) => handleToggleFollow(u, e)}
                          className={`min-w-[70px] px-3 py-1.5 text-[14px] font-bold rounded-full transition-colors ${followingMap[u.petConnectId!] ? 'bg-black/5 text-ios-gray' : 'bg-ios-blue text-white'}`}
                        >
                          {followingMap[u.petConnectId!] ? '已关注' : '添加好友'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-ios-gray">
                    <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined !text-[32px] opacity-50">person_search</span>
                    </div>
                    <p className="font-medium">未能找到该联系属</p>
                    <p className="text-[13px] mt-1 opacity-70">请检查 ID 或昵称拼写是否正确</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 pt-6">
                <div className="flex items-center gap-4 bg-ios-card p-4 rounded-xl border border-ios-separator shadow-sm active:scale-[0.98] transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-[#00C300] rounded-full flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined !text-[24px]">contacts</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[16px]">手机联系人</p>
                    <p className="text-[13px] text-ios-gray">匹配通讯录里的宠物病友</p>
                  </div>
                  <span className="material-symbols-outlined text-ios-gray">chevron_right</span>
                </div>
              </div>
            )}
          </div>
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
