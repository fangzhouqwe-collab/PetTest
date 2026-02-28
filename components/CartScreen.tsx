import React, { useMemo } from 'react';
import { CartItem } from '../types';

interface CartScreenProps {
    cartItems: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onDelete: (id: string) => void;
    onCheckout: () => void;
    onBack: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({
    cartItems,
    onUpdateQuantity,
    onToggleSelect,
    onToggleSelectAll,
    onDelete,
    onCheckout,
    onBack
}) => {
    const selectedCount = cartItems.filter(i => i.selected).length;
    const isAllSelected = cartItems.length > 0 && selectedCount === cartItems.length;
    const totalAmount = useMemo(() => {
        return cartItems.filter(i => i.selected).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }, [cartItems]);

    return (
        <div className="flex flex-col min-h-screen bg-ios-bg">
            <header className="sticky top-0 z-[100] ios-blur bg-ios-card/70 border-b border-ios-separator px-4 h-11 flex items-center justify-between">
                <button onClick={onBack} className="flex items-center text-ios-blue active:opacity-50 transition-opacity">
                    <span className="material-symbols-outlined text-[28px] -ml-2">chevron_left</span>
                    <span className="text-[17px] font-medium -ml-1">返回</span>
                </button>
                <h1 className="text-[17px] font-semibold tracking-tight">购物车 ({cartItems.length})</h1>
                <div className="w-[60px]" />
            </header>

            <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
                {cartItems.length > 0 ? (
                    cartItems.map(item => (
                        <div key={item.id} className="bg-ios-card rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform border border-ios-separator">
                            <button onClick={() => onToggleSelect(item.id)} className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.selected ? 'bg-ios-blue border-ios-blue' : 'border-black/20'}`}>
                                {item.selected && <span className="material-symbols-outlined text-white !text-[16px] font-bold">check</span>}
                            </button>

                            <div className="size-20 rounded-xl overflow-hidden shrink-0 bg-ios-bg">
                                <img src={item.product.image} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between h-20">
                                <h3 className="font-bold text-[15px] truncate text-ios-text">{item.product.name}</h3>

                                <div className="flex items-end justify-between">
                                    <span className="text-ios-red font-bold text-[18px]">¥{item.product.price}</span>

                                    <div className="flex items-center gap-3 bg-ios-bg rounded-full px-1 py-0.5">
                                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="size-6 bg-ios-bg rounded-full flex items-center justify-center shadow-sm text-ios-gray active:scale-90 transition-transform">
                                            <span className="material-symbols-outlined !text-[16px]">remove</span>
                                        </button>
                                        <span className="text-[14px] font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="size-6 bg-ios-bg rounded-full flex items-center justify-center shadow-sm text-ios-text active:scale-90 transition-transform">
                                            <span className="material-symbols-outlined !text-[16px]">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center pt-32 pb-10">
                        <span className="material-symbols-outlined !text-[80px] text-ios-gray/30 mb-4">shopping_cart</span>
                        <p className="text-ios-gray font-medium text-[15px]">购物车里空空如也</p>
                        <button onClick={onBack} className="mt-6 px-6 py-2.5 bg-ios-blue/10 text-ios-blue font-bold rounded-full active:scale-95 transition-transform">
                            去逛逛商品
                        </button>
                    </div>
                )}
            </main>

            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-ios-card border-t border-ios-separator pb-8 pt-3 px-4 flex items-center justify-between z-50">
                    <div className="flex items-center gap-3">
                        <button onClick={onToggleSelectAll} className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${isAllSelected ? 'bg-ios-blue border-ios-blue' : 'border-black/20'}`}>
                            {isAllSelected && <span className="material-symbols-outlined text-white !text-[16px] font-bold">check</span>}
                        </button>
                        <span className="text-[14px] text-ios-gray font-medium">全选</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[12px] text-ios-gray font-medium">合计</span>
                            <span className="text-ios-red font-bold text-[20px] leading-none">¥{totalAmount.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={selectedCount > 0 ? onCheckout : undefined}
                            className={`px-8 py-3.5 rounded-full font-bold text-[16px] transition-all shadow-lg ${selectedCount > 0 ? 'bg-ios-blue text-white shadow-ios-blue/30 active:scale-95' : 'bg-ios-gray/20 text-ios-gray/50'}`}
                        >
                            结算({selectedCount})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartScreen;
