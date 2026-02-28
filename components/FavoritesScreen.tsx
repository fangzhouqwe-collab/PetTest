import React from 'react';
import { MarketItem } from '../types';

interface FavoritesScreenProps {
    items: MarketItem[];
    onBack: () => void;
    onItemClick: (item: MarketItem) => void;
    onRemoveFavorite?: (id: string) => void;
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ items, onBack, onItemClick, onRemoveFavorite }) => {
    return (
        <div className="flex flex-col min-h-screen bg-ios-bg animate-in slide-in-from-right duration-300">
            <header className="sticky top-0 z-50 ios-blur bg-ios-card/70 border-b border-ios-separator px-4 h-12 flex items-center">
                <button onClick={onBack} className="text-ios-blue absolute left-4 active:scale-95 transition-transform flex items-center">
                    <span className="material-symbols-outlined !text-[24px]">chevron_left</span>
                    <span className="text-[17px] font-medium -ml-1">返回</span>
                </button>
                <h1 className="text-[17px] font-semibold flex-1 text-center">我的收藏</h1>
            </header>

            <main className="flex-1 overflow-y-auto pt-2 pb-10">
                {items.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-2">
                        {items.map(item => (
                            <div key={item.id} className="flex flex-col group cursor-pointer" onClick={() => onItemClick(item)}>
                                <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-ios-card mb-2">
                                    <img alt={item.name} className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300" src={item.image} />
                                </div>
                                <h3 className="font-semibold text-[13px] leading-tight line-clamp-2 mb-1 text-ios-text">
                                    {item.name}
                                </h3>
                                <div className="flex items-end gap-1 mb-0.5 mt-auto relative">
                                    <span className="text-[16px] font-bold text-ios-red">¥{item.price.toLocaleString()}</span>
                                    <button onClick={(e) => { e.stopPropagation(); onRemoveFavorite?.(item.id); }} className="absolute right-0 bottom-0 text-ios-red">
                                        <span className="material-symbols-outlined !text-[20px] material-symbols-fill">favorite</span>
                                    </button>
                                </div>
                                {item.location && <span className="text-[10px] text-ios-gray">{item.location}</span>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-32 text-ios-gray">
                        <span className="material-symbols-outlined !text-[64px] opacity-20 mb-4">favorite_border</span>
                        <p className="text-lg font-medium">暂无收藏商品</p>
                        <p className="text-sm mt-2 opacity-60">去市集逛逛吧</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FavoritesScreen;
