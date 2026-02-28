import React, { useState, useMemo } from 'react';
import { Order, AppTab } from '../types';

interface OrderHistoryProps {
    orders: Order[];
    onBack: () => void;
    onNavigate?: (tab: AppTab) => void;
    onPay?: (orderId: string) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onBack, onNavigate, onPay }) => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const filteredOrders = useMemo(() => {
        if (filter === 'all') return orders;
        return orders.filter(o => o.status === filter);
    }, [orders, filter]);

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return { t: '待付款', c: 'text-orange-500' };
            case 'shipped': return { t: '已发货', c: 'text-blue-500' };
            case 'completed': return { t: '已完成', c: 'text-ios-gray' };
            case 'cancelled': return { t: '已取消', c: 'text-ios-gray/50' };
            default: return { t: status, c: 'text-ios-text' };
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-ios-bg">
            <header className="sticky top-0 z-[100] ios-blur bg-ios-card/70 border-b border-ios-separator px-4 pt-2 pb-2">
                <div className="flex items-center justify-between mb-2 h-11">
                    <button onClick={onBack} className="flex items-center text-ios-blue active:opacity-50 transition-opacity">
                        <span className="material-symbols-outlined text-[28px] -ml-2">chevron_left</span>
                        <span className="text-[17px] font-medium -ml-1">返回</span>
                    </button>
                    <h1 className="text-[17px] font-semibold tracking-tight">我的订单</h1>
                    <div className="w-[60px]" />
                </div>

                <div className="flex bg-black/5 p-1 rounded-full relative w-full mb-1">
                    <button onClick={() => setFilter('all')} className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-all ${filter === 'all' ? 'bg-ios-bg shadow-sm text-ios-text' : 'text-ios-gray'}`}>
                        全部
                    </button>
                    <button onClick={() => setFilter('pending')} className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-all ${filter === 'pending' ? 'bg-ios-bg shadow-sm text-ios-text' : 'text-ios-gray'}`}>
                        待付款
                    </button>
                    <button onClick={() => setFilter('completed')} className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-all ${filter === 'completed' ? 'bg-ios-bg shadow-sm text-ios-text' : 'text-ios-gray'}`}>
                        已完成
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-10 px-4 pt-4 space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => {
                        const statusConfig = getStatusText(order.status);
                        return (
                            <div key={order.id} className="bg-ios-card rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-ios-separator">
                                <div className="flex items-center justify-between border-b border-black/5 pb-2">
                                    <span className="text-[12px] text-ios-gray font-medium">订单号: {order.id.slice(-8).toUpperCase()}</span>
                                    <span className={`text-[13px] font-bold ${statusConfig.c}`}>{statusConfig.t}</span>
                                </div>

                                <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="size-16 rounded-xl overflow-hidden shrink-0 bg-ios-bg">
                                                <img src={item.product.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                                <h3 className="text-[14px] leading-tight line-clamp-2 text-ios-text font-medium">{item.product.name}</h3>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[14px] font-bold text-ios-text">¥{item.product.price}</span>
                                                    <span className="text-[12px] text-ios-gray font-bold">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center border-t border-black/5 pt-3 mt-1">
                                    <span className="text-[12px] text-ios-gray font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[13px] text-ios-text font-medium">共 {order.items.reduce((sum, i) => sum + i.quantity, 0)} 件，合计：</span>
                                        <span className="text-[16px] font-bold text-ios-red">¥{order.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* 底部按钮栏 */}
                                <div className="flex justify-end items-center gap-2 pt-1">
                                    {order.status === 'pending' && onPay && (
                                        <button onClick={() => onPay(order.id)} className="px-5 py-1.5 rounded-full border border-ios-blue text-ios-blue text-[13px] font-bold active:scale-95 transition-transform bg-ios-blue/5">
                                            立即付款
                                        </button>
                                    )}
                                    {order.status === 'completed' && (
                                        <button onClick={() => onNavigate && onNavigate(AppTab.HOME)} className="px-5 py-1.5 rounded-full border border-ios-gray text-ios-text text-[13px] font-bold active:bg-black/5 transition-colors">
                                            再次购买
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center pt-32 pb-10">
                        <span className="material-symbols-outlined !text-[80px] text-ios-gray/30 mb-4">receipt_long</span>
                        <p className="text-ios-gray font-medium text-[15px]">没有相关的订单记录</p>
                        <button onClick={() => onNavigate && onNavigate(AppTab.HOME)} className="mt-6 px-6 py-2.5 bg-ios-blue/10 text-ios-blue font-bold rounded-full active:scale-95 transition-transform">
                            去商城逛逛
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderHistory;
