import React, { useState } from 'react';
import { ServiceWorker, UserProfile } from '../types';
import * as partTimeService from '../services/partTimeService';

interface Props {
  worker: ServiceWorker;
  currentUserProfile: UserProfile;
  onBack: () => void;
  onBookSuccess: () => void;
}

const WorkerDetailScreen: React.FC<Props> = ({ worker, currentUserProfile, onBack, onBookSuccess }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    petId: currentUserProfile.pets.length > 0 ? currentUserProfile.pets[0].id : '',
    serviceType: 'WALKING',
    serviceTime: '',
    location: '',
    offerPrice: worker.basePrice.toString()
  });

  const handleBookSubmit = async () => {
    if (!formData.serviceTime || !formData.location || !formData.offerPrice || !formData.serviceType) {
      alert('请填写完整的预约信息');
      return;
    }

    setLoading(true);
    try {
      const result = await partTimeService.createServiceOrder(worker.id, {
        petId: formData.petId || undefined,
        serviceType: formData.serviceType,
        serviceTime: new Date(formData.serviceTime).toISOString(),
        location: formData.location,
        offerPrice: parseFloat(formData.offerPrice) || worker.basePrice
      });

      if (result) {
        alert('预约邀约已发送，等待对方确认！');
        onBookSuccess();
      } else {
        alert('预约失败，请检查网络或登录状态。');
      }
    } catch (error) {
      console.error(error);
      alert('预约出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg">
      <header className={`sticky top-0 z-50 ${showBookingForm ? 'bg-ios-card/80 ios-blur border-b border-ios-separator' : 'bg-transparent'} pt-12 pb-4 px-4 transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => showBookingForm ? setShowBookingForm(false) : onBack()} 
            className={`p-2 -ml-2 rounded-full active:opacity-70 flex items-center justify-center ${showBookingForm ? 'text-ios-blue' : 'bg-black/30 text-white'}`}
          >
            <span className="material-symbols-outlined !text-3xl">chevron_left</span>
          </button>
          {showBookingForm && <h1 className="text-xl font-bold tracking-tight">填写预约信息</h1>}
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 -mt-24">
        {!showBookingForm ? (
          // ========================
          // 兼职者详情视图
          // ========================
          <>
            {/* 顶部背景与基础信息 */}
            <div className="relative pt-24 px-4 pb-6 bg-gradient-to-b from-ios-blue/20 to-ios-bg">
              <div className="flex flex-col items-center pt-8">
                <div className="relative mb-3">
                  <img src={worker.workerProfile?.avatar} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md" />
                  {worker.isVerified && (
                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white shadow-sm">
                      <span className="material-symbols-outlined !text-[14px] text-white material-symbols-fill">verified</span>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-ios-text mb-1 flex items-center gap-1">
                  {worker.realName || worker.workerProfile?.name || '服务达人'}
                </h2>
                <div className="flex items-center gap-1.5 text-ios-gray">
                  <span className="material-symbols-outlined !text-[16px]">location_on</span>
                  <span className="text-sm font-medium">{worker.serviceArea}</span>
                </div>
              </div>
            </div>

            <div className="px-4 space-y-4 -mt-2">
              {/* 核心数据面板 */}
              <div className="bg-ios-card rounded-3xl p-5 shadow-sm flex divide-x divide-ios-separator">
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-ios-red font-bold text-2xl flex items-baseline">
                    <span className="text-sm">¥</span>{worker.basePrice}
                  </div>
                  <span className="text-xs text-ios-gray mt-1 font-medium">起步价/次</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="font-bold text-2xl text-ios-text flex items-center gap-1">
                    {worker.rating.toFixed(1)}
                    <span className="material-symbols-outlined !text-[18px] text-amber-500 material-symbols-fill">star</span>
                  </div>
                  <span className="text-xs text-ios-gray mt-1 font-medium">综合评分</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="font-bold text-2xl text-ios-text">{worker.orderCount}</div>
                  <span className="text-xs text-ios-gray mt-1 font-medium">已接单数</span>
                </div>
              </div>

              {/* 兼职者照片/资质展示 */}
              {worker.photos && worker.photos.length > 0 && (
                <div className="bg-ios-card rounded-2xl p-4 shadow-sm">
                  <h4 className="font-bold text-sm text-ios-gray mb-3">相关照片</h4>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {worker.photos.map((photo, index) => (
                      <div key={index} className="w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-ios-separator shadow-sm">
                        <img src={photo} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 标题语与签名 */}
              <div className="bg-ios-card rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-2 text-ios-text">{worker.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {worker.skills.map(skill => (
                    <span key={skill} className="bg-ios-blue/10 text-ios-blue px-2.5 py-1 rounded text-xs font-bold border border-ios-blue/20">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="h-px bg-ios-separator w-full mb-4"></div>
                <h4 className="font-bold text-sm text-ios-gray mb-2">关于我</h4>
                <p className="text-[15px] leading-relaxed text-ios-text whitespace-pre-wrap">
                  {worker.bioDescription}
                </p>
              </div>

              {/* 评价模块入口 (预留) */}
              <div className="bg-ios-card rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-95 transition-transform cursor-pointer">
                <div>
                  <h4 className="font-bold text-ios-text">历史雇主评价</h4>
                  <p className="text-xs text-ios-gray mt-0.5">查看近期 {worker.orderCount} 个服务反馈</p>
                </div>
                <span className="material-symbols-outlined text-ios-gray">chevron_right</span>
              </div>
            </div>

            {/* 底部悬浮下单栏 */}
            <div className="fixed bottom-0 left-0 right-0 max-w-[540px] mx-auto bg-ios-card border-t border-ios-separator p-4 ios-blur z-40 pb-safe">
              <div className="flex items-center gap-3">
                <button className="h-12 w-12 rounded-full border border-ios-separator flex items-center justify-center text-ios-gray active:bg-ios-bg">
                  <span className="material-symbols-outlined">chat</span>
                </button>
                <button onClick={() => setShowBookingForm(true)} className="flex-1 bg-ios-blue text-white h-12 rounded-full font-bold text-[16px] shadow-lg shadow-ios-blue/30 active:scale-95 transition-transform">
                  立即预约 TA
                </button>
              </div>
            </div>
          </>
        ) : (
          // ========================
          // 提交预约订单表单视图
          // ========================
          <div className="pt-24 px-4 pb-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <section className="bg-ios-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-ios-separator">
                <img src={worker.workerProfile?.avatar} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="text-sm font-bold text-ios-gray">您正在向其发起预约：</div>
                  <div className="font-bold text-ios-text">{worker.realName || worker.workerProfile?.name || '服务达人'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-ios-text mb-2">需要什么服务？</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'WALKING', label: '牵绳代遛' },
                      { id: 'FEEDING', label: '上门上粮/铲屎' },
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, serviceType: type.id })}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                          formData.serviceType === type.id 
                            ? 'bg-ios-blue text-white shadow-md' 
                            : 'bg-ios-bg text-ios-gray'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ios-text mb-2">期望服务时间</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-ios-bg p-3 rounded-xl border border-ios-separator"
                    value={formData.serviceTime}
                    onChange={e => setFormData({ ...formData, serviceTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ios-text mb-2">您的地址 (精确到门牌号)</label>
                  <input 
                    className="w-full bg-ios-bg p-3 rounded-xl border border-ios-separator"
                    placeholder="小区名称及详细门牌号"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {currentUserProfile.pets.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-ios-text mb-2">为哪只宠宝服务？</label>
                    <select 
                      className="w-full bg-ios-bg p-3 rounded-xl border border-ios-separator"
                      value={formData.petId}
                      onChange={e => setFormData({ ...formData, petId: e.target.value })}
                    >
                      <option value="">（不明确关联宠物）</option>
                      {currentUserProfile.pets.map(p => (
                        <option key={p.id || p.name} value={p.id || ''}>{p.name} ({p.breed})</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-ios-text mb-2">
                    您的出价金额 (基础价: ¥{worker.basePrice})
                  </label>
                  <input 
                    type="number"
                    className="w-full bg-ios-bg p-3 rounded-xl border border-ios-separator font-bold text-ios-red text-lg"
                    placeholder={worker.basePrice.toString()}
                    value={formData.offerPrice}
                    onChange={e => setFormData({ ...formData, offerPrice: e.target.value })}
                  />
                  <p className="text-[11px] text-ios-gray mt-1.5">如果路途较远或有特殊要求，建议适当在基础价上增加跑腿费以提高接单率。</p>
                </div>
              </div>
            </section>

            <button 
              onClick={handleBookSubmit}
              disabled={loading}
              className="w-full bg-ios-blue text-white h-12 rounded-full font-bold text-[16px] shadow-lg shadow-ios-blue/30 active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? '提交中...' : '发送下单邀约'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerDetailScreen;
