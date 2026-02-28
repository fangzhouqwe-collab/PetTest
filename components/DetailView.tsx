
import React, { useState } from 'react';
import { Post, MarketItem, Product } from '../types';

interface DetailViewProps {
  type: 'post' | 'market';
  data: any;
  onBack: () => void;
  onChat?: (name: string, avatar: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  onToggleLike?: (postId: string) => void;
  onShare?: (title: string) => void;
  onAddToCart?: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ type, data, onBack, onChat, onAddComment, onToggleLike, onShare, onAddToCart, isFavorite, onToggleFavorite }) => {
  const [commentInput, setCommentInput] = useState('');
  if (!data) return null;

  const handleComment = () => {
    if (commentInput.trim() && onAddComment) {
      onAddComment(data.id, commentInput);
      setCommentInput('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg animate-in slide-in-from-right duration-300">
      <header className="fixed top-0 left-0 right-0 z-50 ios-blur bg-ios-card/70 h-[88px] pt-10 px-4 flex items-center justify-between border-b border-ios-separator">
        <button onClick={onBack} className="text-ios-blue flex items-center">
          <span className="material-symbols-outlined !text-[32px]">chevron_left</span>
          <span className="text-[17px]">返回</span>
        </button>
        <span className="font-semibold text-[17px]">{type === 'post' ? '动态详情' : '宝贝详情'}</span>
        <button onClick={() => onShare?.(data.title || data.name)} className="text-ios-blue active:opacity-60">
          <span className="material-symbols-outlined">share</span>
        </button>
      </header>

      <div className="pt-[88px] pb-32 max-w-[540px] mx-auto w-full">
        {/* 媒体展示区：视频 + 多图滑动 */}
        {data.video ? (
          <div className="w-full bg-black">
            <video src={data.video} className="w-full aspect-video object-contain" controls autoPlay={false} />
          </div>
        ) : data.images && data.images.length > 1 ? (
          <div className="relative">
            <div className="w-full bg-ios-bg overflow-x-auto snap-x snap-mandatory flex no-scrollbar scroll-smooth">
              {data.images.map((img: string, idx: number) => (
                <div key={idx} className="w-full shrink-0 aspect-square snap-center">
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {/* 分页指示器 */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {data.images.map((_: string, idx: number) => (
                <div key={idx} className="w-2 h-2 rounded-full bg-ios-gray/40 shadow-sm" />
              ))}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
              1/{data.images.length}
            </div>
          </div>
        ) : data.image ? (
          <div className="aspect-square bg-ios-bg">
            <img src={data.image} className="w-full h-full object-cover" />
          </div>
        ) : null}

        {type === 'post' ? (
          <>
            <div className="p-4 border-b border-black/5">
              <div className="flex items-center gap-3 mb-6">
                <img src={data.avatar} className="size-12 rounded-full border border-black/5" />
                <div className="flex-1">
                  <h4 className="font-bold text-[17px]">{data.author}</h4>
                  <p className="text-[13px] text-ios-gray">{data.time} • {data.breed}</p>
                </div>
                {!data.isMine && (
                  <button
                    onClick={() => onChat?.(data.author, data.avatar)}
                    className="bg-ios-bg text-ios-blue px-4 py-1.5 rounded-full text-sm font-bold active:bg-ios-blue/10 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined !text-[18px]">chat_bubble_outline</span>
                    私聊
                  </button>
                )}
              </div>
              <h1 className="text-[22px] font-bold mb-3">{data.title}</h1>
              <p className="text-[17px] leading-relaxed text-ios-text">{data.content}</p>
              {data.location && (
                <div className="flex items-center gap-1 mt-4 text-[12px] text-ios-blue bg-ios-blue/5 w-fit px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined !text-[14px] material-symbols-fill">location_on</span>
                  <span>{data.location}</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg mb-4">精彩评论 ({data.comments})</h3>
              <div className="space-y-6">
                {data.commentsList?.length > 0 ? data.commentsList.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <img src={c.avatar} className="size-10 rounded-full shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm">{c.author}</span>
                        <span className="text-[11px] text-ios-gray">{c.time}</span>
                      </div>
                      <p className="text-[15px] text-ios-text/80">{c.text}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center text-ios-gray text-sm">还没有人评论哦，快来抢沙发</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-4">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-ios-red text-3xl font-bold">¥{data.price.toLocaleString()}</span>
                <span className="bg-ios-red/10 text-ios-red text-[10px] font-bold px-1.5 rounded">急售</span>
              </div>
              <span className="text-ios-gray text-[13px]">浏览 2.4k</span>
            </div>
            <h1 className="text-[22px] font-bold mb-4">{data.name}</h1>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-ios-bg p-3 rounded-xl">
                <p className="text-ios-gray text-[12px]">年龄</p>
                <p className="font-semibold">{data.age}</p>
              </div>
              <div className="bg-ios-bg p-3 rounded-xl">
                <p className="text-ios-gray text-[12px]">性别</p>
                <p className="font-semibold">{data.gender}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-ios-green !text-[20px] material-symbols-fill">verified</span>
                <span className="text-[15px]">商家已实名并交纳保证金</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-ios-blue !text-[20px] material-symbols-fill">health_and_safety</span>
                <span className="text-[15px]">完成疫苗及体外驱虫</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 h-28 ios-blur bg-ios-card/80 border-t border-ios-separator px-4 flex flex-col pt-3 pb-8 z-50 max-w-[540px] mx-auto">
        {type === 'post' ? (
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-ios-bg rounded-full px-4 py-2 flex items-center">
              <input
                className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full"
                placeholder="说点什么吧..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
              />
            </div>
            <button onClick={() => onToggleLike?.(data.id)} className={`flex flex-col items-center ${data.liked ? 'text-ios-red' : 'text-ios-gray'}`}>
              <span className={`material-symbols-outlined ${data.liked ? 'material-symbols-fill' : ''}`}>favorite</span>
              <span className="text-[10px]">{data.likes}</span>
            </button>
            <button onClick={handleComment} className={`text-ios-blue font-bold text-sm ${!commentInput.trim() && 'opacity-30'}`}>发送</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <button onClick={onToggleFavorite} className={`flex flex-col items-center justify-center px-1 active:opacity-60 transition-opacity whitespace-nowrap min-w-[36px] ${isFavorite ? 'text-orange-500' : 'text-ios-gray'}`}>
              <span className={`material-symbols-outlined !text-[20px] ${isFavorite ? 'material-symbols-fill' : ''}`}>star</span>
              <span className="text-[10px] mt-0.5">{isFavorite ? '已收藏' : '收藏'}</span>
            </button>
            <button onClick={() => onAddToCart?.(data)} className="flex flex-col items-center justify-center text-ios-gray px-1 active:opacity-60 transition-opacity whitespace-nowrap min-w-[36px]">
              <span className="material-symbols-outlined !text-[20px]">add_shopping_cart</span>
              <span className="text-[10px] mt-0.5">加购</span>
            </button>
            <button
              onClick={() => onChat?.("卖家", "https://picsum.photos/seed/seller/100/100")}
              className="flex-1 bg-ios-bg text-ios-blue font-bold py-3 rounded-xl active:opacity-70 mx-1 shadow-sm whitespace-nowrap"
            >
              聊一聊
            </button>
            <button onClick={() => onAddToCart?.(data)} className="flex-1 bg-gradient-to-r from-ios-blue to-blue-600 text-white font-bold py-3 rounded-xl active:opacity-70 shadow-md whitespace-nowrap">
              立即购买
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default DetailView;
