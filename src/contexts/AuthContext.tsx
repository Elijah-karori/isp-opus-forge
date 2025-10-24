import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '@/lib/api';

interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon?: string;
  roles?: string[];
}

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  roles: string[];
  menu_items?: MenuItem[];
  phone?: string;
  is_active?: boolean;
  department?: string;
  position?: string;
  created_at?: string;
  last_login?: string;
}

interface JWTPayload {
  sub: string;
  roles?: string[];
  exp: number;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to fix menu paths
const correctMenuPaths = (menuItems: MenuItem[]): MenuItem[] => {
  const legacyHrPaths = ['/hr/employees', '/hr/payouts'];
  
  // Check if a canonical /hr link already exists.
  const hasCanonicalHrLink = menuItems.some(item => item.path === '/hr');
  
  // Filter out all the legacy HR links.
  const filteredItems = menuItems.filter(item => !legacyHrPaths.includes(item.path));
  
  // Determine if there were any legacy links in the original array.
  const hadLegacyLinks = menuItems.some(item => legacyHrPaths.includes(item.path));

  // If there was no canonical /hr link but there were legacy ones, add a new /hr link.
  if (!hasCanonicalHrLink && hadLegacyLinks) {
    const originalItem = menuItems.find(item => legacyHrPaths.includes(item.path));
    if (originalItem) {
      filteredItems.unshift({ ...originalItem, path: '/hr', label: 'HR', key: 'hr' });
    }
  }

  // To be safe, ensure no duplicate paths made it through.
  const finalItems: MenuItem[] = [];
  const seenPaths = new Set<string>();
  for (const item of filteredItems) {
    if (!seenPaths.has(item.path)) {
      finalItems.push(item);
      seenPaths.add(item.path);
    }
  }

  return finalItems;
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          if (decoded.exp * 1000 < Date.now()) {
            apiClient.clearToken();
            setUser(null);
          } else {
            try {
              const profile: any = await apiClient.getCurrentUser();
              const menuItems = profile.menus || profile.menu_items || [];
              setUser({
                ...profile,
                roles: decoded.roles || [profile.role],
                menu_items: correctMenuPaths(menuItems)
              });
            } catch (error) {
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
    const decoded = jwtDecode<JWTPayload>(token);
    
    try {
      const profile: any = await apiClient.getCurrentUser();
      const menuItems = profile.menus || profile.menu_items || [];
      setUser({
        ...profile,
        roles: decoded.roles || [profile.role],
        menu_items: correctMenuPaths(menuItems)
      });
    } catch (error) {
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
    <AuthContext.Provider value={{ user, setUser, isAuthenticated: !!user, login, logout, isLoading }}>
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
