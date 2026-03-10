import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DataTable } from '../components/DataTable';

interface Worker {
  id: string;
  real_name: string;
  title: string;
  is_verified: boolean;
  base_price: number;
  rating: number;
  profiles: { name: string; avatar_url: string };
}

export function WorkersManagement() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_workers')
      .select('id, real_name, title, is_verified, base_price, rating, profiles(name, avatar_url)')
      .order('created_at', { ascending: false });
      
    if (data) setWorkers(data as unknown as Worker[]);
    setLoading(false);
  };

  const handleToggleVerify = async (worker: Worker) => {
    if (!confirm(`确认要${worker.is_verified ? '取消' : '通过'} ${worker.real_name || '该兼职者'} 的实名认证吗？`)) return;
    
    // 乐观更新
    setWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, is_verified: !w.is_verified } : w));
    
    await supabase
      .from('service_workers')
      .update({ is_verified: !worker.is_verified })
      .eq('id', worker.id);
  };

  const columns = [
    {
      header: '兼职者身份',
      accessor: (row: Worker) => (
        <div className="flex items-center gap-3">
          <img 
            src={row.profiles?.avatar_url || `https://picsum.photos/seed/${row.id}/100/100`} 
            alt="avatar" 
            className="w-10 h-10 rounded-full border border-ios-separator object-cover" 
          />
          <div>
            <div className="font-bold text-ios-text flex items-center gap-1">
              {row.real_name || row.profiles?.name || '匿名'}
              {row.is_verified && <span className="text-green-500 material-symbols-outlined !text-[14px]">verified</span>}
            </div>
            <div className="text-xs text-ios-gray">基础报价: ¥{row.base_price}</div>
          </div>
        </div>
      ),
      width: '25%'
    },
    {
      header: '服务标语',
      accessor: (row: Worker) => (
        <div className="font-medium text-ios-text max-w-xs truncate" title={row.title}>
          {row.title}
        </div>
      )
    },
    {
      header: '信誉与评分',
      accessor: (row: Worker) => (
        <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 w-fit px-2 py-0.5 rounded text-xs border border-amber-100">
          ★ {row.rating ? row.rating.toFixed(1) : '5.0'}
        </div>
      )
    },
    {
      header: '认证状态',
      accessor: (row: Worker) => (
        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
          row.is_verified ? 'bg-green-100 text-green-700' : 'bg-ios-gray-light text-ios-gray'
        }`}>
          {row.is_verified ? '已认证' : '待认证'}
        </span>
      )
    }
  ];

  const filteredData = workers.filter(w => 
    w.real_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">兼职达人审核库</h2>
          <p className="text-ios-gray mt-1 text-sm">监控和管理所有发布在家代喂/代遛服务的简历档案以防作假</p>
        </div>
      </div>
      
      <DataTable 
        columns={columns} 
        data={filteredData} 
        loading={loading}
        onSearch={setSearchTerm}
        searchPlaceholder="检索姓名或服务标题..."
        actions={(row) => (
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => handleToggleVerify(row)}
              className={`${row.is_verified ? 'text-ios-gray hover:bg-ios-bg' : 'text-ios-blue hover:bg-ios-blue/10'} font-bold px-3 py-1.5 rounded-xl text-xs transition-colors`}
            >
              {row.is_verified ? '撤销认证' : '加V认证'}
            </button>
            <button className="text-ios-red font-bold px-3 py-1.5 hover:bg-red-50 rounded-xl text-xs transition-colors">
              下架
            </button>
          </div>
        )}
      />
    </div>
  );
}
