// 登录/注册页面组件
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// 历史账号存储 key
const SAVED_ACCOUNTS_KEY = 'petconnect_saved_accounts';
const REMEMBER_PASSWORD_KEY = 'petconnect_remember_password';

interface SavedAccount {
    email: string;
    password?: string; // 只有勾选"记住密码"才保存
    name?: string;
    avatar?: string;
    lastLogin: string;
}

// 加载保存的账号
const loadSavedAccounts = (): SavedAccount[] => {
    try {
        const stored = localStorage.getItem(SAVED_ACCOUNTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// 保存账号
const saveAccount = (account: SavedAccount) => {
    const accounts = loadSavedAccounts();
    const existingIndex = accounts.findIndex(a => a.email === account.email);
    if (existingIndex >= 0) {
        accounts[existingIndex] = { ...accounts[existingIndex], ...account };
    } else {
        accounts.unshift(account);
    }
    // 只保留最近 5 个账号
    const toSave = accounts.slice(0, 5);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(toSave));
};

// 删除账号
const removeAccount = (email: string) => {
    const accounts = loadSavedAccounts().filter(a => a.email !== email);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
};

interface AuthScreenProps {
    onSuccess?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
    const { signIn, signUp, loading } = useAuthContext();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [rememberPassword, setRememberPassword] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
    const [showAccountList, setShowAccountList] = useState(false);

    // 加载历史账号
    useEffect(() => {
        const accounts = loadSavedAccounts();
        setSavedAccounts(accounts);

        // 如果有历史账号,自动填充最近的
        if (accounts.length > 0) {
            const lastAccount = accounts[0];
            setEmail(lastAccount.email);
            if (lastAccount.password) {
                setPassword(lastAccount.password);
            }
        }

        // 加载记住密码设置
        const remember = localStorage.getItem(REMEMBER_PASSWORD_KEY);
        if (remember !== null) {
            setRememberPassword(remember === 'true');
        }
    }, []);

    const selectAccount = (account: SavedAccount) => {
        setEmail(account.email);
        setPassword(account.password || '');
        setShowAccountList(false);
    };

    const deleteAccount = (e: React.MouseEvent, email: string) => {
        e.stopPropagation();
        removeAccount(email);
        setSavedAccounts(loadSavedAccounts());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();
        const cleanName = name.trim();

        // 保存记住密码设置
        localStorage.setItem(REMEMBER_PASSWORD_KEY, String(rememberPassword));

        if (isForgotPassword) {
            // 忘记密码发送重置邮件
            console.log('Attempting reset password for:', cleanEmail);
            const { resetPassword } = useAuthContext();
            const { error: resetError } = await resetPassword(cleanEmail);
            if (resetError) {
                setError(`发送重置邮件失败: ${resetError.message}`);
            } else {
                setSuccessMessage('重置链接已发送到您的邮箱，请前往检查并重设密码。');
            }
            return;
        }

        if (isLogin) {
            // 登录
            console.log('Attempting login with:', cleanEmail);
            const result = await signIn(cleanEmail, cleanPassword);
            if (result.error) {
                console.error('Login error:', result.error);
                let errorMsg = result.error.message;
                if (errorMsg.includes('Invalid login credentials')) {
                    errorMsg = '邮箱或密码错误';
                } else if (errorMsg.includes('Email not confirmed')) {
                    errorMsg = '请先验证邮箱后再登录 (请检查您的邮箱)';
                } else {
                    // 显示原始错误以便调试
                    errorMsg = `登录失败: ${errorMsg}`;
                }
                setError(errorMsg);
            } else {
                // 登录成功,保存账号
                saveAccount({
                    email: cleanEmail,
                    password: rememberPassword ? cleanPassword : undefined,
                    lastLogin: new Date().toISOString()
                });
                onSuccess?.();
            }
        } else {
            // 注册
            console.log('Attempting signup with:', cleanEmail);
            const { error: signUpError } = await signUp(cleanEmail, cleanPassword, cleanName);

            if (signUpError) {
                console.error('Signup error:', signUpError);
                let errorMsg = signUpError.message;
                if (errorMsg.includes('already registered')) {
                    errorMsg = '该邮箱已注册，请直接登录';
                }
                setError(errorMsg);
                return;
            }

            // 注册成功，检查是否已有会话（Supabase 可能已自动登录）
            const { data: { session } } = await supabase.auth.getSession();
            let user = session?.user;

            // 如果没有会话，尝试手动登录
            if (!session) {
                console.log('No session after signup, attempting manual login...');
                const loginResult = await signIn(cleanEmail, cleanPassword);
                if (loginResult.error) {
                    console.error('Auto-login error:', loginResult.error);
                    // 无论是什么错误，注册这一步本身是成功的
                    // 很大可能是需要验证邮箱
                    setSuccessMessage('注册账号成功！如果无法自动登录，请检查是否收到验证邮件，或直接尝试登录。');
                    setIsLogin(true);
                    return;
                }
                const { data } = await supabase.auth.getUser();
                user = data.user;
            }

            // 登录成功（自动或手动），初始化用户资料
            if (user) {
                // 尝试插入 profiles
                try {
                    await supabase.from('profiles').upsert({
                        id: user.id,
                        name: cleanName || '新用户',
                        bio: '这是我的个性签名',
                        avatar_url: `https://picsum.photos/seed/${user.id}/200/200`,
                        bg_image_url: `https://picsum.photos/seed/${user.id}-bg/800/400`,
                        email: user.email || cleanEmail,
                        phone: user.phone || undefined
                    }, { onConflict: 'id' });
                } catch (err) {
                    console.log('Profile creation handled by trigger or failed:', err);
                }

                // 保存账号到本地历史
                saveAccount({
                    email: cleanEmail,
                    password: rememberPassword ? cleanPassword : undefined,
                    name: cleanName || '新用户',
                    lastLogin: new Date().toISOString()
                });

                // 通知成功
                if (onSuccess) onSuccess();
            }
        }
    };


    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = () => {
        if (!phone || phone.length < 11) {
            setError('请输入正确的手机号');
            return;
        }
        setCodeSent(true);
        setCountdown(60);
        setSuccessMessage('验证码已发送 (模拟: 123456)');
        setError(null);
    };

    // ... (keep existing code) ...

    return (
        <div className="min-h-screen bg-gradient-to-br from-ios-blue/10 via-white to-emerald-50 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-ios-blue to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-ios-blue/30">
                        <span className="material-symbols-outlined !text-[44px] text-white material-symbols-fill">pets</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">宠物社区</h1>
                    <p className="text-ios-gray mt-2">连接每一位宠物爱好者</p>
                </div>

                {/* 登录方式切换 Tab */}
                {isLogin && !isForgotPassword && (
                    <div className="flex bg-black/5 p-1 rounded-2xl mb-6 relative">
                        <div className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ${loginMethod === 'phone' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}></div>
                        <button
                            onClick={() => { setLoginMethod('email'); setError(null); }}
                            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors ${loginMethod === 'email' ? 'text-black' : 'text-ios-gray'}`}
                        >
                            邮箱密码
                        </button>
                        <button
                            onClick={() => { setLoginMethod('phone'); setError(null); }}
                            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors ${loginMethod === 'phone' ? 'text-black' : 'text-ios-gray'}`}
                        >
                            手机验证码
                        </button>
                    </div>
                )}

                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && !isForgotPassword && (
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-ios-gray ml-1 uppercase tracking-wider">昵称</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="您的昵称"
                                className="w-full bg-white border border-black/10 rounded-2xl px-5 py-4 text-[17px] focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all shadow-sm"
                            />
                        </div>
                    )}

                    {loginMethod === 'email' || !isLogin || isForgotPassword ? (
                        <>
                            <div className="space-y-1 relative">
                                <label className="text-[12px] font-bold text-ios-gray ml-1 uppercase tracking-wider">邮箱</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="w-full bg-white border border-black/10 rounded-2xl px-5 py-4 text-[17px] focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {!isForgotPassword && (
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[12px] font-bold text-ios-gray uppercase tracking-wider">密码</label>
                                        {isLogin && (
                                            <button
                                                type="button"
                                                onClick={() => { setIsForgotPassword(true); setError(null); setSuccessMessage(null); }}
                                                className="text-[12px] text-ios-blue font-bold px-2 py-1 bg-ios-blue/10 rounded-lg active:scale-95 transition-transform"
                                            >
                                                忘记密码?
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full bg-white border border-black/10 rounded-2xl px-5 py-4 text-[17px] focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all shadow-sm"
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-[12px] font-bold text-ios-gray ml-1 uppercase tracking-wider">手机号</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="请输入手机号"
                                    required
                                    maxLength={11}
                                    className="w-full bg-white border border-black/10 rounded-2xl px-5 py-4 text-[17px] focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[12px] font-bold text-ios-gray ml-1 uppercase tracking-wider">验证码</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="6位验证码"
                                        required
                                        maxLength={6}
                                        className="flex-1 bg-white border border-black/10 rounded-2xl px-5 py-4 text-[17px] focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={countdown > 0}
                                        className="bg-black text-white font-bold px-4 rounded-2xl text-[14px] min-w-[100px] disabled:opacity-50"
                                    >
                                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 记住密码 (Only for email) */}
                    {(loginMethod === 'email' || !isLogin) && !isForgotPassword && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setRememberPassword(!rememberPassword)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${rememberPassword ? 'bg-ios-blue border-ios-blue' : 'border-gray-300'}`}
                            >
                                {rememberPassword && (
                                    <span className="material-symbols-outlined text-white !text-[16px]">check</span>
                                )}
                            </button>
                            <span className="text-[14px] text-ios-gray">记住密码</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-ios-red/10 text-ios-red text-sm px-4 py-3 rounded-xl border border-ios-red/20">
                            ❌ {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-ios-green/10 text-ios-green text-sm px-4 py-3 rounded-xl border border-ios-green/20">
                            ✅ {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-ios-blue text-white font-bold py-4 rounded-2xl text-[17px] active:scale-[0.98] transition-all shadow-lg shadow-ios-blue/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                处理中...
                            </span>
                        ) : (
                            isForgotPassword ? '发送重置链接' : (isLogin ? '登录' : '注册')
                        )}
                    </button>
                </form>

                {/* 切换登录/注册 */}
                <div className="text-center mt-8">
                    {isForgotPassword ? (
                        <button
                            onClick={() => {
                                setIsForgotPassword(false);
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className="text-ios-blue font-medium"
                        >
                            想起来了？返回登录
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                                setSuccessMessage(null);
                                setShowAccountList(false);
                            }}
                            className="text-ios-blue font-medium"
                        >
                            {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
                        </button>
                    )}
                </div>

                {/* 分隔线 */}
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-black/10"></div>
                    <span className="text-ios-gray text-sm">或</span>
                    <div className="flex-1 h-px bg-black/10"></div>
                </div>

                {/* 快速体验（演示模式） */}
                <button
                    onClick={() => onSuccess?.()}
                    className="w-full bg-white border border-black/10 text-black font-medium py-4 rounded-2xl text-[15px] active:scale-[0.98] transition-all shadow-sm"
                >
                    <span className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined !text-[20px]">play_arrow</span>
                        跳过登录，快速体验
                    </span>
                </button>
            </div>
        </div>
    );
};

export default AuthScreen;
