import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "@/lib/api";

// ============================================================================
// RBAC v2 Types
// ============================================================================
export interface PermissionV2 {
  name: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
}

export interface RoleV2 {
  id: number;
  name: string;
  level: number;
  description?: string;
}

interface CompanyInfo { id: number; name: string; }
interface DivisionInfo { id: number; name: string; }
interface DepartmentInfo { id: number; name: string; }

export interface MenuItem {
  key?: string;
  label: string;
  path: string;
  icon?: string;
  permission?: string;
  children?: MenuItem[];
}

// ============================================================================
// User Interface (Enhanced with RBAC v2)
// ============================================================================
interface User {
  id: number;
  email: string;
  full_name?: string;
  role: string;
  roles?: string[];
  menus?: MenuItem[];
  roles_v2?: RoleV2[];
  permissions_v2?: PermissionV2[];
  rbac_version?: 'v1' | 'v2';
  company?: CompanyInfo;
  division?: DivisionInfo;
  department?: DepartmentInfo;
  phone?: string;
  position?: string;
  is_active?: boolean;
}

interface JWTPayload { sub: string | number; roles?: string[]; exp: number; }

// ============================================================================
// Auth Context Type
// ============================================================================
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Auth Provider Component
// ============================================================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.rbac_version === 'v2' && user.permissions_v2) {
      return user.permissions_v2.some(p => p.name === permission);
    }
    return false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(perm => hasPermission(perm));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(perm => hasPermission(perm));
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    if (user.roles_v2) {
      return user.roles_v2.some(r => r.name.toLowerCase() === role.toLowerCase());
    }
    if (user.role === role) return true;
    if (user.roles && user.roles.includes(role)) return true;
    return false;
  };

  const handleUserProfile = (profile: any, token: string) => {
    const decoded = jwtDecode<JWTPayload>(token);
    const rolesArray = profile.roles || (decoded.roles ?? []);
    const extractedRole = profile.role ||
      (rolesArray.length > 0 ? (rolesArray[0].name || rolesArray[0]) : 'user');

    const userData: User = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: extractedRole,
      roles: rolesArray,
      menus: profile.menus ?? profile.menu_items ?? [],
      company: profile.company,
      division: profile.division,
      department: profile.department,
      roles_v2: profile.roles_v2,
      permissions_v2: profile.permissions_v2,
      rbac_version: profile.rbac_version || (profile.roles_v2 ? 'v2' : 'v1'),
    };

    setUser(userData);
  };

  useEffect(() => {
    (async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const magicToken = urlParams.get('token');
        let token = localStorage.getItem("auth_token");

        if (magicToken) {
          try {
            const response = await apiClient.request<any>({
              url: '/auth/passwordless/verify',
              method: 'GET',
              params: { token: magicToken }
            });

            if (response && response.access_token) {
              token = response.access_token;
              apiClient.setToken(token);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (error) {
            console.error('Magic Link verification failed:', error);
          }
        }

        if (!token) {
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode<JWTPayload>(token);
        if (decoded.exp * 1000 < Date.now()) {
          apiClient.clearToken();
          setUser(null);
          setIsLoading(false);
          return;
        }

        apiClient.setToken(token);
        const profile = await apiClient.getCurrentUser();
        handleUserProfile(profile, token);
      } catch (err) {
        console.error("Auth init error:", err);
        apiClient.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const { access_token } = await apiClient.login({ username, password });
    apiClient.setToken(access_token);
    const profile = await apiClient.getCurrentUser();
    handleUserProfile(profile, access_token);
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isLoading,
      setUser,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
