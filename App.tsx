
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, Post, MarketItem, UserProfile, Comment, Pet, ChatMessage } from './types';
import FeedScreen from './components/FeedScreen';
import MarketScreen, { MARKET_ITEMS as INITIAL_MARKET_ITEMS } from './components/MarketScreen';
import PublishScreen from './components/PublishScreen';
import MessageScreen from './components/MessageScreen';
import ProfileScreen from './components/ProfileScreen';
import AIChatScreen from './components/AIChatScreen';
import UserChatScreen from './components/UserChatScreen';
import Navigation from './components/Navigation';
import DetailView from './components/DetailView';
import AuthScreen from './components/AuthScreen';
import UserSwitcher from './components/UserSwitcher';
import { useAuthContext } from './contexts/AuthContext';

// 后端服务
import * as postService from './services/postService';
import * as marketService from './services/marketService';
import * as userService from './services/userService';
import * as messageService from './services/messageService';
import * as testUserService from './services/testUserService';
import * as localStorageService from './services/localStorageService';

// 演示数据（仅在未登录时使用）
const DEMO_POSTS: Post[] = [
  {
    id: '1',
    author: '莎拉与爪爪',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBacANpINvTclHf-deLtfLOYABw-4MZaeSj06sVjnEicrX7hNUIdifZ718DOHwOOsrwvY6wFUpay_xug4nl6En-rvkBZEiJURcnKtmyQ3RHUHkCWldOgu1o4krrqbmlB9WLCsHl0OYf7aWn8_-jhlgVE3-jadogLhwp3fJhEh-pKD5rS1TGfK6svoQE1QehzC38QYv76kQ08wMIAvcwGv9swPNKQwsuHMv8RZbxXjEvvC80PISRsB7sVkZkqzJlZa6vJF1QSlgcrIU',
    breed: '金毛寻回犬',
    time: '2小时前',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzRzrQXxwdHvLW03x2pbHdM0rN-NBaBz0kA1eD_5C6goWPauGhM8DF4qXVCSOiZCWKuDWusAdLm_lpPe_EqKVrm83C98bpkZz1cmnZZbw7I4Rgne-VT7h1c-or_DpmjCCtkaolObc9kx3TlyRUDnK4S6ygnePww7TBq42AYLX8P2LFQYHbXKWt6F9CusUa2_y0jFhOwSRgaPT2MObVj0_1EHBb36bRvZ8OimWHf9Magexil6qYHTWEeK-I0Ejl_JAa5fINJwMC5rE',
    title: '金毛 Cooper',
    content: '在公园享受阳光明媚的一天！Cooper 终于学会了如何正确地玩接球。🎾',
    likes: 1200,
    comments: 1,
    commentsList: [{ id: 'c1', author: '小明', avatar: 'https://picsum.photos/seed/c1/100/100', text: '太可爱了！', time: '1小时前' }],
    location: '上海 世纪公园'
  },
  {
    id: '2',
    author: '马库斯喵',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAItDmawV6z1hMnaU41hKJ2FJAKSSiNKTG0Zye3VKj1PNGsbeunTOCstMv9YI_qSJsLPWExIT-21Rdtf3vc3AydkIlWdPdYm3RO1aDSvXr1FyQ7tjj0iQhd2_m_A2DDp_GkXyoAhx9zbmieYhg_LayA4gE8SF6Nzu8mUy3KwhRTMp7AjbqpNojFCbB2DxMWJLrsVtLjREsgvrxC110kZ8YHhQaZGwEE-bfilsPgK4FaXhkeNrsI9Nf8KKleYjm6VBmsOESs7nTsWmg',
    breed: '波斯猫',
    time: '5小时前',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwemHjkLSWoRHHqf5xbMjrC_Dq7MbGEG41pf9TABn3FNS0EJocgWSXqsnScekVRT9C5vlIMzYKJEjR7Dr2L-24UgjHuogbPTz5yfWy8UQlrzi9L1X0roozwyPX2_jlLiWjHndX6lxpfB8Ok18HYdcMnyxXdCL2XMitZRIhKhfqQ-WvwCkGOrRRtTJ3O8bpbF8ukfi6ZO2Cn9fOBzVdentcmrDMjwDQ2Mem74hI6qiv9liwis9YIoBBdot99cDbF4mwKZ2j-w7MQF4',
    title: '与 Luna 的懒散周日',
    content: 'Luna 已经连续睡了 16 个小时。我真希望我也能过上她的生活。☁️',
    likes: 3421,
    comments: 0,
    liked: true,
    location: '北京 三里屯'
  }
];

