// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
type User = {
  id: number;
  email: string;
  full_name?: string;
  role?: string | null;
  permissions?: string[]; // optional
  roles?: { name: string }[];
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("current_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // If you use a global store, subscribe here. Simplified example.
    // Keep this small — main purpose: quick checks for role/permissions
  }, []);

  function hasPermission(perm: string) {
    if (!user) return false;
    if (user.permissions?.includes(perm)) return true;
    return false;
  }

  function hasRole(roleName: string) {
    if (!user) return false;
    if (user.role === roleName) return true;
    if (user.roles?.some((r) => r.name === roleName)) return true;
    return false;
  }

  return { user, setUser, hasPermission, hasRole };
}
