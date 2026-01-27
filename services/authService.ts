// 认证服务：处理用户登录、注册、登出
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

// 邮箱密码注册
export const signUp = async (
    email: string,
    password: string,
    name?: string
): Promise<{ user: User | null; error: Error | null }> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name || '新用户'
            }
        }
    });

    if (error) {
        return { user: null, error: new Error(error.message) };
    }

    return { user: data.user, error: null };
};

// 邮箱密码登录
export const signIn = async (
    email: string,
    password: string
): Promise<{ user: User | null; error: Error | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return { user: null, error: new Error(error.message) };
    }

    return { user: data.user, error: null };
};

// 登出
export const signOut = async (): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return { error: new Error(error.message) };
    }

    return { error: null };
};

// 获取当前会话
export const getSession = async (): Promise<Session | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session;
};

// 获取当前用户
export const getUser = async (): Promise<User | null> => {
    const { data } = await supabase.auth.getUser();
    return data.user;
};

// 监听认证状态变化
export const onAuthStateChange = (
    callback: (event: string, session: Session | null) => void
) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return () => subscription.unsubscribe();
};

// 发送密码重置邮件
export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
        return { error: new Error(error.message) };
    }

    return { error: null };
};

// 更新密码
export const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        return { error: new Error(error.message) };
    }

    return { error: null };
};
