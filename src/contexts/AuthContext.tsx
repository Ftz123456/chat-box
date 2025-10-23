'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: number;
  username: string;
  phone: string;
  avatar?: string;
  created_at: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (username: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 检查用户登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch('/api/auth/me');
      console.log('Auth status response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('User data received:', data.user);
        setUser(data.user);
        
        // 同步到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } else {
        const errorData = await response.json();
        console.log('Auth check failed:', errorData);
        
        // 如果API失败，尝试从localStorage恢复用户状态
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              console.log('Restoring user from localStorage:', user);
              setUser(user);
            } catch (e) {
              console.error('Failed to parse stored user:', e);
              localStorage.removeItem('user');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      
      // 如果网络错误，尝试从localStorage恢复
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('Restoring user from localStorage after error:', user);
            setUser(user);
          } catch (e) {
            console.error('Failed to parse stored user:', e);
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    console.log('Attempting login for phone:', phone);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });

    const data = await response.json();
    console.log('Login response:', response.status, data);

    if (!response.ok) {
      throw new Error(data.error || '登录失败');
    }

    console.log('Login successful, setting user:', data.user);
    setUser(data.user);
    
    // 作为备用方案，也将用户信息存储到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  };

  const register = async (username: string, phone: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, phone, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '注册失败');
    }

    // 注册成功后自动登录
    await login(phone, password);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      setUser(null);
      // 清理localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
