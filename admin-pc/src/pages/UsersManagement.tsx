import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DataTable } from '../components/DataTable';
import { RefreshCw, Ban, Mail } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  email: string;
  phone: string;
  pet_count?: number;
  created_at?: string;
}

export function UsersManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // 获取所有用户基础信息
    const { data, count } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, bio, email, phone, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (data) {
      // 同步获取每个用户宠物数量
      const enriched = await Promise.all(data.map(async (u) => {
        const { count: pets } = await supabase
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', u.id);
        return { ...u, pet_count: pets || 0 };
      }));
      setUsers(enriched);
      setTotal(count || 0);
    }
    setLoading(false);
  };

  const columns = [
    {
      header: '用户信息',
      accessor: (row: Profile) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar_url || `https://picsum.photos/seed/${row.id}/100/100`}
            alt="avatar"
            className="w-11 h-11 rounded-full border-2 border-ios-separator object-cover shrink-0"
          />
          <div>
            <div className="font-bold text-ios-text">{row.name || '未设置昵称'}</div>
            <div className="text-xs text-ios-gray font-mono mt-0.5">{row.id.split('-')[0]}…</div>
          </div>
        </div>
      ),
      width: '28%'
    },
    {
      header: '联系方式',
      accessor: (row: Profile) => (
        <div className="text-xs text-ios-gray space-y-1">
          <div className="flex items-center gap-1.5">
            <Mail size={12} />
            {row.email || <span className="italic">未绑定邮箱</span>}
          </div>
          <div className="flex items-center gap-1.5">
            📱 {row.phone || <span className="italic">未绑定手机</span>}
          </div>
        </div>
      ),
      width: '28%'
    },
    {
      header: '宠物数量',
      accessor: (row: Profile) => (
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🐾</span>
          <span className={`font-bold ${(row.pet_count || 0) > 0 ? 'text-ios-text' : 'text-ios-gray'}`}>
            {row.pet_count} 只
          </span>
        </div>
      ),
      width: '14%'
    },
    {
      header: '个性签名',
      accessor: (row: Profile) => (
        <div className="text-sm text-ios-gray truncate max-w-xs">{row.bio || '—'}</div>
      ),
    },
    {
      header: '注册时间',
      accessor: (row: Profile) => (
        <div className="text-xs text-ios-gray whitespace-nowrap">
          {row.created_at ? new Date(row.created_at).toLocaleDateString('zh-CN') : '—'}
        </div>
      ),
      width: '12%'
    }
  ];

  const filteredData = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">用户注册档案</h2>
          <p className="text-ios-gray mt-1 text-sm">
            平台共 <strong className="text-ios-text">{total}</strong> 名注册宠友，实时同步自 Supabase
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-ios-bg border border-ios-separator font-bold px-4 py-2 rounded-xl text-sm hover:bg-ios-gray-light transition-colors"
        >
          <RefreshCw size={16} />
          刷新同步
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        onSearch={setSearchTerm}
        searchPlaceholder="按昵称、邮箱或手机号搜索..."
        actions={(_row) => (
          <div className="flex gap-2 justify-end">
            <button
              title="封禁该用户"
              className="flex items-center gap-1 text-ios-red font-bold px-3 py-1.5 hover:bg-red-50 rounded-xl text-xs transition-colors"
            >
              <Ban size={14} />
              封禁
            </button>
          </div>
        )}
      />
    </div>
  );
}
