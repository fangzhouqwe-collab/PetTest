// 认证上下文 Provider
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UseAuthReturn } from '../hooks/useAuth';

const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): UseAuthReturn => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext 必须在 AuthProvider 内使用');
    }
    return context;
};

export default AuthContext;
