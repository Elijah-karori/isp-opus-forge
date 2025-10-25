import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "@/lib/api";

interface MenuItem { key?: string; label: string; path: string; icon?: string; }
interface User { id: number; email: string; full_name?: string; role: string; roles?: string[]; menus?: MenuItem[]; }
interface JWTPayload { sub: string | number; roles?: string[]; exp: number; }

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
    (async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) { setIsLoading(false); return; }

      try {
        const decoded = jwtDecode<JWTPayload>(token);
        if (decoded.exp * 1000 < Date.now()) {
          apiClient.clearToken();
          setUser(null);
          setIsLoading(false);
          return;
        }
        apiClient.setToken(token); // ensure client has token
        // fetch /auth/me for authoritative profile + menus
        const profile = await apiClient.getCurrentUser();
        setUser({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          roles: profile.roles || (decoded.roles ?? []),
          menus: profile.menus ?? profile.menu_items ?? []
        });
      } catch (err) {
        console.warn("Auth init fallback:", err);
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
    // then call /auth/me
    const profile = await apiClient.getCurrentUser();
    setUser({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      roles: profile.roles ?? [],
      menus: profile.menus ?? profile.menu_items ?? []
    });
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export { AuthContext };
