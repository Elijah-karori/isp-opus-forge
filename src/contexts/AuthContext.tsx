import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '@/lib/api';

interface MenuItem {
  title: string;
  path: string;
  icon: string;
  roles: string[];
}

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  roles: string[];
  menu_items?: MenuItem[];
}

interface JWTPayload {
  sub: string;
  roles?: string[];
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Decode JWT to get roles
          const decoded = jwtDecode<JWTPayload>(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            apiClient.clearToken();
            setUser(null);
          } else {
            // Fetch current user profile with roles
            try {
              const profile: any = await apiClient.getCurrentUser();
              setUser({
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                role: profile.role,
                roles: decoded.roles || [profile.role],
                menu_items: profile.menu_items || []
              });
            } catch (error) {
              // If /auth/me fails, use decoded token data as fallback
              setUser({
                id: parseInt(decoded.sub),
                email: '',
                full_name: 'User',
                role: decoded.roles?.[0] || 'user',
                roles: decoded.roles || ['user']
              });
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          apiClient.clearToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await apiClient.login({ username, password });
    const token = response.access_token;
    
    // Decode JWT to get roles
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Fetch user profile
    try {
      const profile: any = await apiClient.getCurrentUser();
      setUser({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        roles: decoded.roles || [profile.role],
        menu_items: profile.menu_items || []
      });
    } catch (error) {
      // Fallback to decoded token data
      setUser({
        id: parseInt(decoded.sub),
        email: username,
        full_name: 'User',
        role: decoded.roles?.[0] || 'user',
        roles: decoded.roles || ['user']
      });
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
