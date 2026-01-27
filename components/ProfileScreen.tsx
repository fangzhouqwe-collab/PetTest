
import React, { useState, useRef } from 'react';
import { UserProfile, Post, Pet } from '../types';
import { useAuthContext } from '../contexts/AuthContext';

interface ProfileScreenProps {
  user: UserProfile;
  posts: Post[];
  onUpdateProfile: (u: UserProfile) => void;
  onAddPet: (pet: Pet) => void;
  onLogout?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, posts, onUpdateProfile, onAddPet, onLogout }) => {
  const { user: authUser, signOut } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [tempUser, setTempUser] = useState(user);
  const [newPetName, setNewPetName] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetImg, setNewPetImg] = useState<string | null>(null);

  const bgInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const petImgInputRef = useRef<HTMLInputElement>(null);
  const myPosts = posts.filter(p => p.isMine);

  const save = () => {
    onUpdateProfile(tempUser);
    setIsEditing(false);
  };

  const handleAddPetClick = () => {
    if (newPetName && newPetBreed) {
      onAddPet({
        name: newPetName,
        breed: newPetBreed,
        img: newPetImg || `https://picsum.photos/seed/${Date.now()}/300/300`
      });
      setNewPetName('');
      setNewPetBreed('');
      setNewPetImg(null);
      setShowAddPet(false);
    }
  };

  const handleFileChange = (type: 'avatar' | 'bg' | 'pet') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = () => {
        if (type === 'avatar') setTempUser(prev => ({ ...prev, avatar: r.result as string }));
        else if (type === 'bg') setTempUser(prev => ({ ...prev, bgImage: r.result as string }));
        else if (type === 'pet') setNewPetImg(r.result as string);
      };
      r.readAsDataURL(f);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onLogout?.();
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/user/${authUser?.id || 'demo'}`;
    navigator.clipboard.writeText(profileUrl);
    alert('个人主页链接已复制！');
    setShowShareModal(false);
  };

  // 编辑页面
  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen bg-white animate-in slide-in-from-bottom duration-300">
        <header className="h-[88px] pt-10 px-4 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-50">
          <button onClick={() => setIsEditing(false)} className="text-ios-blue text-[17px]">取消</button>
          <span className="font-bold">编辑个人资料</span>
          <button onClick={save} className="text-ios-blue font-bold text-[17px]">保存</button>
        </header>
        <main className="p-4 space-y-6 overflow-y-auto no-scrollbar pb-10">
          <div className="relative">
            <div
              onClick={() => bgInputRef.current?.click()}
              className="h-40 w-full bg-ios-bg rounded-xl overflow-hidden cursor-pointer relative group"
            >
              <img src={tempUser.bgImage} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined !text-[32px] drop-shadow-md">image</span>
              </div>
            </div>
            <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={handleFileChange('bg')} />

            <div className="flex flex-col items-center -mt-12 mb-4">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <img src={tempUser.avatar} className="size-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined !text-[28px]">photo_camera</span>
                </div>
              </div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleFileChange('avatar')} />
              <span className="text-[14px] text-ios-blue font-bold mt-2">更换头像</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-ios-gray ml-1 uppercase tracking-wider">昵称</label>
              <input
                className="w-full bg-ios-bg border-none rounded-xl px-4 py-3.5 text-[17px] focus:ring-2 focus:ring-ios-blue"
                value={tempUser.name}
                onChange={e => setTempUser({ ...tempUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-ios-gray ml-1 uppercase tracking-wider">个人介绍</label>
              <textarea
                className="w-full bg-ios-bg border-none rounded-xl px-4 py-3.5 text-[17px] focus:ring-2 focus:ring-ios-blue h-36 resize-none"
                placeholder="介绍一下你自己..."
                value={tempUser.bio}
                onChange={e => setTempUser({ ...tempUser, bio: e.target.value })}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg relative">
      <header className="sticky top-0 z-[100] ios-blur bg-white/60 border-b border-black/10 px-4 h-11 flex items-center justify-between">
        <button onClick={() => setShowSettings(true)} className="text-ios-blue">
          <span className="material-symbols-outlined text-[24px]">settings</span>
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight">个人中心</h1>
        <button onClick={handleShare} className="text-ios-blue">
          <span className="material-symbols-outlined text-[24px]">share</span>
        </button>
      </header>

      {/* User Info & Stats */}
      <section className="relative bg-white shadow-sm">
        <div className="h-56 w-full bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${user.bgImage})` }}>
          <div className="w-full h-full bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
        <div className="px-6 pb-6 -mt-12 relative z-10">
          <div className="flex items-end gap-5 mb-4">
            <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white shrink-0">
              <img src={user.avatar} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-2xl font-bold tracking-tight mb-0.5 text-black drop-shadow-md">{user.name}</h2>
              <p className="text-[12px] text-black/60 drop-shadow-sm font-medium">ID: {authUser?.id?.slice(0, 8) || '10294857'}</p>
            </div>
          </div>

          <p className="text-[16px] text-black/80 leading-relaxed mb-6 font-medium pr-4">{user.bio}</p>

          {/* 社交数据 - 新增 */}
          <div className="flex items-center gap-12 px-1 mb-6">
            <div className="flex flex-col cursor-pointer active:scale-95 transition-transform">
              <span className="text-[19px] font-bold tracking-tight">1,240</span>
              <span className="text-[11px] text-ios-gray font-bold uppercase tracking-wider">粉丝</span>
            </div>
            <div className="flex flex-col cursor-pointer active:scale-95 transition-transform">
              <span className="text-[19px] font-bold tracking-tight">450</span>
              <span className="text-[11px] text-ios-gray font-bold uppercase tracking-wider">关注</span>
            </div>
            <div className="flex flex-col cursor-pointer active:scale-95 transition-transform">
              <span className="text-[19px] font-bold tracking-tight">{myPosts.length}</span>
              <span className="text-[11px] text-ios-gray font-bold uppercase tracking-wider">动态</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-ios-blue text-white py-3.5 rounded-2xl text-[16px] font-bold active:scale-[0.98] transition-all shadow-lg shadow-ios-blue/20"
          >
            编辑个人资料
          </button>
        </div>
      </section>

      {/* 功能快捷入口 - 新增 */}
      <section className="px-4 mt-4">
        <div className="bg-white rounded-3xl p-4 grid grid-cols-4 gap-2 shadow-sm">
          {[
            { label: '我的订单', icon: 'shopping_bag', color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: '浏览历史', icon: 'history', color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: '钱包卡券', icon: 'account_balance_wallet', color: 'text-green-500', bg: 'bg-green-50' },
            { label: '地址管理', icon: 'location_on', color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map((item, i) => (
            <button key={i} className="flex flex-col items-center gap-2 py-2 active:scale-95 transition-transform">
              <div className={`size-11 rounded-2xl ${item.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${item.color} !text-[22px]`}>{item.icon}</span>
              </div>
              <span className="text-[11px] font-medium text-[#1C1C1E]">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 px-6 bg-white py-6 rounded-3xl shadow-sm mx-4 mb-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[18px] font-bold tracking-tight">我的宠宝</h3>
          <button
            onClick={() => setShowAddPet(true)}
            className="text-ios-blue text-[14px] font-bold flex items-center gap-1 bg-ios-blue/5 px-2.5 py-1 rounded-full active:bg-ios-blue/10 transition-colors"
          >
            <span className="material-symbols-outlined !text-[18px]">add</span>
            添加
          </button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
          {user.pets.map((pet, i) => (
            <div key={i} className="shrink-0 w-24 aspect-square rounded-[20px] overflow-hidden relative active:scale-95 transition-all shadow-sm group border border-black/5">
              <img src={pet.img} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end items-center p-2 text-center">
                <h4 className="font-bold text-white text-[12px] truncate w-full leading-tight">{pet.name}</h4>
                <p className="text-[9px] text-white/80 font-medium truncate w-full">{pet.breed}</p>
              </div>
            </div>
          ))}
          {user.pets.length === 0 && (
            <div className="w-full py-6 text-center text-ios-gray text-sm italic">
              还没有添加任何宠宝
            </div>
          )}
        </div>
      </section>

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end animate-in fade-in duration-300" onClick={() => setShowSettings(false)}>
          <div className="w-full bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-[540px] mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold mb-6 text-center">设置</h3>

            <div className="space-y-3">
              {/* 账号信息 */}
              <div className="bg-ios-bg rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-bold text-[15px]">{user.name}</p>
                    <p className="text-[13px] text-ios-gray">{authUser?.email || '演示账号'}</p>
                  </div>
                  <span className="material-symbols-outlined text-ios-gray">chevron_right</span>
                </div>
              </div>

              {/* 设置选项 */}
              <div className="bg-ios-bg rounded-2xl overflow-hidden">
                <button className="w-full px-4 py-4 flex items-center gap-3 active:bg-black/5 transition-colors border-b border-black/5">
                  <span className="material-symbols-outlined text-ios-blue">notifications</span>
                  <span className="flex-1 text-left text-[15px]">通知设置</span>
                  <span className="material-symbols-outlined text-ios-gray">chevron_right</span>
                </button>
                <button className="w-full px-4 py-4 flex items-center gap-3 active:bg-black/5 transition-colors border-b border-black/5">
                  <span className="material-symbols-outlined text-ios-blue">security</span>
                  <span className="flex-1 text-left text-[15px]">隐私设置</span>
                  <span className="material-symbols-outlined text-ios-gray">chevron_right</span>
                </button>
                <button className="w-full px-4 py-4 flex items-center gap-3 active:bg-black/5 transition-colors">
                  <span className="material-symbols-outlined text-ios-blue">help</span>
                  <span className="flex-1 text-left text-[15px]">帮助与反馈</span>
                  <span className="material-symbols-outlined text-ios-gray">chevron_right</span>
                </button>
              </div>

              {/* 退出登录 */}
              <button
                onClick={handleLogout}
                className="w-full bg-ios-red/10 text-ios-red py-4 rounded-2xl font-bold text-[17px] active:scale-[0.98] transition-all mt-4"
              >
                退出登录
              </button>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full text-ios-gray font-medium py-3 text-[15px]"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分享面板 */}
      {showShareModal && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end animate-in fade-in duration-300" onClick={() => setShowShareModal(false)}>
          <div className="w-full bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-[540px] mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold mb-6 text-center">分享个人主页</h3>

            {/* 个人主页预览 */}
            <div className="bg-ios-bg rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <img src={user.avatar} className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-[17px] text-black">{user.name}</p>
                  <p className="text-[13px] text-ios-gray line-clamp-2">{user.bio}</p>
                </div>
              </div>
            </div>

            {/* 分享选项 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { icon: 'content_copy', label: '复制链接', color: 'bg-ios-blue', action: copyProfileLink },
                { icon: 'qr_code', label: '二维码', color: 'bg-green-500' },
                { icon: 'chat', label: '微信', color: 'bg-green-600' },
                { icon: 'group', label: '朋友圈', color: 'bg-orange-500' }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white !text-[28px]">{item.icon}</span>
                  </div>
                  <span className="text-[12px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-ios-bg text-black font-medium py-4 rounded-2xl text-[15px]"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showAddPet && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end animate-in fade-in duration-300" onClick={() => setShowAddPet(false)}>
          <div className="w-full bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-[540px] mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
            <h3 className="text-2xl font-bold mb-8 text-center">添加新宠宝</h3>

            <div className="flex flex-col items-center mb-8">
              <div
                onClick={() => petImgInputRef.current?.click()}
                className="size-32 rounded-3xl bg-ios-bg border-2 border-dashed border-ios-separator flex flex-col items-center justify-center text-ios-gray cursor-pointer overflow-hidden relative group"
              >
                {newPetImg ? (
                  <img src={newPetImg} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-[36px]">add_a_photo</span>
                    <span className="text-[12px] mt-1 font-bold">上传照片</span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">edit</span>
                </div>
              </div>
              <input ref={petImgInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange('pet')} />
            </div>

            <div className="space-y-5">
              <input
                className="w-full bg-ios-bg border-none rounded-2xl px-5 py-4 text-[17px] focus:ring-2 focus:ring-ios-blue"
                placeholder="宠宝名字"
                value={newPetName}
                onChange={e => setNewPetName(e.target.value)}
              />
              <input
                className="w-full bg-ios-bg border-none rounded-2xl px-5 py-4 text-[17px] focus:ring-2 focus:ring-ios-blue"
                placeholder="品种 (如：金毛、英短...)"
                value={newPetBreed}
                onChange={e => setNewPetBreed(e.target.value)}
              />
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleAddPetClick}
                  disabled={!newPetName || !newPetBreed}
                  className="w-full bg-ios-blue text-white py-4.5 rounded-2xl font-bold text-[17px] active:scale-95 transition-transform disabled:opacity-30 shadow-lg shadow-ios-blue/20"
                >
                  确认添加
                </button>
                <button
                  onClick={() => setShowAddPet(false)}
                  className="w-full text-ios-gray font-bold py-3 text-[15px]"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="mt-4 px-6 bg-white py-6 mb-16">
        <h3 className="text-[20px] font-bold tracking-tight mb-6">我的动态</h3>
        {myPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
            {myPosts.map(p => (
              <div key={p.id} className="aspect-square bg-ios-bg relative group cursor-pointer overflow-hidden">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-ios-gray bg-ios-bg/30 rounded-3xl border-2 border-dashed border-black/5">
            <span className="material-symbols-outlined !text-[56px] opacity-10">post_add</span>
            <p className="text-[15px] mt-4 font-medium">开启你的第一篇宠物动态</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfileScreen;
