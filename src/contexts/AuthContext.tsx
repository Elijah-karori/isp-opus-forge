import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "@/lib/api";

interface MenuItem { 
  key?: string; 
  label: string; 
  path: string; 
  icon?: string; 
  children?: MenuItem[];
}

export type { MenuItem };
interface CompanyInfo { id: number; name: string; }
interface DivisionInfo { id: number; name: string; }
interface DepartmentInfo { id: number; name: string; }

interface User { 
  id: number; 
  email: string; 
  full_name?: string; 
  role: string; 
  roles?: string[]; 
  menus?: MenuItem[];
  company?: CompanyInfo;
  division?: DivisionInfo;
  department?: DepartmentInfo;
  phone?: string;
  position?: string;
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
}
interface JWTPayload { sub: string | number; roles?: string[]; exp: number; }

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =====================================================================
// FALLBACK MENUS
// =====================================================================
// In case the backend fails to provide a menu, we can use these.
// These are based on the definitions in `app/core/menus.py`.

const fallbackMenus: Record<string, MenuItem[]> = {
    "superadmin": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "projects", "label": "Projects", "path": "/projects"},
        {"key": "tasks", "label": "Tasks", "path": "/tasks"},
        {"key": "technicians", "label": "Technicians", "path": "/technicians"},
        {"key": "inventory", "label": "Inventory", "path": "/inventory"},
        {"key": "procurement", "label": "Procurement", "path": "/procurement"},
        {"key": "finance", "label": "Finance", "path": "/finance"},
        {"key": "hr", "label": "Human Resources", "path": "/hr"},
        {"key": "crm", "label": "CRM & Marketing", "path": "/crm"},
        {"key": "workflows", "label": "Workflows", "path": "/workflows"},
        {"key": "settings", "label": "System Settings", "path": "/settings"},
    ],
    "admin": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "finance", "label": "Finance", "path": "/finance"},
        {"key": "hr", "label": "HR", "path": "/hr"},
        {"key": "procurement", "label": "Procurement", "path": "/procurement"},
        {"key": "inventory", "label": "Inventory", "path": "/inventory"},
        {"key": "technicians", "label": "Technicians", "path": "/technicians"},
        {"key": "marketing", "label": "Marketing", "path": "/marketing"},
        {"key": "workflows", "label": "Workflows", "path": "/workflows"},
    ],
    "finance": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "payouts", "label": "Payouts", "path": "/finance/payouts"},
        {"key": "approvals", "label": "Approvals", "path": "/workflows/finance"},
        {"key": "reports", "label": "Reports", "path": "/finance/reports"},
    ],
    "finance_manager": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "payouts", "label": "Payouts", "path": "/finance/payouts"},
        {"key": "payments", "label": "Payments", "path": "/finance/payments"},
        {"key": "approvals", "label": "Approvals", "path": "/workflows/finance"},
        {"key": "reports", "label": "Reports", "path": "/finance/reports"},
    ],
    "hr": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "employees", "label": "Employees", "path": "/hr/employees"},
        {"key": "leave", "label": "Leave Requests", "path": "/hr/leaves"},
        {"key": "complaints", "label": "Complaints", "path": "/hr/complaints"},
        {"key": "payouts", "label": "Payouts", "path": "/hr/payouts"},
        {"key": "approvals", "label": "Approvals", "path": "/workflows/hr"},
    ],
    "hr_manager": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "employees", "label": "Employees", "path": "/hr/employees"},
        {"key": "leave", "label": "Leave Requests", "path": "/hr/leaves"},
        {"key": "complaints", "label": "Complaints", "path": "/hr/complaints"},
        {"key": "payouts", "label": "Payouts", "path": "/hr/payouts"},
        {"key": "approvals", "label": "Approvals", "path": "/workflows/hr"},
    ],
    "procurement": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "suppliers", "label": "Suppliers", "path": "/procurement/suppliers"},
        {"key": "purchases", "label": "Purchases", "path": "/procurement/purchases"},
        {"key": "inventory", "label": "Inventory", "path": "/inventory"},
        {"key": "approvals", "label": "Approvals", "path": "/workflows/procurement"},
    ],
    "procurement_officer": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "suppliers", "label": "Suppliers", "path": "/procurement/suppliers"},
        {"key": "purchases", "label": "Purchases", "path": "/procurement/purchases"},
        {"key": "inventory", "label": "Inventory", "path": "/inventory"},
        {"key": "approvals", "label": "Approvals", "path": "/workflows/procurement"},
    ],
    "project_manager": [
        {"label": "Dashboard", "path": "/dashboard"},
        {"label": "Projects", "path": "/projects"},
        {"label": "Tasks", "path": "/tasks"},
        {"label": "Team Management", "path": "/team"},
        {"label": "Approvals", "path": "/approvals"},
        {"label": "Reports", "path": "/reports"},
    ],
    "lead_technician": [
        {"label": "Dashboard", "path": "/dashboard"},
        {"label": "My Team Tasks", "path": "/technician/team-tasks"},
        {"label": "BOM Requests", "path": "/bom/requests"},
        {"label": "Escalations", "path": "/technician/escalations"},
        {"label": "Approvals", "path": "/approvals"},
        {"label": "Reports", "path": "/reports"},
    ],
    "technician": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "tasks", "label": "My Tasks", "path": "/technician/tasks"},
        {"key": "reports", "label": "Reports", "path": "/technician/reports"},
        {"key": "attendance", "label": "Attendance", "path": "/technician/attendance"},
        {"key": "technician-tools", "label": "Technician Tools", "path": "/technician-tools" },
    ],
    "marketing": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "leads", "label": "Leads", "path": "/marketing/leads"},
        {"key": "campaigns", "label": "Campaigns", "path": "/marketing/campaigns"},
        {"key": "analytics", "label": "Marketing Analytics", "path": "/marketing/analytics"},
    ],
    "sales_marketing": [
        {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
        {"key": "leads", "label": "Leads", "path": "/marketing/leads"},
        {"key": "campaigns", "label": "Campaigns", "path": "/marketing/campaigns"},
        {"key": "analytics", "label": "Marketing Analytics", "path": "/marketing/analytics"},
    ],
};

const defaultMenu: MenuItem[] = [
    {"key": "dashboard", "label": "Dashboard", "path": "/dashboard"},
    {"key": "profile", "label": "My Profile", "path": "/profile"},
];


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUserProfile = (profile: any, token: string) => {
    let menus = profile.menus ?? profile.menu_items ?? [];
    if (menus.length === 0) {
      menus = fallbackMenus[profile.role] || defaultMenu;
    }
    const decoded = jwtDecode<JWTPayload>(token);

     let userRole = profile.roles?.[0];
  if (typeof userRole === 'object' && userRole !== null) {
    // This safely extracts the role name if it's an object, defaulting to a key or 'user'
    userRole = userRole.name || userRole.role || 'user';
  }console.log(userRole)
    setUser({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      roles: profile.roles || (decoded.roles ?? []),
      menus,
      company: profile.company,
      division: profile.division,
      department: profile.department,
    });
  };

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
        apiClient.setToken(token);
        const profile = await apiClient.getCurrentUser();
        handleUserProfile(profile, token);
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
    const profile = await apiClient.getCurrentUser();
    console.log(profile)
    handleUserProfile(profile, access_token);
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};