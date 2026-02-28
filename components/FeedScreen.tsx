
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Post, Product, UserProfile } from '../types';
import { getCurrentLocation } from '../services/qqMapService';
import { useAuthContext } from '../contexts/AuthContext';
import { useSwipeable } from 'react-swipeable';

// ========================
// 1. 商城数据 (原在 MarketScreen，现移入首页)
// ========================
export const MALL_ITEMS = [
  {
    id: 'm1',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
    name: '【官方优选】去骨鲜肉全价粮 2.5kg',
    price: 199,
    originalPrice: 259,
    sales: '已售 3000+',
    tag: '热卖'
  },
  {
    id: 'm2',
    image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=400&h=400&fit=crop',
    name: '宠物专用高弹力牵引绳 夜光款',
    price: 49,
    originalPrice: 65,
    sales: '已售 1500+',
    tag: '新品'
  },
  {
    id: 'm3',
    image: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=400&h=400&fit=crop',
    name: '【双拼大块】深海鱼油主食冻干',
    price: 158,
    originalPrice: 198,
    sales: '已售 800+',
    tag: '特惠'
  }
];

// 模拟全站用户数据 (供昵称/ID 搜索)
const MOCK_USERS: UserProfile[] = [
  { petConnectId: 'pet_001', name: '雪原小狼', bio: '一只爱玩的哈士奇', avatar: 'https://picsum.photos/seed/user1/100/100', bgImage: '', pets: [], isFollowing: true },
  { petConnectId: 'pet_888', name: '喵小白', bio: '专注睡大觉', avatar: 'https://picsum.photos/seed/user2/100/100', bgImage: '', pets: [], isFollowing: false },
  { petConnectId: 'pet_520', name: '鹦鹉螺号', bio: '话痨本痨', avatar: 'https://picsum.photos/seed/user3/100/100', bgImage: '', pets: [], isFollowing: false },
  { petConnectId: 'pet_111', name: 'Wangwang', bio: '我是大黄', avatar: 'https://picsum.photos/seed/user4/100/100', bgImage: '', pets: [], isFollowing: false },
  { petConnectId: 'pet_222', name: '布偶猫一家', bio: '三只小布偶', avatar: 'https://picsum.photos/seed/user5/100/100', bgImage: '', pets: [], isFollowing: true },
  { petConnectId: 'pet_333', name: '阿柴', bio: '柴犬的日常', avatar: 'https://picsum.photos/seed/user6/100/100', bgImage: '', pets: [], isFollowing: false }
];

