import React, { useState, useEffect } from 'react';
import * as partTimeService from '../services/partTimeService';
import { ServiceWorker } from '../types';

interface Props {
  onBack: () => void;
  onSuccess: (workerProfile: ServiceWorker) => void;
}

const BecomeWorkerScreen: React.FC<Props> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    realName: '',
    photos: [] as string[],
    title: '',
    serviceArea: '',
    basePrice: '',
    bioDescription: '',
    skills: [] as string[]
  });
  
  const [skillInput, setSkillInput] = useState('');

  // 尝试加载是否已经有旧的档案了
  useEffect(() => {
    partTimeService.getMyWorkerProfile().then(profile => {
      if (profile) {
        setFormData({
          realName: profile.realName || '',
          photos: profile.photos || [],
          title: profile.title,
          serviceArea: profile.serviceArea,
          basePrice: profile.basePrice.toString(),
          bioDescription: profile.bioDescription,
          skills: profile.skills || []
        });
      }
    });
  }, []);

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleAddPhoto = () => {
    if (formData.photos.length >= 3) {
      alert('最多只能上传3张照片哦');
      return;
    }
    const newPhoto = `https://picsum.photos/seed/${Date.now()}/400/400`;
    setFormData(prev => ({ ...prev, photos: [...prev.photos, newPhoto] }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.serviceArea || !formData.basePrice || !formData.bioDescription || !formData.realName) {
      alert('请填写完整的必填项(包括姓名/标题/区域/价格/介绍)');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await partTimeService.upsertWorkerProfile({
        realName: formData.realName,
        photos: formData.photos,
        title: formData.title,
        serviceArea: formData.serviceArea,
        basePrice: parseFloat(formData.basePrice) || 0,
        bioDescription: formData.bioDescription,
        skills: formData.skills
      });

      if (error) {
        alert(error);
        return;
      }

      if (data) {
        alert('入驻成功！');
        onSuccess(data);
      }
    } catch (error) {
      console.error(error);
      alert('发布出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg">
      <header className="sticky top-0 z-50 bg-ios-card/80 ios-blur border-b border-ios-separator pt-12 pb-4 px-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 text-ios-blue active:opacity-70">
            <span className="material-symbols-outlined !text-3xl">close</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight">我要接单 (服务档案)</h1>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="text-ios-blue font-bold px-2 py-1 active:opacity-70 disabled:opacity-50"
          >
            {loading ? '提交中' : '保存'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24 overflow-y-auto space-y-4">
        <section className="bg-ios-card rounded-2xl p-4 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-bold text-ios-text mb-2">你的真实姓名 (必填)</label>
            <input 
              className="w-full bg-ios-bg p-3 rounded-xl border border-ios-separator"
              placeholder="怎么称呼你 (如: 王同学)"
              value={formData.realName}
              onChange={e => setFormData({ ...formData, realName: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-ios-text mb-2">服务标题标签 (必填)</label>
            <input 
              className="w-full bg-ios-bg p-3 rounded-xl border border-ios-separator"
              placeholder="一句话介绍 (例如：三年养狗经验，周末全天接单)"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-ios-text mb-2">覆盖区域 (可接单范围)</label>
            <input 
              className="w-full bg-ios-bg p-3 rounded-xl border border-ios-separator"
              placeholder="例如：杭州下沙大学城周边"
              value={formData.serviceArea}
              onChange={e => setFormData({ ...formData, serviceArea: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ios-text mb-2">期待基础报酬 (起步价 / 次)</label>
            <input 
              type="number"
              className="w-full bg-ios-bg p-3 rounded-xl border border-ios-separator font-bold text-ios-red text-lg"
              placeholder="30.00"
              value={formData.basePrice}
              onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
            />
            <p className="text-xs text-ios-gray mt-2">注：接单时可与雇主视距离与难度体型再在最终订单中调整报价。</p>
          </div>
        </section>

        <section className="bg-ios-card rounded-2xl p-4 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-bold text-ios-text mb-2">技能标签</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map(skill => (
                <div key={skill} className="flex items-center gap-1 bg-ios-blue/10 text-ios-blue px-3 py-1.5 rounded-full text-xs font-bold">
                  <span>{skill}</span>
                  <button onClick={() => handleRemoveSkill(skill)} className="flex items-center">
                    <span className="material-symbols-outlined !text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input 
                className="flex-1 bg-ios-bg p-2 rounded-xl border border-ios-separator text-sm"
                placeholder="例如：剪指甲 / 大型犬 / 喂药"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(); }}
              />
              <button 
                onClick={handleAddSkill}
                className="bg-ios-blue text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ios-text mb-2">自我介绍与接单经验</label>
            <textarea 
              className="w-full bg-ios-bg p-3 rounded-xl border border-ios-separator h-32 resize-none"
              placeholder="详细向别人展示你为什么能胜任这项工作（养宠经历、时间充裕度、是否有车等）..."
              value={formData.bioDescription}
              onChange={e => setFormData({ ...formData, bioDescription: e.target.value })}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-ios-text mb-2">照片资质 (可传3张)</label>
            <div className="flex flex-wrap gap-2">
              {formData.photos.map((photo, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-ios-separator">
                  <img src={photo} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                  >
                    <span className="material-symbols-outlined !text-[12px]">close</span>
                  </button>
                </div>
              ))}
              {formData.photos.length < 3 && (
                <button 
                  onClick={handleAddPhoto}
                  className="w-20 h-20 bg-ios-bg border-2 border-dashed border-ios-separator rounded-xl flex flex-col items-center justify-center text-ios-gray active:opacity-70"
                >
                  <span className="material-symbols-outlined !text-2xl">add_photo_alternate</span>
                </button>
              )}
            </div>
            <p className="text-xs text-ios-gray mt-2">提示：您可以上传与宠物相处的照片，增加雇主的信任度。</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BecomeWorkerScreen;
