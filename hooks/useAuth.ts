// 认证状态管理 Hook
import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as authService from '../services/authService';

export interface UseAuthReturn {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<{ error: Error | null }>;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 获取初始会话
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('获取会话失败:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // 监听认证状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setLoading(true);
        const result = await authService.signIn(email, password);
        setLoading(false);
        return { error: result.error };
    }, []);

    const signUp = useCallback(async (email: string, password: string, name?: string) => {
        setLoading(true);
        const result = await authService.signUp(email, password, name);
        setLoading(false);
        return { error: result.error };
    }, []);

    const signOut = useCallback(async () => {
        setLoading(true);
        const result = await authService.signOut();
        setLoading(false);
        return result;
    }, []);

    return {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut
    };
};

export default useAuth;
