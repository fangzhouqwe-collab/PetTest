import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, ShieldAlert, ShoppingBag, Flame } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    workers: 0,
    orders: 0,
    posts: 0
  });

  useEffect(() => {
    async function loadStats() {
      const [u, w, o, p] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('service_workers').select('*', { count: 'exact', head: true }),
        supabase.from('service_orders').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        users: u.count || 0,
        workers: w.count || 0,
        orders: o.count || 0,
        posts: p.count || 0,
      });
    }
    loadStats();
  }, []);

  const cards = [
    { label: '注册宠友总数', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '入驻兼职达人', value: stats.workers, icon: ShieldAlert, color: 'text-green-500', bg: 'bg-green-50' },
    { label: '代养服务订单', value: stats.orders, icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '社区动态发帖', value: stats.posts, icon: Flame, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">上午好，Admin</h2>
        <p className="text-ios-gray mt-1 text-sm">这是 PetConnect 平台今天的核心运营数据摘要</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-ios-card p-6 rounded-3xl shadow-sm border border-ios-separator relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-ios-text mb-1">{card.value}</div>
                <div className="text-ios-gray text-sm font-bold">{card.label}</div>
              </div>
              <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full ${card.bg} opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>
            </div>
          );
        })}
      </div>

      <div className="bg-ios-card rounded-3xl p-6 shadow-sm border border-ios-separator mb-8">
        <h3 className="font-bold text-lg mb-4">快捷操作</h3>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-ios-blue text-white font-bold rounded-2xl text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
             <span className="material-symbols-outlined">add</span>发布官方公告
          </button>
          <button className="px-6 py-3 bg-ios-bg border border-ios-separator font-bold rounded-2xl text-sm hover:bg-ios-gray-light transition-colors flex items-center gap-2 text-ios-text">
            <span className="material-symbols-outlined">download</span>导出平台流水
          </button>
        </div>
      </div>
    </div>
  );
}
