import React, { useState } from 'react';
import { Address } from '../types';

interface AddressManagerProps {
    addresses: Address[];
    onAddAddress: (addr: Omit<Address, 'id'>) => void;
    onUpdateAddress: (id: string, addr: Omit<Address, 'id'>) => void;
    onDeleteAddress: (id: string) => void;
    onSetDefault: (id: string) => void;
    onBack: () => void;
    isSelecting?: boolean;
    onSelect?: (addr: Address) => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({
    addresses, onAddAddress, onUpdateAddress, onDeleteAddress, onSetDefault, onBack, isSelecting, onSelect
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ receiver: '', phone: '', region: '', detail: '', isDefault: false });

    const handleSave = () => {
        if (!form.receiver || !form.phone || !form.region || !form.detail) return;
        if (editingId) {
            onUpdateAddress(editingId, form);
        } else {
            onAddAddress(form);
        }
        setShowAddForm(false);
        setEditingId(null);
        setForm({ receiver: '', phone: '', region: '', detail: '', isDefault: false });
    };

    const openEdit = (addr: Address) => {
        setForm({ receiver: addr.receiver, phone: addr.phone, region: addr.region, detail: addr.detail, isDefault: addr.isDefault });
        setEditingId(addr.id);
        setShowAddForm(true);
    };

    if (showAddForm) {
        return (
            <div className="flex flex-col min-h-screen bg-ios-bg animate-in slide-in-from-right duration-300">
                <header className="sticky top-0 z-[100] ios-blur bg-ios-card/70 border-b border-ios-separator px-4 h-11 flex items-center justify-between">
                    <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="text-ios-blue text-[17px]">取消</button>
                    <span className="font-bold">{editingId ? '编辑地址' : '新增收货地址'}</span>
                    <button onClick={handleSave} className="text-ios-blue font-bold text-[17px]">保存</button>
                </header>

                <main className="p-4 space-y-4">
                    <div className="bg-ios-card rounded-2xl overflow-hidden shadow-sm border border-ios-separator">
                        <div className="flex border-b border-black/5 items-center">
                            <span className="w-20 pl-4 py-3.5 text-[15px] font-bold text-ios-text">收货人</span>
                            <input className="flex-1 bg-transparent border-none text-[15px] p-0 pr-4 focus:ring-0" placeholder="名字" value={form.receiver} onChange={e => setForm({ ...form, receiver: e.target.value })} />
                        </div>
                        <div className="flex border-b border-black/5 items-center">
                            <span className="w-20 pl-4 py-3.5 text-[15px] font-bold text-ios-text">手机号码</span>
                            <input type="tel" className="flex-1 bg-transparent border-none text-[15px] p-0 pr-4 focus:ring-0" placeholder="手机号" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="flex border-b border-black/5 items-center">
                            <span className="w-20 pl-4 py-3.5 text-[15px] font-bold text-ios-text">所在地区</span>
                            <input className="flex-1 bg-transparent border-none text-[15px] p-0 pr-4 focus:ring-0" placeholder="省 市 区、乡镇等" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
                        </div>
                        <div className="flex items-center">
                            <span className="w-20 pl-4 py-3.5 text-[15px] font-bold text-ios-text">详细地址</span>
                            <input className="flex-1 bg-transparent border-none text-[15px] p-0 pr-4 focus:ring-0" placeholder="小区楼栋/乡村名称" value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} />
                        </div>
                    </div>

                    <div className="bg-ios-card rounded-2xl overflow-hidden shadow-sm px-4 py-3 flex items-center justify-between border border-ios-separator">
                        <span className="text-[15px] font-bold text-ios-text">设为默认收货地址</span>
                        <input type="checkbox" className="w-5 h-5 rounded-full text-ios-blue border-gray-300 focus:ring-ios-blue" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                    </div>

                    {editingId && (
                        <button onClick={() => { onDeleteAddress(editingId); setShowAddForm(false); }} className="w-full bg-ios-card text-ios-red py-3.5 rounded-2xl font-bold text-[16px] active:scale-95 transition-transform mt-6 shadow-sm border border-ios-separator">
                            删除地址
                        </button>
                    )}
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-ios-bg relative">
            <header className="sticky top-0 z-[100] ios-blur bg-ios-card/70 border-b border-ios-separator px-4 h-11 flex items-center justify-between">
                <button onClick={onBack} className="flex items-center text-ios-blue active:opacity-50 transition-opacity">
                    <span className="material-symbols-outlined text-[28px] -ml-2">chevron_left</span>
                    <span className="text-[17px] font-medium -ml-1">返回</span>
                </button>
                <h1 className="text-[17px] font-semibold tracking-tight">{isSelecting ? '选择收货地址' : '地址管理'}</h1>
                <div className="w-[60px]" />
            </header>

            <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-3">
                {addresses.length > 0 ? (
                    addresses.map(addr => (
                        <div
                            key={addr.id}
                            className="bg-ios-card rounded-2xl p-4 shadow-sm flex flex-col gap-2 relative active:scale-[0.99] transition-transform border border-ios-separator"
                            onClick={() => isSelecting && onSelect ? onSelect(addr) : undefined}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[16px] font-bold text-ios-text">{addr.receiver}</span>
                                <span className="text-[14px] text-ios-gray font-medium">{addr.phone}</span>
                                {addr.isDefault && (
                                    <span className="bg-ios-blue/10 text-ios-blue text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto">默认</span>
                                )}
                            </div>
                            <p className="text-[14px] leading-relaxed text-[#3A3A3C]">{addr.region} {addr.detail}</p>

                            {!isSelecting && (
                                <div className="flex items-center gap-4 mt-2 pt-3 border-t border-black/5">
                                    <label className="flex items-center gap-2 text-[13px] text-ios-gray flex-1 active:opacity-50">
                                        <input
                                            type="radio"
                                            name="defaultAddress"
                                            className="w-4 h-4 text-ios-blue focus:ring-0"
                                            checked={addr.isDefault}
                                            onChange={() => onSetDefault(addr.id)}
                                        />
                                        {addr.isDefault ? '默认地址' : '设为默认'}
                                    </label>
                                    <button onClick={() => openEdit(addr)} className="text-[13px] font-bold text-ios-text flex items-center gap-1 active:opacity-50">
                                        <span className="material-symbols-outlined !text-[16px]">edit</span>
                                        编辑
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-ios-gray">
                        <span className="material-symbols-outlined !text-[48px] opacity-20 mb-2">location_off</span>
                        <p className="text-sm">暂无收货地址</p>
                    </div>
                )}
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-ios-card border-t border-ios-separator z-50">
                <button onClick={() => { setForm({ receiver: '', phone: '', region: '', detail: '', isDefault: addresses.length === 0 }); setEditingId(null); setShowAddForm(true); }} className="w-full bg-ios-blue text-white py-3.5 rounded-full font-bold text-[16px] shadow-lg shadow-ios-blue/20 active:scale-95 transition-transform">
                    新增收货地址
                </button>
            </div>
        </div>
    );
};

export default AddressManager;
