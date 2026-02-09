
import React, { useState, useEffect, useMemo } from 'react';
import { Post } from '../types';
import { getCurrentLocation } from '../services/qqMapService';

interface FeedScreenProps {
  posts: Post[];
  onConsultAI: () => void;
  onPostClick: (post: Post) => void;
  onToggleLike?: (postId: string) => void;
  onShare?: (title: string) => void;
  onNotification?: () => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ posts, onConsultAI, onPostClick, onToggleLike, onShare, onNotification }) => {
  const [myLocation, setMyLocation] = useState<string>('正在获取位置...');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-50 ios-blur bg-white/70 border-b border-black/5 px-4 pt-12 pb-4">
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
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[20px] text-ios-gray">search</span>
          </div>
          <input
            className="w-full h-9 pl-10 bg-black/5 border-none rounded-lg text-[17px] focus:ring-0 placeholder:text-ios-gray transition-all focus:bg-black/10"
            placeholder="搜索宠物、动态或用户..."
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
    </div>
  );
};

export default FeedScreen;
