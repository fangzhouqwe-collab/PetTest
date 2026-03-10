import React, { useState, useEffect } from 'react';
import { supabase, adminSupabase, isAdminConfigured } from '../lib/supabase';
import { Plus, Pin, Trash2, Bell, AlertTriangle, CalendarDays } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'EVENT';
  is_pinned: boolean;
  published_at: string;
  expires_at: string | null;
}

const TYPE_CONFIG = {
  INFO:    { label: '普通公告', color: 'bg-ios-blue-card text-ios-blue border-ios-blue/20', icon: Bell },
  WARNING: { label: '系统警告', color: 'bg-red-50 text-ios-red border-red-100', icon: AlertTriangle },
  EVENT:   { label: '活动信息', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: CalendarDays },
};

const emptyForm: { title: string; content: string; type: 'INFO' | 'WARNING' | 'EVENT'; is_pinned: boolean; expires_at: string } = { title: '', content: '', type: 'INFO', is_pinned: false, expires_at: '' };

export function AnnouncementsManagement() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false });
    if (data) setItems(data as Announcement[]);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('标题和内容不能为空');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('announcements').insert({
      title: form.title,
      content: form.content,
      type: form.type,
      is_pinned: form.is_pinned,
      expires_at: form.expires_at || null,
    });
    if (error) {
      // 可能是 RLS 限制。提示用户需要使用 service_role key
      alert(`发布失败: ${error.message}\n\n提示：当前使用的是匿名 key，如需后台发布公告，请在 supabase.ts 中使用 service_role key 初始化管理员端 client，或在 Supabase 控制台直接使用 SQL Editor 插入数据。`);
    } else {
      setForm({ ...emptyForm });
      setShowForm(false);
      fetchAnnouncements();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该公告？')) return;
    const { error } = await adminSupabase.from('announcements').delete().eq('id', id);
    if (!error) setItems(prev => prev.filter(a => a.id !== id));
  };

  const handleTogglePin = async (item: Announcement) => {
    await adminSupabase.from('announcements').update({ is_pinned: !item.is_pinned }).eq('id', item.id);
    setItems(prev => prev.map(a => a.id === item.id ? { ...a, is_pinned: !a.is_pinned } : a));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* 权限状态横幅 */}
      {!isAdminConfigured && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-start gap-3 text-sm">
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <div className="font-bold mb-1">未配置管理员权限</div>
            <div>公告的写入操作需要 Service Role Key。请在 <code className="bg-amber-100 px-1 rounded">admin-pc/.env.local</code> 中填写 <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_SERVICE_ROLE_KEY</code>，然后重启开发服务器即可解锁完整发布功能。</div>
          </div>
        </div>
      )}
      {/* 页头 */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">公告管理</h2>
          <p className="text-ios-gray mt-1 text-sm">向全体用户推送平台通知、活动和重要警告</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-ios-blue text-white font-bold px-5 py-2.5 rounded-2xl shadow-md shadow-ios-blue/25 hover:opacity-90 active:scale-95 transition-all text-sm"
        >
          <Plus size={18} />
          发布新公告
        </button>
      </div>

      {/* 发布表单 */}
      {showForm && (
        <div className="bg-ios-card border border-ios-separator rounded-3xl p-6 mb-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-ios-text">撰写公告内容</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-ios-gray mb-2">公告标题 *</label>
              <input
                className="w-full bg-ios-bg border border-ios-separator rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ios-blue/30"
                placeholder="简明扼要的公告标题"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ios-gray mb-2">公告类型</label>
              <div className="flex gap-2 mt-1">
                {(['INFO', 'WARNING', 'EVENT'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      form.type === t ? TYPE_CONFIG[t].color + ' border-current' : 'bg-ios-bg text-ios-gray border-ios-separator'
                    }`}
                  >
                    {TYPE_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ios-gray mb-2">公告正文 *</label>
            <textarea
              rows={4}
              className="w-full bg-ios-bg border border-ios-separator rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-ios-blue/30"
              placeholder="请输入向用户展示的详细公告内容..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm font-bold text-ios-gray mb-2">过期时间（可选）</label>
              <input
                type="datetime-local"
                className="bg-ios-bg border border-ios-separator rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ios-blue/30 text-sm"
                value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer mt-4">
              <div
                onClick={() => setForm(f => ({ ...f, is_pinned: !f.is_pinned }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.is_pinned ? 'bg-ios-blue' : 'bg-ios-separator'}`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow-sm ${form.is_pinned ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-bold text-ios-text">置顶公告</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 bg-ios-blue text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 text-sm"
            >
              {submitting ? '发布中...' : '立即发布'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-ios-bg border border-ios-separator font-bold rounded-2xl text-sm hover:bg-ios-gray-light">
              取消
            </button>
          </div>
        </div>
      )}

      {/* 公告列表 */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-ios-gray">
          <Bell size={48} className="mx-auto opacity-20 mb-4" />
          <p className="font-medium">暂无已发布的公告</p>
          <p className="text-sm mt-1">点击右上角"发布新公告"开始推送平台消息</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.INFO;
            const Icon = cfg.icon;
            const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
            return (
              <div
                key={item.id}
                className={`bg-ios-card border rounded-2xl p-5 shadow-sm ${isExpired ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${cfg.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {item.is_pinned && <span className="text-xs bg-amber-100 text-amber-600 font-bold px-2 py-0.5 rounded-full border border-amber-200">📌 置顶</span>}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                        {isExpired && <span className="text-xs bg-ios-gray-light text-ios-gray font-bold px-2 py-0.5 rounded-full">已过期</span>}
                      </div>
                      <h4 className="font-bold text-ios-text text-base">{item.title}</h4>
                      <p className="text-ios-gray text-sm mt-1 line-clamp-2">{item.content}</p>
                      <div className="text-xs text-ios-gray mt-2">
                        发布于 {new Date(item.published_at).toLocaleString('zh-CN')}
                        {item.expires_at && ` · 到期 ${new Date(item.expires_at).toLocaleString('zh-CN')}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTogglePin(item)}
                      title={item.is_pinned ? '取消置顶' : '设为置顶'}
                      className={`p-2 rounded-xl transition-colors ${item.is_pinned ? 'bg-amber-50 text-amber-500' : 'hover:bg-ios-bg text-ios-gray'}`}
                    >
                      <Pin size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl hover:bg-red-50 text-ios-gray hover:text-ios-red transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
