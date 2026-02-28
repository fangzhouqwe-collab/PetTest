
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, Post, MarketItem, UserProfile, Comment, Pet, ChatMessage, CartItem, Address, Order, Product } from './types';
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
import NotificationScreen from './components/NotificationScreen';
import CartScreen from './components/CartScreen';
import FavoritesScreen from './components/FavoritesScreen';
import AddressManager from './components/AddressManager';
import OrderHistory from './components/OrderHistory';
import HistoryScreen from './components/HistoryScreen';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';

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
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAItDmawV6z1hMnaU41hKJ2FJAKSSiNKTG0Zye3VKj1PNGsbeunTOCstMv9YI_qSJsLPWExIT-21Rdtf3vc3AydkIlWdPdYm3RO1aDSXXr1FyQ7tjj0iQhd2_m_A2DDp_GkXyoAhx9zbmieYhg_LayA4gE8SF6Nzu8mUy3KwhRTMp7AjbqpNojFCbB2DxMWJLrsVtLjREsgvrxC110kZ8YHhQaZGwEE-bfilsPgK4FaXhkeNrsI9Nf8KKleYjm6VBmsOESs7nTsWmg',
    breed: '波斯猫',
    time: '5小时前',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwemHjkLSWoRHHqf5xbMjrC_Dq7MbGEG41pf9TABn3FNS0EJocgWSXqsnScekVRT9C5vlIMzYKJEjR7Dr2L-24UgjHuogbPTz5yfWy8UQlrzi9L1X0roozwyPX2_jlLiWjHndX6lxpfB8Ok18HYdcMnyXXdCL2XMitZRIhKhfqQ-WvwCkGOrRRtTJ3O8bpbF8ukfi6ZO2Cn9fOBzVdentcmrDMjwDQ2Mem74hI6qiv9liwis9YIoBBdot99cDbF4mwKZ2j-w7MQF4',
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
  following: 450,
  followers: 1240,
  likesReceived: 8920,
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

  // 电商全局状态
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewHistory, setViewHistory] = useState<(Post | MarketItem)[]>([]);
  const [favoriteItemIds, setFavoriteItemIds] = useState<string[]>([]);
  const [shareData, setShareData] = useState<{ title: string, data?: any } | null>(null);

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

      const savedChats = localStorageService.loadChats();
      if (savedChats) {
        setAllChats(savedChats);
      }
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

      // 加载消息列表
      const threads = await messageService.getThreads();
      if (threads.length > 0) {
        const newLastMessages: Record<string, string> = {};
        threads.forEach(t => {
          if (t.lastMessage) {
            newLastMessages[t.id] = t.lastMessage;
          }
        });
        setLastMessages(newLastMessages);
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

  // 加载当前会话的云端消息
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user && currentTab === AppTab.USER_CHAT && chatTarget?.id) {
        try {
          const messages = await messageService.getMessages(chatTarget.id);
          // 哪怕是空数组也设置，以覆盖本地可能的旧数据（或者合并？）
          // 这里选择直接覆盖，即以云端为准
          if (messages) {
            setAllChats(prev => ({
              ...prev,
              [chatTarget.id]: messages
            }));
          }
        } catch (error) {
          console.error('加载历史消息失败:', error);
        }
      }
    };
    loadChatHistory();
  }, [user, currentTab, chatTarget?.id]);

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

  const handleShare = (title: string, data?: any) => {
    setShareData({ title, data });
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [{ id: `c_${Date.now()}`, productId: product.id, product, quantity: 1, selected: true }, ...prev];
    });
    setShareMessage(`已添加至购物车`);
    setTimeout(() => setShareMessage(null), 2000);
  };

  const handleSendMessage = async (targetId: string, message: ChatMessage) => {
    // 乐观更新（立即显示）
    // 注意：如果是云端模式，我们可能需要等待后端返回真实 ID 和 timestamp
    // 但为了体验，先显示 pending 状态或直接显示

    // 更新本地状态
    setAllChats(prev => {
      const updated = {
        ...prev,
        [targetId]: [...(prev[targetId] || []), message]
      };

      // 仅在演示模式下保存到 localStorage
      if (!user) {
        localStorageService.saveChats(updated);
      }
      return updated;
    });

    // 更新最近消息列表
    if (message.text) {
      setLastMessages(prev => ({
        ...prev,
        [targetId]: message.text || '[图片]'
      }));
    }

    // 云端同步
    if (user) {
      try {
        const sentMsg = await messageService.sendMessage(
          targetId,
          message.text || '',
          message.image,
          message.video
        );

        if (sentMsg) {
          // 如果后端返回了完整消息（包含真实 ID），可以在这里更新本地状态中的那条消息
          // 但简单起见，我们假设乐观更新是足够的，或者之后重新加载时会修正
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        // 可以添加 UI 提示发送失败
      }
    }
  };

  const handlePublish = async (newPost: Partial<Post>) => {
    // 如果用户已登录，使用后端 API
    if (user) {
      const created = await postService.createPost({
        title: newPost.title || '无标题',
        content: newPost.content || '',
        image_url: newPost.image,
        video_url: newPost.video, // 传递视频 URL
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
        title: newPost.title || '无标题',
        content: newPost.content || '',
        breed: newPost.breed || '我家宠宝',
        time: '刚刚',
        image: newPost.image || 'https://picsum.photos/seed/new/400/400',
        likes: 0,
        comments: 0,
        commentsList: [],
        location: newPost.location,
        isMine: true,
        video: newPost.video // 本地状态也保存 video
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
        breed: newItem.breed,
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
        breed: newItem.breed || '未知',
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
        image_url: pet.img,
        gender: pet.gender,
        birthday: pet.birthday,
        weight: pet.weight,
        vaccineStatus: pet.vaccineStatus,
        dewormed: pet.dewormed
      });
    }

    setUserProfile(prev => ({
      ...prev,
      pets: [...prev.pets, pet]
    }));
  };

  const handleDeletePet = async (petId: string) => {
    if (user) {
      const success = await userService.deletePet(petId);
      if (!success) {
        setShareMessage?.("删除失败，请稍后重试");
        setTimeout(() => setShareMessage?.(null), 2000);
        return;
      }
    }

    setUserProfile(prev => ({
      ...prev,
      pets: prev.pets.filter(p => p.id !== petId)
    }));
    setShareMessage?.("宠宝资料已删除");
    setTimeout(() => setShareMessage?.(null), 2000);
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
      <div className="min-h-screen flex items-center justify-center bg-ios-bg transition-colors duration-500">
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
        return <FeedScreen userProfile={userProfile} posts={posts} onConsultAI={() => navigateTo(AppTab.AI_CHAT)} onPostClick={(p) => {
          setSelectedPost(p);
          setViewHistory(prev => [p, ...prev.filter(i => i.id !== p.id)]);
          navigateTo(AppTab.POST_DETAIL);
        }} onToggleLike={toggleLike} onShare={(t) => handleShare(t, { image: posts.find(p => p.title === t)?.image })} />;
      case AppTab.MARKET:
        return <MarketScreen items={marketItems} onItemClick={(i) => {
          setSelectedItem(i);
          setViewHistory(prev => [i, ...prev.filter(item => item.id !== i.id)]);
          navigateTo(AppTab.MARKET_DETAIL);
        }} onPublishClick={() => navigateTo(AppTab.PUBLISH)} />;
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
          marketItems={marketItems}
          onUpdateProfile={handleUpdateProfile}
          onAddPet={handleAddPet}
          onDeletePet={handleDeletePet}
          onLogout={() => {
            setIsAuthenticated(false);
            setCurrentTab(AppTab.HOME);
            setHistory([]);
          }}
          onPostClick={(p) => {
            setSelectedPost(p);
            setViewHistory(prev => [p, ...prev.filter(i => i.id !== p.id)]);
            navigateTo(AppTab.POST_DETAIL);
          }}
          onItemClick={(i) => {
            setSelectedItem(i);
            setViewHistory(prev => [i, ...prev.filter(item => item.id !== i.id)]);
            navigateTo(AppTab.MARKET_DETAIL);
          }}
          onNavigate={navigateTo}
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
          onShare={(t) => handleShare(t, selectedPost)}
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
        return <DetailView
          type="market"
          data={selectedItem}
          onBack={goBack}
          onChat={async (n, a) => {
            if (!user) return;
            if (selectedItem?.userId) {
              const threadId = await messageService.createThread(selectedItem.userId);
              if (threadId) {
                setChatTarget({ id: threadId, name: n, avatar: a });
                navigateTo(AppTab.USER_CHAT);
              }
            } else {
              setChatTarget({ id: `chat_${Date.now()}`, name: n, avatar: a });
              navigateTo(AppTab.USER_CHAT);
            }
          }}
          onShare={(t) => handleShare(t, selectedItem)}
          onAddToCart={handleAddToCart}
          isFavorite={selectedItem ? favoriteItemIds.includes(selectedItem.id) : false}
          onToggleFavorite={() => {
            if (!selectedItem) return;
            setFavoriteItemIds(prev => {
              const next = prev.includes(selectedItem.id) ? prev.filter(id => id !== selectedItem.id) : [...prev, selectedItem.id];
              setShareMessage(next.includes(selectedItem.id) ? "已添加至收藏" : "已取消收藏");
              setTimeout(() => setShareMessage(null), 2000);
              return next;
            });
          }}
        />;
      case AppTab.NOTIFICATIONS:
        return <NotificationScreen onBack={goBack} />;
      case AppTab.CART:
        return <CartScreen
          cartItems={cartItems}
          onUpdateQuantity={(id, d) => setCartItems(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))}
          onToggleSelect={(id) => setCartItems(p => p.map(i => i.id === id ? { ...i, selected: !i.selected } : i))}
          onToggleSelectAll={() => {
            const all = cartItems.length > 0 && cartItems.every(i => i.selected);
            setCartItems(p => p.map(i => ({ ...i, selected: !all })));
          }}
          onDelete={(id) => setCartItems(p => p.filter(i => i.id !== id))}
          onCheckout={() => {
            const selected = cartItems.filter(i => i.selected);
            if (selected.length === 0) return;
            const newOrder: Order = {
              id: Date.now().toString(),
              items: selected,
              totalAmount: selected.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
              status: 'pending',
              createdAt: new Date().toISOString(),
              address: addresses.find(a => a.isDefault) || addresses[0] || { id: '0', receiver: '未设置地址', phone: '', region: '', detail: '', isDefault: true }
            };
            setOrders(prev => [newOrder, ...prev]);
            setCartItems(p => p.filter(i => !i.selected)); // 结算后清空选中的购物车项
            navigateTo(AppTab.ORDERS);
          }}
          onBack={goBack}
        />;
      case AppTab.FAVORITES:
        return <FavoritesScreen
          items={marketItems.filter(i => favoriteItemIds.includes(i.id))}
          onBack={goBack}
          onItemClick={(i) => {
            setSelectedItem(i);
            setViewHistory(prev => [i, ...prev.filter(item => item.id !== i.id)]);
            navigateTo(AppTab.MARKET_DETAIL);
          }}
          onRemoveFavorite={(id) => {
            setFavoriteItemIds(prev => prev.filter(fid => fid !== id));
            setShareMessage("已取消收藏");
            setTimeout(() => setShareMessage(null), 2000);
          }}
        />;
      case AppTab.ADDRESS:
        return <AddressManager
          addresses={addresses}
          onAddAddress={(a) => setAddresses(p => {
            const isDefault = p.length === 0 ? true : a.isDefault; // 发出第一个必定默认为true
            let next = [...p, { ...a, id: Date.now().toString(), isDefault }];
            if (isDefault) next = next.map(i => ({ ...i, isDefault: i.id === next[next.length - 1].id }));
            return next;
          })}
          onUpdateAddress={(id, a) => setAddresses(p => {
            let next = p.map(i => i.id === id ? { ...i, ...a } : i);
            if (a.isDefault) next = next.map(i => ({ ...i, isDefault: i.id === id }));
            return next;
          })}
          onDeleteAddress={(id) => setAddresses(p => p.filter(i => i.id !== id))}
          onSetDefault={(id) => setAddresses(p => p.map(i => ({ ...i, isDefault: i.id === id })))}
          onBack={goBack}
        />;
      case AppTab.ORDERS:
        return <OrderHistory
          orders={orders}
          onBack={goBack}
          onNavigate={navigateTo}
          onPay={(id) => setOrders(p => p.map(o => o.id === id ? { ...o, status: 'completed' } : o))}
        />;
      case AppTab.HISTORY:
        return <HistoryScreen
          historyItems={viewHistory}
          onBack={goBack}
          onClear={() => setViewHistory([])}
        />;
      default:
        return <FeedScreen
          posts={posts}
          onConsultAI={() => navigateTo(AppTab.AI_CHAT)}
          onPostClick={(p) => { setSelectedPost(p); navigateTo(AppTab.POST_DETAIL); }}
          onToggleLike={toggleLike}
          onShare={handleShare}
          onNotification={() => navigateTo(AppTab.NOTIFICATIONS)}
          onAddToCart={handleAddToCart}
        />;
    }
  };

  const hideNav = [AppTab.AI_CHAT, AppTab.PUBLISH, AppTab.POST_DETAIL, AppTab.MARKET_DETAIL, AppTab.USER_CHAT, AppTab.NOTIFICATIONS, AppTab.CART, AppTab.ADDRESS, AppTab.ORDERS, AppTab.HISTORY].includes(currentTab);

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg transition-colors duration-500">
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
      {shareData && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShareData(null)}>
          <div className="bg-ios-card rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl transition-all duration-300" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-[4/5] bg-ios-bg w-full">
              {shareData.data?.image ? (
                <img src={shareData.data.image} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-ios-blue/20 to-purple-500/20">
                  <span className="material-symbols-outlined !text-[80px] text-white drop-shadow-md">pets</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h2 className="text-2xl font-bold mb-2 leading-tight drop-shadow-md">{shareData.title}</h2>
                {shareData.data?.price && (
                  <p className="text-ios-red font-bold text-xl drop-shadow-md">¥{shareData.data.price}</p>
                )}
                {shareData.data?.author && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={shareData.data.avatar} className="size-6 rounded-full border border-white" />
                    <span className="text-sm font-medium opacity-90">{shareData.data.author}</span>
                  </div>
                )}
              </div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-xl p-2 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">qr_code_2</span>
              </div>
            </div>

            <div className="p-6">
              <p className="text-center text-[15px] font-bold text-ios-text mb-6">分享给朋友长按即可保存图片</p>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => setShareData(null)} className="flex flex-col items-center gap-2">
                  <div className="size-12 bg-green-500 rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined">chat</span></div>
                  <span className="text-xs font-medium">微信好友</span>
                </button>
                <button onClick={() => setShareData(null)} className="flex flex-col items-center gap-2">
                  <div className="size-12 bg-green-600 rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined">group</span></div>
                  <span className="text-xs font-medium">朋友圈</span>
                </button>
                <button onClick={() => setShareData(null)} className="flex flex-col items-center gap-2">
                  <div className="size-12 bg-blue-500 rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined">download</span></div>
                  <span className="text-xs font-medium">保存本地</span>
                </button>
              </div>
              <button onClick={() => setShareData(null)} className="w-full mt-6 py-3 bg-ios-bg rounded-2xl text-[15px] font-bold text-ios-gray">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
