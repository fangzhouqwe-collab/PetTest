import React from 'react';
import { Post, MarketItem } from '../types';

interface HistoryScreenProps {
    historyItems: Array<Post | MarketItem>;
    onBack: () => void;
    onClear: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ historyItems, onBack, onClear }) => {
    return (
        <div className="flex flex-col min-h-screen bg-ios-bg">
            <header className="sticky top-0 z-[100] ios-blur bg-ios-card/70 border-b border-ios-separator px-4 pt-2 pb-2">
                <div className="flex items-center justify-between h-11">
                    <button onClick={onBack} className="flex items-center text-ios-blue active:opacity-50 transition-opacity">
                        <span className="material-symbols-outlined text-[28px] -ml-2">chevron_left</span>
                        <span className="text-[17px] font-medium -ml-1">返回</span>
                    </button>
                    <h1 className="text-[17px] font-semibold tracking-tight">浏览足迹</h1>
                    <button onClick={onClear} className="text-[15px] text-ios-gray font-medium active:opacity-50">
                        清空
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-10 px-4 pt-4">
                {historyItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {historyItems.map((item, idx) => {
                            const isPost = 'author' in item;
                            const title = isPost ? (item as Post).title : (item as MarketItem).name;
                            const img = isPost ? (item as Post).image : (item as MarketItem).image;
                            const subText = isPost ? (item as Post).author : `¥${(item as MarketItem).price}`;

                            return (
                                <div key={idx} className="bg-ios-card rounded-2xl overflow-hidden shadow-sm flex flex-col active:scale-95 transition-transform border border-ios-separator">
                                    <div className="aspect-square relative w-full bg-ios-bg">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/40 text-white text-[10px] font-bold backdrop-blur-sm">
                                            {isPost ? '社区动态' : '商品/闲置'}
                                        </div>
                                    </div>
                                    <div className="p-2.5 flex flex-col justify-between flex-1">
                                        <h3 className="text-[13px] font-medium leading-tight line-clamp-2 text-ios-text">{title}</h3>
                                        <div className="mt-2 text-[12px] font-bold text-ios-gray/80 truncate">
                                            {subText}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-32 pb-10">
                        <span className="material-symbols-outlined !text-[80px] text-ios-gray/30 mb-4">history_toggle_off</span>
                        <p className="text-ios-gray font-medium text-[15px]">暂无浏览足迹</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HistoryScreen;