interface FeedScreenProps {
  userProfile: UserProfile;
  posts: Post[];
  onConsultAI: () => void;
  onPostClick: (post: Post) => void;
  onToggleLike?: (postId: string) => void;
  onShare?: (title: string) => void;
  onNotification?: () => void;
  onAddToCart?: (product: Product) => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ userProfile, posts, onConsultAI, onPostClick, onToggleLike, onShare, onNotification, onAddToCart }) => {
  const { user } = useAuthContext();

  // 顶层四大模块扁平化及顺序定义
  type MainTab = 'following' | 'recommend' | 'local' | 'star' | 'live' | 'video' | 'mall';
  const TAB_ORDER: MainTab[] = ['following', 'recommend', 'local', 'star', 'live', 'mall', 'video'];

  const [activeMainTab, setActiveMainTab] = useState<MainTab>('recommend');

  const [myLocation, setMyLocation] = useState<string>('正在获取位置...');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 简易关注状态管理器，隔离外部影响
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(() =>
    MOCK_USERS.reduce((acc, u) => ({ ...acc, [u.petConnectId!]: !!u.isFollowing }), {})
  );

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const result = await getCurrentLocation();
        setMyLocation(result.formatted);
      } catch (error) {
        console.error('定位失败:', error);
        setMyLocation('定位失败');
      }
    };
    fetchLocation();

    // 点击外部取消搜索高亮状态
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotification = () => {
    // 简单的功能提示
    alert('消息通知功能正在开发中，敬请期待！');
  };

  const filteredPosts = useMemo(() => {
    let result = posts;

    // 如果是同城，只显示 location 字段包含 myLocation 的帖子
    if (activeMainTab === 'local' && myLocation !== '正在获取位置...' && myLocation !== '定位失败' && myLocation) {
      // 为了提高匹配度，我们截取短城市名，或者直接判读字符串是否相互包含
      const shortLocation = myLocation.split('市')[0].split('省').pop() || myLocation;
      result = result.filter(p => p.location && p.location.includes(shortLocation));
    }

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q)
    );
  }, [posts, searchQuery, activeMainTab, myLocation]);

  const searchedUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return MOCK_USERS.filter(u =>
      u.name.toLowerCase().includes(q) ||
      (u.petConnectId && u.petConnectId.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // 配置侧滑手势
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = TAB_ORDER.indexOf(activeMainTab);
      if (currentIndex < TAB_ORDER.length - 1) {
        setActiveMainTab(TAB_ORDER[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const currentIndex = TAB_ORDER.indexOf(activeMainTab);
      if (currentIndex > 0) {
        setActiveMainTab(TAB_ORDER[currentIndex - 1]);
      }
    },
    trackMouse: false, // 避免在桌面端鼠标拖拽干扰滚动
    delta: 50, // 触发距离
    preventScrollOnSwipe: false // 允许纵向正常滚动
  });

  return (
    <div {...swipeHandlers} className="flex flex-col min-h-screen bg-ios-bg overflow-x-hidden">
      <header className="sticky top-0 z-50 ios-blur bg-ios-card/70 border-b border-ios-separator px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 rounded-full border border-ios-separator overflow-hidden">
              <img src={userProfile?.avatar || "https://picsum.photos/seed/user/100/100"} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[17px] font-bold tracking-tight">{userProfile?.name || user?.email?.split('@')[0] || '访客'}</h1>
              <div className="flex items-center gap-1 text-[11px] text-ios-gray">
                <span className="material-symbols-outlined !text-[12px] text-ios-blue material-symbols-fill">location_on</span>
                <span>{myLocation}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 简化版短搜索框 */}
            {activeMainTab !== 'video' && (
              <div className="relative w-[120px]" ref={searchContainerRef}>
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[16px] text-ios-gray">search</span>
                </div>
                <input
                  className="w-full h-8 pl-7 pr-2 bg-ios-bg rounded-lg shadow-inner transition-all duration-300 focus:ring-1 focus:ring-ios-blue border-none"
                  placeholder="搜索好友/动态"
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* --- 浮动搜索下拉面板 --- */}
                {isSearchFocused && searchQuery && (
                  <div className="absolute top-10 right-0 w-[280px] bg-ios-card shadow-2xl rounded-2xl border border-ios-separator overflow-hidden z-[100] max-h-[400px] overflow-y-auto transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-ios-separator bg-ios-bg/20">
                      <span className="text-[11px] font-bold text-ios-gray ml-2">相关用户 / 宠物ID</span>
                    </div>
                    {searchedUsers.length > 0 ? (
                      <div>
                        {searchedUsers.map(u => (
                          <div key={u.petConnectId} className="flex items-center gap-3 p-3 hover:bg-ios-bg transition-colors cursor-pointer border-b border-ios-separator last:border-none">
                            <img src={u.avatar} className="size-10 rounded-full border border-ios-separator" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[14px] leading-tight flex items-center gap-1">
                                {u.name}
                              </h4>
                              <p className="text-[11px] text-ios-gray font-mono mt-0.5">ID: {u.petConnectId}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setFollowingMap(p => ({ ...p, [u.petConnectId!]: !p[u.petConnectId!] })); }}
                              className={`px-3 py-1 text-[12px] font-bold rounded-full transition-colors ${followingMap[u.petConnectId!] ? 'bg-ios-bg text-ios-gray border border-ios-separator' : 'bg-ios-blue text-white'}`}
                            >
                              {followingMap[u.petConnectId!] ? '已关注' : '关注'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-[12px] text-ios-gray">没有搜索到包含此 ID 或用户名的好友</div>
                    )}

                    <div className="p-2 border-t border-ios-separator mt-1 bg-ios-bg/50">
                      <span className="text-[11px] font-bold text-ios-gray ml-2">全站动态搜索: "{searchQuery}"</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button onClick={onNotification} className="text-ios-text bg-ios-bg/80 p-1.5 rounded-full active:scale-95 transition-transform flex-shrink-0 relative">
              <span className="material-symbols-outlined !text-[20px]">notifications</span>
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-ios-red rounded-full border border-ios-card"></div>
            </button>
          </div>
        </div>

        <div className="flex bg-ios-bg/20 shadow-inner rounded-full p-1 mb-1 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveMainTab('following')} className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-full transition-all whitespace-nowrap ${activeMainTab === 'following' ? 'bg-ios-card shadow-sm text-ios-text' : 'text-ios-gray'}`}>
            关注
          </button>
          <button onClick={() => setActiveMainTab('recommend')} className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-full transition-all whitespace-nowrap ${activeMainTab === 'recommend' ? 'bg-ios-card shadow-sm text-ios-text' : 'text-ios-gray'}`}>
            推荐
          </button>
          <button onClick={() => setActiveMainTab('local')} className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-full transition-all whitespace-nowrap ${activeMainTab === 'local' ? 'bg-ios-card shadow-sm text-ios-text' : 'text-ios-gray'}`}>
            同城
          </button>
          <button onClick={() => setActiveMainTab('star')} className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-full transition-all whitespace-nowrap ${activeMainTab === 'star' ? 'bg-ios-card shadow-sm text-ios-text text-amber-500' : 'text-ios-gray'}`}>
            星宠
          </button>
          <button onClick={() => setActiveMainTab('live')} className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-full transition-all whitespace-nowrap ${activeMainTab === 'live' ? 'bg-ios-card shadow-sm text-ios-text text-rose-500' : 'text-ios-gray'}`}>
            直播
          </button>
          <button onClick={() => setActiveMainTab('mall')} className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-full transition-all whitespace-nowrap ${activeMainTab === 'mall' ? 'bg-ios-card shadow-sm text-ios-text' : 'text-ios-gray'}`}>
            官方商城
          </button>
          <button onClick={() => setActiveMainTab('video')} className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-full transition-all whitespace-nowrap ${activeMainTab === 'video' ? 'bg-ios-card shadow-sm text-ios-text' : 'text-ios-gray'}`}>
            短视频
          </button>
        </div>
      </header>

      {/* 主视图渲染调度 */}
      {activeMainTab === 'following' ? (
        // ==========================
        // 关注时间线
        // ==========================
        <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-6 animate-in fade-in duration-300">
          <div className="w-24 h-24 mb-6 bg-ios-bg rounded-full flex items-center justify-center border-4 border-ios-blue/20">
            <span className="material-symbols-outlined text-ios-blue !text-[48px]">group_add</span>
          </div>
          <h2 className="text-xl font-bold mb-2">暂无关注动态</h2>
          <p className="text-ios-gray text-center text-sm leading-relaxed max-w-[240px]">
            去发现更多有趣的宠友并关注他们吧~
          </p>
          <button
            className="mt-6 px-6 py-2.5 bg-ios-blue text-white font-bold rounded-full active:scale-95 transition-transform shadow-lg shadow-ios-blue/30"
            onClick={() => setActiveMainTab('recommend')}
          >
            去推荐页看看
          </button>
        </div>
      ) : activeMainTab === 'star' ? (
        // ==========================
        // 星宠排行榜骨架
        // ==========================
        <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-6 animate-in fade-in duration-300">
          <div className="w-24 h-24 mb-6 bg-gradient-to-tr from-amber-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/30">
            <span className="material-symbols-outlined text-white !text-[48px]">stars</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">星宠排行榜</h2>
          <p className="text-ios-gray text-center leading-relaxed">
            看看本周最受欢迎的明星宠物。<br /> 星宠打榜模块正在酝酿中！
          </p>
          <button
            className="mt-8 px-6 py-3 bg-ios-blue/10 text-ios-blue font-bold rounded-full active:scale-95 transition-transform"
            onClick={() => setActiveMainTab('recommend')}
          >
            返回推荐列表
          </button>
        </div>
      ) : activeMainTab === 'live' ? (
        // ==========================
        // 直播模块骨架
        // ==========================
        <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-6 animate-in fade-in duration-300">
          <div className="w-24 h-24 mb-6 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-3xl flex items-center justify-center shadow-lg shadow-rose-500/30">
            <span className="material-symbols-outlined text-white !text-[48px]">podcasts</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">宠友直播间</h2>
          <p className="text-ios-gray text-center leading-relaxed">
            实时分享与萌宠的欢乐时光。<br /> 直播功能即将上线，敬请期待！
          </p>
          <button
            className="mt-8 px-6 py-3 bg-ios-blue/10 text-ios-blue font-bold rounded-full active:scale-95 transition-transform"
            onClick={() => setActiveMainTab('recommend')}
          >
            返回推荐列表
          </button>
        </div>
      ) : activeMainTab === 'video' ? (
        // ==========================
        // 短视频模块骨架
        // ==========================
        <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-6">
          <div className="w-24 h-24 mb-6 bg-gradient-to-tr from-ios-blue to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white !text-[48px]">play_circle</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">短视频社区模块</h2>
          <p className="text-ios-gray text-center leading-relaxed">
            全新的沉浸式宠物短视频体验正在加紧开发中。<br /> 敬请期待下一个版本更新！
          </p>
          <button
            className="mt-8 px-6 py-3 bg-ios-blue/10 text-ios-blue font-bold rounded-full active:scale-95 transition-transform"
            onClick={() => setActiveMainTab('recommend')}
          >
            返回推荐列表
          </button>
        </div>
      ) : activeMainTab === 'mall' ? (
        // ==========================
        // 官方商城界面
        // ==========================
        <div className="flex-1 pb-24">
          <div className="bg-ios-bg transition-colors duration-300">
            <div className="px-4 mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-bold tracking-tight">热选商品</h2>
            </div>

            {/* 瀑布流/网格样式展现 */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-2">
              {MALL_ITEMS.map(item => (
                <div key={item.id} className="flex flex-col group cursor-pointer">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-ios-card mb-2">
                    <img alt={item.name} className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300" src={item.image} />
                    <div className="absolute top-0 right-0 bg-ios-red text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10 shadow-sm">
                      {item.tag}
                    </div>
                  </div>
                  <h3 className="font-semibold text-[13px] leading-tight line-clamp-2 mb-1 text-ios-text">
                    {item.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-0.5 mt-auto relative">
                    <span className="text-[16px] font-bold text-ios-red">¥{item.price}</span>
                    <span className="text-[11px] text-ios-gray line-through mb-0.5 text-ios-gray/60">¥{item.originalPrice}</span>
                    <button onClick={(e) => { e.stopPropagation(); onAddToCart?.(item); }} className="absolute right-0 bottom-0 w-7 h-7 bg-ios-blue rounded-full flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform">
                      <span className="material-symbols-outlined !text-[16px]">add_shopping_cart</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-ios-gray">{item.sales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ==========================
        // 社区动态双列瀑布流 (Masonry)
        // ==========================
        <div className="pt-2 pb-24 px-1">
          {filteredPosts.length > 0 ? (
            <div className="columns-2 gap-1">
              {filteredPosts.map(post => (
                <article
                  key={post.id}
                  className="bg-ios-card overflow-hidden border-b border-ios-separator shadow-none break-inside-avoid cursor-pointer active:scale-[0.98] transition-all duration-300 mb-0"
                  onClick={() => onPostClick(post)}
                >
                  {/* 首图占据上方 */}
                  <div className="relative w-full bg-ios-bg">
                    {post.video ? (
                      <div className="relative w-full">
                        <video src={post.video} className="w-full h-auto object-cover min-h-[200px]" poster={post.image} />
                        <span className="absolute top-2 right-2 material-symbols-outlined text-white !text-[24px] drop-shadow-md">play_circle</span>
                      </div>
                    ) : (
                      <div className="relative w-full">
                        <img src={post.image} className="w-full h-auto object-cover min-h-[200px]" loading="lazy" />
                        {post.images && post.images.length > 1 && (
                          <span className="absolute top-2 right-2 material-symbols-outlined text-white !text-[16px] drop-shadow-md">photo_library</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 下方正文与作者信息 */}
                  <div className="p-3.5">
                    <h3 className="text-[17px] font-bold leading-snug mb-3 line-clamp-3 text-ios-text">
                      {post.title}
                    </h3>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={post.avatar} className="size-7 rounded-full border border-ios-separator shrink-0" />
                        <span className="text-[14px] text-ios-gray truncate font-medium">{post.author}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleLike?.(post.id); }}
                        className={`flex items-center gap-1.5 shrink-0 transition-transform active:scale-125 ${post.liked ? 'text-ios-red' : 'text-ios-gray'}`}
                      >
                        <span className={`material-symbols-outlined !text-[20px] ${post.liked ? 'material-symbols-fill' : ''}`}>favorite</span>
                        <span className="text-[14px]">{post.likes}</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-ios-gray flex flex-col items-center">
              <span className="material-symbols-outlined !text-[48px] opacity-20 mb-2">search_off</span>
              <p className="text-sm font-medium">没有找到相关动态</p>
            </div>
          )}
        </div>
      )}
    </div >
  );
};

export default FeedScreen;
