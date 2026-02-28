import React, { useState, useRef } from 'react';
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
  // images 数组中保存的可能是本地 File 对应的 DataURL
  const [images, setImages] = useState<string[]>([]);
  // 额外保存本地文件对象以便上传
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // 新增字段
  const [gender, setGender] = useState<'公' | '母' | '亚成体' | '不限'>('公');
  const [age, setAge] = useState('');
  const [vaccines, setVaccines] = useState(false);
  const [dewormed, setDewormed] = useState(false);
  const [tags, setTags] = useState<string[]>([]); // 改为数组
  const [video, setVideo] = useState<string>('');

  const fileRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (type === 'post') {
        const tagContent = tags.length > 0 ? tags.map(t => `#${t}`).join(' ') + ' ' : '';
        
        let imageUrlToSave = undefined;
        const uploadedImages: string[] = [];
        
        // 依次上传图片
        for (const file of imageFiles) {
            const uploadRes = await uploadImage(file);
            if (uploadRes.success && uploadRes.url) {
                uploadedImages.push(uploadRes.url);
            }
        }
        
        // 当作为封面的第一张图
        if (uploadedImages.length > 0) {
            imageUrlToSave = uploadedImages[0];
        } else if (images.length > 0 && !imageFiles.length) {
            // 兼容已有 base64 （如演示数据）
            imageUrlToSave = images[0];
            uploadedImages.push(...images);
        }

        onPublish({
          title,
          content: tagContent + content,
          image: imageUrlToSave,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
          video: video || undefined,
          location: location || undefined
        });
      } else {
          
        let imageUrlToSave = undefined;
        if (imageFiles.length > 0) {
            const uploadRes = await uploadImage(imageFiles[0]);
            if (uploadRes.success && uploadRes.url) {
                imageUrlToSave = uploadRes.url;
            }
        } else if (images.length > 0) {
            imageUrlToSave = images[0];
        }
          
        onPublishItem({
          name: title,
          description: content,
          image: imageUrlToSave,
          price: parseFloat(price) || 0,
          category,
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
    if (tags.includes(t)) {
      setTags(prev => prev.filter(tag => tag !== t));
    } else {
      setTags(prev => [...prev, t]);
    }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
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
        if (result.success && result.url) {
          setVideo(result.url);
        } else {
          alert(result.error || '视频上传失败');
        }
      } catch (error) {
        alert('视频上传失败，请重试');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeVideo = () => {
    setVideo('');
  };

  const toggleLocation = async () => {
    if (location) {
      setLocation('');
    } else {
      setLocation('定位中...');
      try {
        const result = await getCurrentLocation();
        setLocation(result.formatted);
      } catch (error) {
        console.error('定位失败:', error);
        setLocation('');
        alert(error instanceof Error ? error.message : '定位失败');
      }
    }
  };

  if (step === 'form') {
    return (
      <div className="flex flex-col min-h-screen bg-white animate-in slide-in-from-right duration-300">
        <header className="h-[88px] pt-10 px-4 flex items-center justify-between border-b border-black/5 shrink-0">
          <button onClick={() => setStep('choice')} disabled={isPublishing} className="text-ios-blue text-[17px] disabled:opacity-30">取消</button>
          <span className="font-bold text-[17px]">{type === 'post' ? '新动态' : '发布闲置'}</span>
          <button onClick={handlePublish} disabled={!title || !content || isPublishing} className="text-ios-blue font-bold text-[17px] disabled:opacity-30">
              {isPublishing ? '发布中...' : '发布'}
          </button>
        </header>
        <main className="p-4 space-y-6 overflow-y-auto no-scrollbar">

          {/* 图片展示区 - 支持多图 */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {images.map((img, index) => (
              <div key={index} className="w-28 h-28 shrink-0 relative rounded-2xl overflow-hidden group">
                <img src={img} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined !text-[16px]">close</span>
                </button>
              </div>
            ))}

            <div
              onClick={() => fileRef.current?.click()}
              className="w-28 h-28 shrink-0 bg-ios-bg rounded-2xl flex flex-col items-center justify-center text-ios-gray border-2 border-dashed border-ios-separator cursor-pointer active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined !text-[32px]">add_photo_alternate</span>
              <span className="text-[12px] mt-1">添加</span>
            </div>
          </div>
          <input ref={fileRef} type="file" className="hidden" accept="image/*" multiple onChange={onImageChange} />

          {/* 视频展示区 */}
          {type === 'post' && (
            <div className="flex gap-3 pb-2">
              {isUploading ? (
                <div className="w-28 h-28 shrink-0 bg-ios-bg rounded-2xl flex flex-col items-center justify-center text-ios-blue border-2 border-ios-blue">
                  <span className="material-symbols-outlined !text-[32px] animate-spin">progress_activity</span>
                  <span className="text-[12px] mt-1">上传中...</span>
                </div>
              ) : video ? (
                <div className="w-full relative rounded-2xl overflow-hidden">
                  <video src={video} className="w-full h-40 object-cover" controls />
                  <button
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                  >
                    <span className="material-symbols-outlined !text-[16px]">close</span>
                  </button>
                </div>
              ) : (
                <label className="w-28 h-28 shrink-0 bg-ios-bg rounded-2xl flex flex-col items-center justify-center text-ios-gray border-2 border-dashed border-ios-separator cursor-pointer active:scale-95 transition-transform">
                  <span className="material-symbols-outlined !text-[32px]">videocam</span>
                  <span className="text-[12px] mt-1">添加视频</span>
                  <input type="file" className="hidden" accept="video/mp4,video/webm,video/mov" onChange={onVideoChange} />
                </label>
              )}
            </div>
          )}

          <input
            className="w-full text-2xl font-bold border-none focus:ring-0 p-0 placeholder:text-ios-gray/40"
            placeholder={type === 'post' ? "填写标题..." : "宝贝名称..."}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {type === 'market' && (
            <div className="space-y-5 pt-2">
              <div className="flex items-center gap-2 bg-ios-bg px-4 py-3 rounded-xl">
                <span className="text-ios-red font-bold text-lg">¥</span>
                <input
                  type="number"
                  className="bg-transparent border-none focus:ring-0 text-ios-red font-bold text-lg p-0 flex-1"
                  placeholder="定价"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>

              {/* 分类 */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {['狗狗', '猫咪', '鸟类', '爬宠', '其他'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat as MarketItem['category'])}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${category === cat ? 'bg-ios-blue text-white shadow-md' : 'bg-ios-bg text-ios-gray'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 详细属性 */}
              <div className="bg-ios-bg rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ios-gray">性别</span>
                  <div className="flex bg-white rounded-lg p-1">
                    {['公', '母', '不限'].map(g => (
                      <button
                        key={g}
                        onClick={() => setGender(g as any)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${gender === g ? 'bg-ios-blue text-white shadow-sm' : 'text-ios-gray'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="text-sm font-bold text-ios-gray">年龄</span>
                  <input
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="例如: 3个月"
                    className="text-right text-sm font-bold bg-transparent border-none focus:ring-0 w-32 placeholder:font-normal"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="text-sm font-bold text-ios-gray">疫苗已打</span>
                  <button
                    onClick={() => setVaccines(!vaccines)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${vaccines ? 'bg-ios-green' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${vaccines ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="text-sm font-bold text-ios-gray">驱虫已做</span>
                  <button
                    onClick={() => setDewormed(!dewormed)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${dewormed ? 'bg-ios-green' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${dewormed ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {type === 'post' && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
              {['日常', '求助', '晒图', '科普', '搞笑', '领养'].map(t => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${tags.includes(t) ? 'bg-ios-blue text-white border-ios-blue' : 'bg-white border-ios-gray/30 text-ios-gray'}`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          <textarea
            className="w-full h-32 text-[17px] border-none focus:ring-0 p-0 placeholder:text-ios-gray/40 resize-none bg-transparent"
            placeholder={type === 'post' ? "分享此刻心情..." : "描述一下宝贝的详情..."}
            value={content}
            onChange={e => setContent(e.target.value)}
          />

          <div className="space-y-1">
            <button
              onClick={toggleLocation}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${location ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'bg-ios-bg border-transparent text-ios-gray'}`}
            >
              <span className="material-symbols-outlined !text-[20px]">{location ? 'location_on' : 'add_location'}</span>
              <span className="text-[14px] font-medium">{location || '你在哪里？'}</span>
              {location && <span className="material-symbols-outlined !text-[16px]" onClick={(e) => { e.stopPropagation(); setLocation(''); }}>close</span>}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg animate-in fade-in slide-in-from-bottom duration-300">
      <div className="sticky top-0 z-50 ios-blur pt-2 pb-4 px-4 border-b border-black/10">
        <div className="w-10 h-1 bg-[#C7C7CC] rounded-full mx-auto mb-4"></div>
        <div className="flex items-center justify-between">
          <button onClick={onCancel} className="text-ios-blue text-[17px]">取消</button>
          <h1 className="text-[17px] font-semibold">选择发布类型</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <main className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="space-y-4">
          <button onClick={() => { setType('post'); setStep('form'); }} className="w-full bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 active:scale-95 transition-all text-left">
            <div className="w-14 h-14 bg-ios-blue/10 rounded-xl flex items-center justify-center text-ios-blue shrink-0">
              <span className="material-symbols-outlined !text-[32px] material-symbols-fill">photo_library</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">发布动态</h3>
              <p className="text-sm text-ios-gray">分享宠物生活的点滴</p>
            </div>
          </button>

          <button onClick={() => { setType('market'); setStep('form'); }} className="w-full bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 active:scale-95 transition-all text-left">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
              <span className="material-symbols-outlined !text-[32px] material-symbols-fill">sell</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">闲置交易</h3>
              <p className="text-sm text-ios-gray">转让用品或寻找新主人</p>
            </div>
          </button>

          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-purple-600 !text-[24px]">auto_awesome</span>
              <h4 className="font-bold text-purple-900">试试 AI 咨询？</h4>
            </div>
            <p className="text-sm text-purple-700/80 mb-4">寻求健康建议？直接咨询 AI 宠医，即时获取专业答复。</p>
            <button onClick={onSelectAI} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200">开始咨询</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublishScreen;