const DEMO_CHATS: Record<string, ChatMessage[]> = {
  '1': [
    { id: '1-1', sender: 'other', text: '你好，请问那只金毛还在线吗？', timestamp: new Date() },
  ],
  '2': [
    { id: '2-1', sender: 'other', text: '感谢您的反馈，我们会尽快处理。', timestamp: new Date() },
  ],
  '3': [
    { id: '3-1', sender: 'other', text: '[图片]', timestamp: new Date() },
  ]
};

const DEMO_USER: UserProfile = {
  name: '亚历克斯·约翰逊',
  bio: '金毛寻回犬狂热爱好者 & 兼职遛狗人。享受与狗狗们在一起的生活。',
  avatar: 'https://picsum.photos/seed/user/200/200',
  bgImage: 'https://picsum.photos/seed/bg/800/400',
  pets: [
    { name: '露娜', breed: '金毛寻回犬', img: 'https://picsum.photos/seed/luna/300/300' },
    { name: '麦克斯', breed: '虎斑猫', img: 'https://picsum.photos/seed/max/300/300' }
  ]
};

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.HOME);
  const [history, setHistory] = useState<AppTab[]>([]);
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET_ITEMS);
  const [allChats, setAllChats] = useState<Record<string, ChatMessage[]>>(DEMO_CHATS);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEMO_USER);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [chatTarget, setChatTarget] = useState<{ id: string, name: string, avatar: string } | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  // 跟踪各聊天的最新消息 { chatId: lastMessage }
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});
  // 测试用户（演示模式）
  const [testUser, setTestUser] = useState(testUserService.getCurrentTestUser());
  const [refreshKey, setRefreshKey] = useState(0);

  // 初始化测试消息数据和加载本地数据
  // 初始化测试消息数据和加载本地数据
  useEffect(() => {
    testUserService.initTestMessages();

    // 只有在未认证且无用户时才加载本地存储的数据（演示模式）
    if (!isAuthenticated && !user) {
      const savedPosts = localStorageService.loadPosts();
      if (savedPosts && savedPosts.length > 0) {
        setPosts(savedPosts);
      } else {
        setPosts(DEMO_POSTS);
      }

      const savedItems = localStorageService.loadMarketItems();
      if (savedItems && savedItems.length > 0) {
        setMarketItems(savedItems);
      } else {
        setMarketItems(INITIAL_MARKET_ITEMS);
      }

      // 注意：不要加载用户资料，除非明确是演示模式
      // 这里默认重置为 DEMO_USER，确保登出后不显示上一个用户的资料
      setUserProfile(DEMO_USER);
    }
  }, [isAuthenticated, user]);

  // 从后端加载数据
  const loadData = useCallback(async () => {
    if (!user) return;

    setDataLoading(true);
    try {
      // 并行加载所有数据
      const [postsData, marketData, profileData] = await Promise.all([
        postService.getPosts(),
        marketService.getMarketItems(),
        userService.getCurrentUserProfile()
      ]);

      if (postsData.length > 0) {
        setPosts(postsData);
      }
      if (marketData.length > 0) {
        setMarketItems(marketData);
      }
      if (profileData) {
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  // 用户登录后加载数据
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      loadData();
    }
  }, [user, loadData]);

  const navigateTo = (tab: AppTab) => {
    setHistory(prev => [...prev, currentTab]);
    setCurrentTab(tab);
  };

  const goBack = () => {
    const prev = history.pop();
    if (prev) {
      setCurrentTab(prev);
      setHistory([...history]);
    } else {
      setCurrentTab(AppTab.HOME);
    }
  };

  const handleShare = (title: string) => {
    setShareMessage(`已生成分享卡片: ${title}`);
    setTimeout(() => setShareMessage(null), 2000);
  };

  const handleSendMessage = (targetId: string, message: ChatMessage) => {
    setAllChats(prev => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), message]
    }));
    // 更新最新消息记录
    if (message.text) {
      setLastMessages(prev => ({
        ...prev,
        [targetId]: message.text || '[图片]'
      }));
    }
  };

  const handlePublish = async (newPost: Partial<Post>) => {
    // 如果用户已登录，使用后端 API
    if (user) {
      const created = await postService.createPost({
        title: newPost.title || '无标题',
        content: newPost.content || '',
        image_url: newPost.image,
        location: newPost.location
      });
      if (created) {
        setPosts(prev => [created, ...prev]);
      }
    } else {
      // 演示模式：本地添加
      const post: Post = {
        id: Date.now().toString(),
        author: userProfile.name,
        avatar: userProfile.avatar,
        breed: '我家宠宝',
        time: '刚刚',
        image: newPost.image || 'https://picsum.photos/seed/new/400/400',
        title: newPost.title || '无标题',
        content: newPost.content || '',
        likes: 0,
        comments: 0,
        commentsList: [],
        location: newPost.location,
        isMine: true
      };
      setPosts(prev => {
        const updated = [post, ...prev];
        localStorageService.savePosts(updated);
        return updated;
      });
    }
    setCurrentTab(AppTab.HOME);
  };

  const handlePublishItem = async (newItem: Partial<MarketItem>) => {
    if (user) {
      const created = await marketService.createMarketItem({
        name: newItem.name || '宝贝',
        image_url: newItem.image,
        price: newItem.price || 0,
        category: newItem.category || '其他',
        age: newItem.age,
        gender: newItem.gender,
        location: newItem.location,
        description: newItem.description
      });
      if (created) {
        setMarketItems(prev => [created, ...prev]);
      }
    } else {
      const item: MarketItem = {
        id: Date.now().toString(),
        name: newItem.name || '宝贝',
        image: newItem.image || 'https://picsum.photos/seed/item/400/400',
        price: newItem.price || 0,
        category: newItem.category || '其他',
        verified: true,
        age: newItem.age || '未知',
        gender: newItem.gender || '公',
        location: newItem.location || '上海',
        distance: 0.1,
        isMine: true
      };
      setMarketItems(prev => {
        const updated = [item, ...prev];
        localStorageService.saveMarketItems(updated);
        return updated;
      });
    }
    setCurrentTab(AppTab.MARKET);
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (user) {
      const comment = await postService.addComment(postId, text);
      if (comment) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const updated = { ...p, comments: p.comments + 1, commentsList: [...(p.commentsList || []), comment] };
            if (selectedPost?.id === postId) setSelectedPost(updated);
            return updated;
          }
          return p;
        }));
      }
    } else {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: userProfile.name,
        avatar: userProfile.avatar,
        text,
        time: '刚刚'
      };
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const updated = { ...p, comments: p.comments + 1, commentsList: [...(p.commentsList || []), newComment] };
          if (selectedPost?.id === postId) setSelectedPost(updated);
          return updated;
        }
        return p;
      }));
    }
  };

  const toggleLike = async (postId: string) => {
    if (user) {
      await postService.toggleLike(postId);
    }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updated = { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
        if (selectedPost?.id === postId) setSelectedPost(updated);
        return updated;
      }
      return p;
    }));
  };

  const handleAddPet = async (pet: Pet) => {
    if (user) {
      await userService.addPet({
        name: pet.name,
        breed: pet.breed,
        image_url: pet.img
      });
    }

    setUserProfile(prev => ({
      ...prev,
      pets: [...prev.pets, pet]
    }));
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    if (user) {
      await userService.updateUserProfile({
        name: newProfile.name,
        bio: newProfile.bio,
        avatar_url: newProfile.avatar,
        bg_image_url: newProfile.bgImage
      });
    }
    setUserProfile(newProfile);
    localStorageService.saveUserProfile(newProfile);
  };

  // 认证检查
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-ios-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="material-symbols-outlined !text-[36px] text-ios-blue material-symbols-fill">pets</span>
          </div>
          <p className="text-ios-gray">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录且未选择演示模式
  if (!isAuthenticated && !user) {
    return <AuthScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderScreen = () => {
    switch (currentTab) {
      case AppTab.HOME:
        return <FeedScreen posts={posts} onConsultAI={() => navigateTo(AppTab.AI_CHAT)} onPostClick={(p) => { setSelectedPost(p); navigateTo(AppTab.POST_DETAIL); }} onToggleLike={toggleLike} onShare={handleShare} />;
      case AppTab.MARKET:
        return <MarketScreen items={marketItems} onItemClick={(i) => { setSelectedItem(i); navigateTo(AppTab.MARKET_DETAIL); }} />;
      case AppTab.PUBLISH:
        return <PublishScreen onCancel={goBack} onSelectAI={() => navigateTo(AppTab.AI_CHAT)} onPublish={handlePublish} onPublishItem={handlePublishItem} />;
      case AppTab.MESSAGES:
        return <MessageScreen
          onOpenAIChat={() => navigateTo(AppTab.AI_CHAT)}
          onUserClick={(id, n, a) => { setChatTarget({ id, name: n, avatar: a }); navigateTo(AppTab.USER_CHAT); }}
          lastMessages={lastMessages}
        />;
      case AppTab.PROFILE:
        return <ProfileScreen
          user={userProfile}
          posts={posts}
          onUpdateProfile={handleUpdateProfile}
          onAddPet={handleAddPet}
          onLogout={() => {
            setIsAuthenticated(false);
            setCurrentTab(AppTab.HOME);
            setHistory([]);
          }}
        />;
      case AppTab.AI_CHAT:
        return <AIChatScreen onBack={goBack} />;
      case AppTab.USER_CHAT:
        return <UserChatScreen
          onBack={goBack}
          targetId={chatTarget?.id || ""}
          targetName={chatTarget?.name || "用户"}
          targetAvatar={chatTarget?.avatar}
          messages={allChats[chatTarget?.id || ""] || []}
          onSendMessage={handleSendMessage}
        />;
      case AppTab.POST_DETAIL:
        return <DetailView
          type="post"
          data={selectedPost}
          onBack={goBack}
          onAddComment={handleAddComment}
          onToggleLike={toggleLike}
          onShare={handleShare}
          onChat={async (name, avatar) => {
            if (!user || userProfile.name === name) return; // 不能聊自己
            // 如果有 userId（Post 接口已更新），可以创建真实会话
            // 这里简化：使用 Post 对象中的 userId
            if (selectedPost?.userId) {
              const threadId = await messageService.createThread(selectedPost.userId);
              if (threadId) {
                setChatTarget({ id: threadId, name, avatar });
                navigateTo(AppTab.USER_CHAT);
              }
            } else {
              // 兼容旧数据或演示模式
              setChatTarget({ id: `chat_${Date.now()}`, name, avatar });
              navigateTo(AppTab.USER_CHAT);
            }
          }}
        />;
      case AppTab.MARKET_DETAIL:
        return <DetailView type="market" data={selectedItem} onBack={goBack} onChat={(n, a) => { setChatTarget({ id: 'seller', name: n, avatar: a }); navigateTo(AppTab.USER_CHAT); }} onShare={handleShare} />;
      case AppTab.NOTIFICATIONS:
        return <NotificationScreen onBack={goBack} />;
      default:
        return <FeedScreen
          posts={posts}
          onConsultAI={() => navigateTo(AppTab.AI_CHAT)}
          onPostClick={(p) => { setSelectedPost(p); navigateTo(AppTab.POST_DETAIL); }}
          onToggleLike={toggleLike}
          onShare={handleShare}
          onNotification={() => navigateTo(AppTab.NOTIFICATIONS)} // 添加跳转
        />;
    }
  };

  const hideNav = [AppTab.AI_CHAT, AppTab.PUBLISH, AppTab.POST_DETAIL, AppTab.MARKET_DETAIL, AppTab.USER_CHAT, AppTab.NOTIFICATIONS].includes(currentTab);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {dataLoading && (
        <div className="fixed top-0 left-0 right-0 z-[1000] h-1 bg-ios-blue/20">
          <div className="h-full bg-ios-blue animate-pulse" style={{ width: '60%' }}></div>
        </div>
      )}
      <main className={`flex-1 ${hideNav ? '' : 'pb-24'} overflow-y-auto no-scrollbar`}>
        {renderScreen()}
      </main>
      {!hideNav && (
        <Navigation activeTab={currentTab} onTabChange={navigateTo} />
      )}
      {shareMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-black/80 text-white px-6 py-2 rounded-full text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          {shareMessage}
        </div>
      )}
      {/* 用户切换器（仅演示模式） */}
      {!user && isAuthenticated && (
        <UserSwitcher
          onUserChange={(newUser) => {
            setTestUser(newUser);
            setRefreshKey(prev => prev + 1);
            // 重置到首页
            setCurrentTab(AppTab.HOME);
            setHistory([]);
          }}
        />
      )}
    </div>
  );
};

export default App;
