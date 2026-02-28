import React, { useState, useRef, useMemo } from 'react';
import { Post, MarketItem } from '../types';
import { getCurrentLocation } from '../services/qqMapService';
import { uploadVideo, uploadImage } from '../services/uploadService';

interface PublishScreenProps {
  onCancel: () => void;
  onSelectAI: () => void;
  onPublish: (post: Partial<Post>) => void;
  onPublishItem: (item: Partial<MarketItem>) => void;
}

const PublishScreen: React.FC<PublishScreenProps> = ({ onCancel, onSelectAI, onPublish, onPublishItem }) => {
  const [step, setStep] = useState<'choice' | 'form'>('choice');
  const [type, setType] = useState<'post' | 'market'>('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<MarketItem['category']>('狗狗');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // 宠物分类定义 (与集市页同步)
  const ALL_CATEGORY_DATA = [
    { label: '狗狗', icon: 'pets', color: 'text-orange-400' },
    { label: '猫咪', icon: 'pets', color: 'text-yellow-500' },
    { label: '鸟类', icon: 'flutter_dash', color: 'text-blue-400' },
    { label: '爬宠', icon: 'egg', color: 'text-emerald-500' },
    { label: '水族', icon: 'water', color: 'text-cyan-500' },
    { label: '仓鼠', icon: 'cruelty_free', color: 'text-pink-400' },
    { label: '兔子', icon: 'cruelty_free', color: 'text-purple-400' },
    { label: '豚鼠', icon: 'potted_plant', color: 'text-orange-300' },
    { label: '龙猫', icon: 'Pets', color: 'text-slate-400' },
    { label: '蜘蛛', icon: 'bug_report', color: 'text-red-400' },
    { label: '蝎子', icon: 'bug_report', color: 'text-amber-600' },
    { label: '昆虫', icon: 'emoji_nature', color: 'text-green-500' },
    { label: '马', icon: 'bedroom_baby', color: 'text-brown-500' },
    { label: '猪', icon: 'savings', color: 'text-pink-300' },
    { label: '牛', icon: 'cruelty_free', color: 'text-gray-600' },
    { label: '羊', icon: 'cloud', color: 'text-gray-400' },
    { label: '其他', icon: 'more_horiz', color: 'text-gray-500' },
  ];

  const PET_BREEDS: Record<string, string[]> = {
    '狗狗': ['金毛', '泰迪', '柴犬', '柯基', '比熊', '边牧', '拉布拉多', '萨摩耶', '哈士奇', '阿拉斯加', '德牧', '法斗', '雪纳瑞', '其他犬种'],
    '猫咪': ['英短', '美短', '布偶', '蓝猫', '渐层', '暹罗', '缅因', '加菲', '无毛猫', '折耳猫', '波斯猫', '其他猫种'],
    '鸟类': ['虎皮', '玄凤', '牡丹', '和尚', '金太阳', '灰机', '其他鸟类'],
    '爬宠': ['玉米蛇', '球蟒', '守宫', '鬣蜥', '陆龟', '水龟', '其他爬宠'],
    '水族': ['金鱼', '锦鲤', '孔雀鱼', '灯鱼', '斗鱼', '锦带', '其他鱼类'],
  };

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!catSearchQuery.trim()) return ALL_CATEGORY_DATA;
    return ALL_CATEGORY_DATA.filter(c => c.label.includes(catSearchQuery));
  }, [catSearchQuery, ALL_CATEGORY_DATA]);

  const [gender, setGender] = useState<'公' | '母' | '亚成体' | '不限'>('公');
  const [age, setAge] = useState('');
  const [vaccines, setVaccines] = useState(false);
  const [dewormed, setDewormed] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [video, setVideo] = useState<string>('');
  const [customCategory, setCustomCategory] = useState('');
  const [breed, setBreed] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      let imageUrlToSave = undefined;
      const uploadedImages: string[] = [];
      for (const file of imageFiles) {
        const uploadRes = await uploadImage(file);
        if (uploadRes.success && uploadRes.url) {
          uploadedImages.push(uploadRes.url);
        }
      }

      if (uploadedImages.length > 0) {
        imageUrlToSave = uploadedImages[0];
      } else if (images.length > 0) {
        imageUrlToSave = images[0];
        uploadedImages.push(...images);
      }

      if (type === 'post') {
        const tagContent = tags.length > 0 ? tags.map(t => `#${t}`).join(' ') + ' ' : '';
        onPublish({
          title,
          content: tagContent + content,
          image: imageUrlToSave,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
          video: video || undefined,
          location: location || undefined
        });
      } else {
        onPublishItem({
          name: title,
          description: content,
          image: imageUrlToSave,
          price: parseFloat(price) || 0,
          category: category === '其他' && customCategory ? (customCategory as any) : category,
          breed: breed || '未知',
          location: location || '上海',
          gender: gender === '不限' ? '公' : gender,
          age: age || '未知',
          vaccines,
          dewormed,
        });
      }
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布异常，请重试');
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleTag = (t: string) => {
    setTags(prev => prev.includes(t) ? prev.filter(tag => tag !== t) : [...prev, t]);
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files) as File[];
      setImageFiles(prev => [...prev, ...newFiles]);
      newFiles.forEach((f: File) => {
        const r = new FileReader();
        r.onload = () => setImages(prev => [...prev, r.result as string]);
        r.readAsDataURL(f);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await uploadVideo(file);
        if (result.success && result.url) setVideo(result.url);
        else alert(result.error || '视频上传失败');
      } catch (error) {
        alert('视频上传失败');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const toggleLocation = async () => {
    if (location) setLocation('');
    else {
      setLocation('定位中...');
      try {
        const result = await getCurrentLocation();
        setLocation(result.formatted);
      } catch (error) {
        setLocation('');
        alert('定位失败');
      }
    }
  };

  if (step === 'form') {
    return (
      <div className="flex flex-col min-h-screen bg-ios-card transition-colors duration-300">
        <header className="h-[88px] pt-10 px-4 flex items-center justify-between border-b border-ios-separator shrink-0">
          <button onClick={() => setStep('choice')} disabled={isPublishing} className="text-ios-blue text-[17px] disabled:opacity-30">取消</button>
          <span className="font-bold text-[17px]">{type === 'post' ? '新动态' : '发布闲置'}</span>
          <button onClick={handlePublish} disabled={!title || !content || isPublishing} className="text-ios-blue font-bold text-[17px] disabled:opacity-30">
            {isPublishing ? '发布中...' : '发布'}
          </button>
        </header>

        <main className="flex-1 p-4 space-y-6 overflow-y-auto no-scrollbar pb-32">
          {/* 媒体上传 */}
          <div className="space-y-4">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {images.map((img, index) => (
                <div key={index} className="w-24 h-24 shrink-0 relative rounded-xl overflow-hidden group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined !text-[14px]">close</span>
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 shrink-0 bg-ios-bg rounded-xl flex flex-col items-center justify-center text-ios-gray border-2 border-dashed border-ios-separator active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined !text-[28px]">add_photo_alternate</span>
                <span className="text-[10px] mt-1">添加图片</span>
              </button>
            </div>
            <input ref={fileRef} type="file" className="hidden" accept="image/*" multiple onChange={onImageChange} />

            {type === 'post' && (
              <div className="flex gap-3">
                {isUploading ? (
                  <div className="w-24 h-24 shrink-0 bg-ios-bg rounded-xl flex flex-col items-center justify-center text-ios-blue border-2 border-ios-blue">
                    <span className="material-symbols-outlined !text-[24px] animate-spin">progress_activity</span>
                  </div>
                ) : video ? (
                  <div className="w-full relative rounded-xl overflow-hidden max-h-48 bg-black">
                    <video src={video} className="w-full h-full object-contain" controls />
                    <button onClick={() => setVideo('')} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><span className="material-symbols-outlined !text-[16px]">close</span></button>
                  </div>
                ) : (
                  <label className="w-24 h-24 shrink-0 bg-ios-bg rounded-xl flex flex-col items-center justify-center text-ios-gray border-2 border-dashed border-ios-separator cursor-pointer active:scale-95 transition-transform">
                    <span className="material-symbols-outlined !text-[28px]">videocam</span>
                    <span className="text-[10px] mt-1">添加视频</span>
                    <input type="file" className="hidden" accept="video/*" onChange={onVideoChange} />
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <input
              className="w-full text-2xl font-bold border-none focus:ring-0 p-0 placeholder:text-ios-gray/40"
              placeholder={type === 'post' ? "填写标题..." : "宝贝名称..."}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            {type === 'market' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 bg-ios-bg px-4 py-3 rounded-xl">
                  <span className="text-ios-red font-bold text-lg">¥</span>
                  <input type="number" className="bg-transparent border-none focus:ring-0 text-ios-red font-bold text-lg p-0 flex-1" placeholder="定价" value={price} onChange={e => setPrice(e.target.value)} />
                </div>

                {/* 分类 */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-ios-gray uppercase tracking-wider ml-1">宠物种类</span>
                  <button onClick={() => setShowCategoryPicker(true)} className="flex items-center justify-between bg-ios-bg px-4 py-4 rounded-2xl border border-black/5 active:bg-black/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-ios-bg flex items-center justify-center shadow-sm">
                        <span className={`material-symbols-outlined !text-[24px] ${ALL_CATEGORY_DATA.find(c => c.label === category)?.color || 'text-ios-gray'}`}>{ALL_CATEGORY_DATA.find(c => c.label === category)?.icon || 'pets'}</span>
                      </div>
                      <span className="text-[17px] font-bold">{category === '其他' && customCategory ? customCategory : category}</span>
                    </div>
                    <span className="material-symbols-outlined text-ios-gray">expand_more</span>
                  </button>
                </div>

                {/* 品种 */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-ios-gray uppercase tracking-wider ml-1">宠物品种</span>
                  {PET_BREEDS[category] ? (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                      {PET_BREEDS[category].map(b => (
                        <button key={b} onClick={() => setBreed(b)} className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border whitespace-nowrap ${breed === b ? 'bg-ios-blue text-white border-ios-blue' : 'bg-ios-card border-ios-separator shadow-none'}`}>{b}</button>
                      ))}
                      <button onClick={() => setBreed('')} className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border whitespace-nowrap ${!PET_BREEDS[category].includes(breed) && breed ? 'bg-ios-blue text-white border-ios-blue' : 'bg-ios-card border-ios-separator shadow-none'}`}>手动输入</button>
                    </div>
                  ) : null}
                  {(!PET_BREEDS[category] || !PET_BREEDS[category].includes(breed)) && (
                    <div className="bg-ios-bg px-4 py-3 rounded-xl border border-black/5">
                      <input className="w-full bg-transparent border-none focus:ring-0 text-[16px] p-0 placeholder:text-ios-gray/40 font-bold" placeholder="请输入具体品种..." value={breed} onChange={e => setBreed(e.target.value)} />
                    </div>
                  )}
                </div>

                {/* 详情属性 */}
                <div className="bg-ios-bg rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ios-gray">性别</span>
                    <div className="flex bg-ios-bg border border-ios-separator rounded-lg p-1">
                      {['公', '母', '不限'].map(g => (
                        <button key={g} onClick={() => setGender(g as any)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${gender === g ? 'bg-ios-blue text-white shadow-sm' : 'text-ios-gray'}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-black/5 pt-4">
                    <span className="text-sm font-bold text-ios-gray">年龄</span>
                    <input value={age} onChange={e => setAge(e.target.value)} placeholder="例如: 3个月" className="text-right text-sm font-bold bg-transparent border-none focus:ring-0 w-32 placeholder:font-normal" />
                  </div>
                  <div className="flex items-center justify-between border-t border-black/5 pt-4">
                    <span className="text-sm font-bold text-ios-gray">疫苗及驱虫</span>
                    <div className="flex gap-4">
                      <button onClick={() => setVaccines(!vaccines)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${vaccines ? 'bg-green-500 text-white border-green-500' : 'bg-ios-bg text-ios-gray border-ios-separator'}`}>已预苗</button>
                      <button onClick={() => setDewormed(!dewormed)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${dewormed ? 'bg-blue-500 text-white border-blue-500' : 'bg-ios-bg text-ios-gray border-ios-separator'}`}>已驱虫</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {type === 'post' && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                {['日常', '求助', '晒图', '领养'].map(t => (
                  <button key={t} onClick={() => toggleTag(t)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${tags.includes(t) ? 'bg-ios-blue text-white border-ios-blue' : 'bg-ios-bg border-ios-separator text-ios-gray'}`}>#{t}</button>
                ))}
              </div>
            )}

            <textarea
              className="w-full h-32 text-[17px] border-none focus:ring-0 p-0 placeholder:text-ios-gray/40 resize-none bg-transparent"
              placeholder={type === 'post' ? "分享宠物生活..." : "描述宠物的健康状况、性格等..."}
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            <button onClick={toggleLocation} className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-[14px] font-medium ${location ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'bg-ios-bg border-transparent text-ios-gray'}`}>
              <span className="material-symbols-outlined !text-[20px]">{location ? 'location_on' : 'add_location'}</span>
              <span>{location || '点击定位'}</span>
            </button>
          </div>
        </main>

        {/* 分类弹窗 */}
        {showCategoryPicker && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
            <div className="w-full bg-ios-card rounded-t-[32px] border-t border-ios-separator shadow-2xl">
              <div className="w-12 h-1.5 bg-ios-separator/30 rounded-full mx-auto mt-3 mb-1"></div>
              <header className="px-6 py-4 flex items-center justify-between border-b border-black/5">
                <h2 className="text-xl font-bold">选择种类</h2>
                <button onClick={() => setShowCategoryPicker(false)} className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center"><span className="material-symbols-outlined !text-[18px]">close</span></button>
              </header>
              <div className="p-4"><input className="w-full bg-ios-bg rounded-xl px-4 py-3 border-none focus:ring-0" placeholder="搜分类..." value={catSearchQuery} onChange={e => setCatSearchQuery(e.target.value)} /></div>
              <div className="flex-1 overflow-y-auto px-4 pb-12">
                {category === '其他' && (
                  <div className="mb-6 flex gap-2">
                    <input className="flex-1 bg-ios-bg rounded-xl px-4 py-3 border border-ios-blue/30 focus:ring-0 font-bold" placeholder="自定义名称..." value={customCategory} onChange={e => setCustomCategory(e.target.value)} />
                    <button onClick={() => setShowCategoryPicker(false)} className="bg-ios-blue text-white px-6 rounded-xl font-bold">确定</button>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-4">
                  {filteredCategories.map(c => (
                    <button key={c.label} onClick={() => { setCategory(c.label as any); if (c.label !== '其他') { setShowCategoryPicker(false); setBreed(''); } }} className="flex flex-col items-center gap-2">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${category === c.label ? 'bg-ios-blue text-white shadow-lg' : 'bg-ios-bg'}`}>
                        <span className={`material-symbols-outlined !text-[28px] ${category === c.label ? 'text-white' : c.color}`}>{c.icon}</span>
                      </div>
                      <span className="text-[12px] font-bold truncate w-full text-center">{c.label === '其他' && customCategory ? customCategory : c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg animate-in fade-in duration-300">
      <div className="sticky top-0 z-50 ios-blur pt-2 pb-4 px-4 border-b border-black/10">
        <div className="w-10 h-1 bg-ios-separator/30 rounded-full mx-auto mb-4"></div>
        <div className="flex items-center justify-between">
          <button onClick={onCancel} className="text-ios-blue text-[17px]">取消</button>
          <h1 className="text-[17px] font-semibold">发布宠物</h1>
          <div className="w-12"></div>
        </div>
      </div>
      <main className="flex-1 p-6 space-y-6">
        <button onClick={() => { setType('post'); setStep('form'); }} className="w-full bg-ios-card shadow-lg border border-ios-separator">
          <div className="w-16 h-16 bg-ios-blue/10 rounded-2xl flex items-center justify-center text-ios-blue shrink-0"><span className="material-symbols-outlined !text-[36px] material-symbols-fill">photo_library</span></div>
          <div><h3 className="font-bold text-xl mb-1">发布动态</h3><p className="text-sm text-ios-gray font-medium">分享可爱的宠物日常</p></div>
        </button>
        <button onClick={() => { setType('market'); setStep('form'); }} className="w-full bg-ios-card shadow-lg border border-ios-separator">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 shrink-0"><span className="material-symbols-outlined !text-[36px] material-symbols-fill">sell</span></div>
          <div><h3 className="font-bold text-xl mb-1">闲置交易</h3><p className="text-sm text-ios-gray font-medium">转让闲置或寻找爱宠</p></div>
        </button>
        <div className="bg-purple-100/50 rounded-3xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3"><span className="material-symbols-outlined text-purple-600">auto_awesome</span><h4 className="font-bold text-purple-900">试试 AI 宠医？</h4></div>
          <p className="text-sm text-purple-700/80 mb-5">24小时在线为您解答宠物健康问题</p>
          <button onClick={onSelectAI} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-purple-200">开始咨询</button>
        </div>
      </main>
    </div>
  );
};

export default PublishScreen;
