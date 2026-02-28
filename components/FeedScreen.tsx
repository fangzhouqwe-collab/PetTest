
import React, { useState, useEffect, useMemo } from 'react';
import { Post } from '../types';
import { getCurrentLocation } from '../services/qqMapService';

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

interface FeedScreenProps {
  posts: Post[];
  onConsultAI: () => void;
  onPostClick: (post: Post) => void;
  onToggleLike?: (postId: string) => void;
  onShare?: (title: string) => void;
  onNotification?: () => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ posts, onConsultAI, onPostClick, onToggleLike, onShare, onNotification }) => {
  // 顶层三大模块 ('community' = 社区动态 | 'mall' = 官方商城 | 'video' = 短视频)
  const [activeMainTab, setActiveMainTab] = useState<'community' | 'mall' | 'video'>('community');

  const [myLocation, setMyLocation] = useState<string>('正在获取位置...');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'推荐' | '同城'>('推荐');

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
  }, []);

  const handleNotification = () => {
    // 简单的功能提示
    alert('消息通知功能正在开发中，敬请期待！');
  };

  const filteredPosts = useMemo(() => {
    let result = posts;

    // 如果是同城，只显示 location 字段包含 myLocation 的帖子
    if (activeTab === '同城' && myLocation !== '正在获取位置...' && myLocation !== '定位失败' && myLocation) {
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
  }, [posts, searchQuery, activeTab, myLocation]);

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg">
      <header className="sticky top-0 z-50 ios-blur bg-white/70 border-b border-black/5 px-4 pt-12 pb-4">
        {/* === 新增：首页最上方三级切换导航 === */}
        <div className="flex bg-black/5 p-1 rounded-full relative w-full mb-4">
          <button onClick={() => setActiveMainTab('community')} className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-all ${activeMainTab === 'community' ? 'bg-white shadow-sm text-black' : 'text-ios-gray'}`}>
            社区动态
          </button>
          <button onClick={() => setActiveMainTab('mall')} className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-all ${activeMainTab === 'mall' ? 'bg-white shadow-sm text-black' : 'text-ios-gray'}`}>
            官方商城
          </button>
          <button onClick={() => setActiveMainTab('video')} className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-all ${activeMainTab === 'video' ? 'bg-white shadow-sm text-black' : 'text-ios-gray'}`}>
            短视频
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 rounded-full border border-black/5 overflow-hidden">
              <img src="https://picsum.photos/seed/user/100/100" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[17px] font-bold tracking-tight">宠物社区</h1>
              <div className="flex items-center gap-1 text-[11px] text-ios-gray">
                <span className="material-symbols-outlined !text-[12px] text-ios-blue material-symbols-fill">location_on</span>
                <span>{myLocation}</span>
              </div>
            </div>
          </div>
          <button onClick={onNotification} className="text-black bg-black/5 p-1.5 rounded-full active:scale-95 transition-transform">
            <span className="material-symbols-outlined !text-[20px]">notifications</span>
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-ios-red rounded-full border border-white"></div>
          </button>
        </div>
        {/* 搜索与二级切换仅在“社区动态”和“官方商城”下显示 */}
        {activeMainTab !== 'video' && (
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[20px] text-ios-gray">search</span>
            </div>
            <input
              className="w-full h-9 pl-10 bg-black/5 border-none rounded-lg text-[17px] focus:ring-0 placeholder:text-ios-gray transition-all focus:bg-black/10"
              placeholder={activeMainTab === 'community' ? "搜索宠物、动态或用户..." : "搜索心仪好物..."}
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
        )}

        {/* Tab Switcher - 推荐/同城 (只有在社区形态存在) */}
        {activeMainTab === 'community' && (
          <div className="flex bg-black/5 p-1 rounded-full mt-4 relative w-[160px] mx-auto">
            <div className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ${activeTab === '同城' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}></div>
            <button
              onClick={() => setActiveTab('推荐')}
              className={`flex-1 relative z-10 py-1.5 text-[14px] font-bold transition-colors ${activeTab === '推荐' ? 'text-black' : 'text-ios-gray'}`}
            >
              推荐
            </button>
            <button
              onClick={() => setActiveTab('同城')}
              className={`flex-1 relative z-10 py-1.5 text-[14px] font-bold transition-colors ${activeTab === '同城' ? 'text-black' : 'text-ios-gray'}`}
            >
              同城
            </button>
          </div>
        )}
      </header>

      {/* 主视图渲染调度 */}
      {activeMainTab === 'video' ? (
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
            onClick={() => setActiveMainTab('community')}
          >
            返回社区动态
          </button>
        </div>
      ) : activeMainTab === 'mall' ? (
        // ==========================
        // 官方商城界面
        // ==========================
        <div className="flex-1 pb-24">
          <div className="bg-white pt-5 pb-6">
            <div className="px-4 mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-bold tracking-tight">热选商品</h2>
            </div>

            {/* 瀑布流/网格样式展现 */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-2">
              {MALL_ITEMS.map(item => (
                <div key={item.id} className="flex flex-col group cursor-pointer">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-ios-bg mb-2">
                    <img alt={item.name} className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300" src={item.image} />
                    <div className="absolute top-0 right-0 bg-ios-red text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10 shadow-sm">
                      {item.tag}
                    </div>
                  </div>
                  <h3 className="font-semibold text-[13px] leading-tight line-clamp-2 mb-1 text-[#1C1C1E]">
                    {item.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-0.5 mt-auto">
                    <span className="text-[16px] font-bold text-ios-red">¥{item.price}</span>
                    <span className="text-[11px] text-ios-gray line-through mb-0.5">¥{item.originalPrice}</span>
                  </div>
                  <span className="text-[10px] text-ios-gray">{item.sales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ==========================
        // 原有的社区动态列表
        // ==========================
        <>
          <div className="px-4 py-4">
            <div className="bg-gradient-to-br from-ios-green/10 to-emerald-100 rounded-2xl p-4 shadow-sm border border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-xl w-12 h-12 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-ios-green text-[28px] material-symbols-fill">psychology</span>
                </div>
                <div>
                  <h4 className="text-[16px] font-bold">AI 宠医专家</h4>
                  <p className="text-[12px] text-ios-gray">全天候 1对1 健康咨询</p>
                </div>
              </div>
              <button onClick={onConsultAI} className="bg-ios-green text-white text-[13px] font-bold px-4 py-2 rounded-full active:opacity-70 shadow-sm transition-all hover:shadow-md">立即咨询</button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length > 0 ? filteredPosts.map(post => (
              <article key={post.id} className="bg-white mb-2 pb-4 cursor-pointer animate-in fade-in duration-300" onClick={() => onPostClick(post)}>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full overflow-hidden border border-black/5">
                      <img src={post.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-semibold">{post.author}</h4>
                      <p className="text-[11px] text-ios-gray">{post.breed} • {post.time}</p>
                    </div>
                  </div>
                  {post.location && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-black/5 rounded-full">
                      <span className="material-symbols-outlined !text-[10px] text-ios-gray">location_on</span>
                      <span className="text-[10px] text-ios-gray">{post.location}</span>
                    </div>
                  )}
                </div>
                {post.video ? (
                  <div className="w-full bg-black relative" onClick={(e) => { e.stopPropagation(); }}>
                    <video src={post.video} className="w-full aspect-video object-cover" controls poster={post.image} />
                  </div>
                ) : post.images && post.images.length > 1 ? (
                  <div className="w-full bg-ios-bg overflow-x-auto snap-x snap-mandatory flex no-scrollbar">
                    {post.images.map((img, idx) => (
                      <div key={idx} className="w-full shrink-0 aspect-square snap-center relative">
                        <img src={img} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">
                          {idx + 1}/{post.images?.length}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-ios-bg">
                    <img src={post.image} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-[17px] font-bold mb-1 truncate">{post.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#3A3A3C] line-clamp-2">
                    {post.content}
                  </p>
                </div>
                <div className="px-4 flex items-center gap-6 border-t border-black/5 pt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleLike?.(post.id); }}
                    className={`flex items-center gap-1.5 transition-all duration-300 active:scale-150 ${post.liked ? 'text-ios-red scale-110' : 'text-ios-gray'}`}
                  >
                    <span className={`material-symbols-outlined text-[24px] ${post.liked ? 'material-symbols-fill' : ''}`}>favorite</span>
                    <span className="text-[12px] font-medium">{post.likes}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-ios-gray">
                    <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
                    <span className="text-[12px]">{post.comments}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onShare?.(post.title); }}
                    className="flex items-center gap-1.5 text-ios-gray ml-auto active:text-ios-blue transition-colors"
                  >
                    <span className="material-symbols-outlined text-[22px]">share</span>
                  </button>
                </div>
              </article>
            )) : (
              <div className="py-20 text-center text-ios-gray">
                <span className="material-symbols-outlined !text-[48px] opacity-20">search_off</span>
                <p className="mt-2 text-sm">没有找到相关动态</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FeedScreen;
