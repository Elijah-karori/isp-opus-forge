import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "@/lib/api";
import { Permission } from "@/constants/permissions";
import { generateMenuFromPermissions } from "@/lib/menuGenerator";

interface MenuItem {
  key?: string;
  label: string;
  path: string;
  icon?: string;
  permission?: string;
  children?: MenuItem[];
}

export type { MenuItem };

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

// ============================================================================
// User Interface (Enhanced with RBAC v2)
// ============================================================================
interface User {
  id: number;
  email: string;
  full_name?: string;

  // Legacy v1 RBAC
  role: string;
  roles?: string[];
  menus?: MenuItem[];

  // RBAC v2
  roles_v2?: RoleV2[];
  permissions_v2?: PermissionV2[];
  rbac_version?: 'v1' | 'v2';

  // Organization
  company?: CompanyInfo;
  division?: DivisionInfo;
  department?: DepartmentInfo;

  // Additional fields
  phone?: string;
  position?: string;
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
}

interface JWTPayload { sub: string | number; roles?: string[]; exp: number; }

// ============================================================================
// Auth Context Type (Enhanced with RBAC v2)
// ============================================================================
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  setUser: (user: User | null) => void;

  // RBAC v2 Permission Functions
  hasPermission: (permission: string | Permission) => boolean;
  hasAnyPermission: (permissions: (string | Permission)[]) => boolean;
  hasAllPermissions: (permissions: (string | Permission)[]) => boolean;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// FALLBACK MENUS (Legacy)
// ============================================================================
const fallbackMenus: Record<string, MenuItem[]> = {
  "superadmin": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "projects", "label": "Projects", "path": "/projects" },
    { "key": "tasks", "label": "Tasks", "path": "/tasks" },
    { "key": "technicians", "label": "Technicians", "path": "/technicians" },
    { "key": "inventory", "label": "Inventory", "path": "/inventory" },
    { "key": "procurement", "label": "Procurement", "path": "/procurement" },
    { "key": "finance", "label": "Finance", "path": "/finance" },
    { "key": "hr", "label": "Human Resources", "path": "/hr" },
    { "key": "crm", "label": "CRM & Marketing", "path": "/crm" },
    { "key": "workflows", "label": "Workflows", "path": "/workflows" },
    { "key": "settings", "label": "System Settings", "path": "/settings" },
  ],
  "admin": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "finance", "label": "Finance", "path": "/finance" },
    { "key": "hr", "label": "HR", "path": "/hr" },
    { "key": "procurement", "label": "Procurement", "path": "/procurement" },
    { "key": "inventory", "label": "Inventory", "path": "/inventory" },
    { "key": "technicians", "label": "Technicians", "path": "/technicians" },
    { "key": "marketing", "label": "Marketing", "path": "/marketing" },
    { "key": "workflows", "label": "Workflows", "path": "/workflows" },
  ],
  "finance": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "payouts", "label": "Payouts", "path": "/finance/payouts" },
    { "key": "approvals", "label": "Approvals", "path": "/workflows/finance" },
    { "key": "reports", "label": "Reports", "path": "/finance/reports" },
  ],
  "finance_manager": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "payouts", "label": "Payouts", "path": "/finance/payouts" },
    { "key": "payments", "label": "Payments", "path": "/finance/payments" },
    { "key": "approvals", "label": "Approvals", "path": "/workflows/finance" },
    { "key": "reports", "label": "Reports", "path": "/finance/reports" },
  ],
  "hr": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "employees", "label": "Employees", "path": "/hr/employees" },
    { "key": "leave", "label": "Leave Requests", "path": "/hr/leaves" },
    { "key": "complaints", "label": "Complaints", "path": "/hr/complaints" },
    { "key": "payouts", "label": "Payouts", "path": "/hr/payouts" },
    { "key": "approvals", "label": "Approvals", "path": "/workflows/hr" },
  ],
  "hr_manager": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "employees", "label": "Employees", "path": "/hr/employees" },
    { "key": "leave", "label": "Leave Requests", "path": "/hr/leaves" },
    { "key": "complaints", "label": "Complaints", "path": "/hr/complaints" },
    { "key": "payouts", "label": "Payouts", "path": "/hr/payouts" },
    { "key": "approvals", "label": "Approvals", "path": "/workflows/hr" },
  ],
  "procurement": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "suppliers", "label": "Suppliers", "path": "/procurement/suppliers" },
    { "key": "purchases", "label": "Purchases", "path": "/procurement/purchases" },
    { "key": "inventory", "label": "Inventory", "path": "/inventory" },
    { "key": "approvals", "label": "Approvals", "path": "/workflows/procurement" },
  ],
  "procurement_officer": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "suppliers", "label": "Suppliers", "path": "/procurement/suppliers" },
    { "key": "purchases", "label": "Purchases", "path": "/procurement/purchases" },
    { "key": "inventory", "label": "Inventory", "path": "/inventory" },
    { "key": "approvals", "label": "Approvals", "path": "/workflows/procurement" },
  ],
  "project_manager": [
    { "label": "Dashboard", "path": "/dashboard" },
    { "label": "Projects", "path": "/projects" },
    { "label": "Tasks", "path": "/tasks" },
    { "label": "Team Management", "path": "/team" },
    { "label": "Approvals", "path": "/approvals" },
    { "label": "Reports", "path": "/reports" },
  ],
  "lead_technician": [
    { "label": "Dashboard", "path": "/dashboard" },
    { "label": "My Team Tasks", "path": "/technician/team-tasks" },
    { "label": "BOM Requests", "path": "/bom/requests" },
    { "label": "Escalations", "path": "/technician/escalations" },
    { "label": "Approvals", "path": "/approvals" },
    { "label": "Reports", "path": "/reports" },
  ],
  "technician": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "tasks", "label": "My Tasks", "path": "/technician/tasks" },
    { "key": "reports", "label": "Reports", "path": "/technician/reports" },
    { "key": "attendance", "label": "Attendance", "path": "/technician/attendance" },
    { "key": "technician-tools", "label": "Technician Tools", "path": "/technician-tools" },
  ],
  "marketing": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "leads", "label": "Leads", "path": "/marketing/leads" },
    { "key": "campaigns", "label": "Campaigns", "path": "/marketing/campaigns" },
    { "key": "analytics", "label": "Marketing Analytics", "path": "/marketing/analytics" },
  ],
  "sales_marketing": [
    { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
    { "key": "leads", "label": "Leads", "path": "/marketing/leads" },
    { "key": "campaigns", "label": "Campaigns", "path": "/marketing/campaigns" },
    { "key": "analytics", "label": "Marketing Analytics", "path": "/marketing/analytics" },
  ],
};

const defaultMenu: MenuItem[] = [
  { "key": "dashboard", "label": "Dashboard", "path": "/dashboard" },
  { "key": "profile", "label": "My Profile", "path": "/profile" },
];

// ============================================================================
// Auth Provider Component
// ============================================================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🚀 AuthProvider initializing...');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================================================
  // RBAC v2 Permission Checking Functions
  // ==========================================================================

  /**
   * Check if user has a specific permission
   * Supports both RBAC v2 and legacy v1 role-based checks
   */
  const hasPermission = (permission: string | Permission): boolean => {
    if (!user) return false;

    // RBAC v2 Check (Priority)
    if (user.rbac_version === 'v2' && user.permissions_v2) {
      const hasV2Permission = user.permissions_v2.some(p => p.name === permission);
      console.log(`🔐 RBAC v2 Permission Check: ${permission} = ${hasV2Permission}`);
      return hasV2Permission;
    }

    // Fallback to v1 role-based check
    // Map common permissions to roles
    const permissionToRoleMap: Record<string, string[]> = {
      'system:admin:all': ['superadmin', 'admin'],
      'project:read:all': ['superadmin', 'admin', 'project_manager'],
      'task:read:all': ['superadmin', 'admin', 'project_manager'],
      'invoice:read:all': ['superadmin', 'admin', 'finance', 'finance_manager'],
      'finance:view_reports:all': ['superadmin', 'admin', 'finance', 'finance_manager'],
      'hr:read:all': ['superadmin', 'admin', 'hr', 'hr_manager'],
    };

    const allowedRoles = permissionToRoleMap[permission] || [];
    const hasV1Permission = allowedRoles.includes(user.role);
    console.log(`🔐 RBAC v1 Fallback: ${permission} = ${hasV1Permission} (role: ${user.role})`);
    return hasV1Permission;
  };

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissions: (string | Permission)[]): boolean => {
    return permissions.some(perm => hasPermission(perm));
  };

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissions: (string | Permission)[]): boolean => {
    return permissions.every(perm => hasPermission(perm));
  };

  /**
   * Check if user has a specific role (legacy v1 or v2)
   */
  const hasRole = (role: string): boolean => {
    if (!user) return false;

    // Check v2 roles
    if (user.roles_v2) {
      return user.roles_v2.some(r => r.name.toLowerCase() === role.toLowerCase());
    }

    // Check v1 role
    if (user.role === role) return true;
    if (user.roles && user.roles.includes(role)) return true;

    return false;
  };

  // ==========================================================================
  // User Profile Handling
  // ==========================================================================
  const handleUserProfile = (profile: any, token: string) => {
    console.log('🔍 Profile received from backend:', profile);

    let menus = profile.menus ?? profile.menu_items ?? [];
    if (menus.length === 0) {
      menus = fallbackMenus[profile.role] || defaultMenu;
    }

    const decoded = jwtDecode<JWTPayload>(token);
    console.log('🔍 JWT decoded:', decoded);

    // Extract role from roles array if not directly provided
    const rolesArray = profile.roles || (decoded.roles ?? []);
    const extractedRole = profile.role ||
      (rolesArray.length > 0 ? (rolesArray[0].name || rolesArray[0]) : 'user');

    const userData: User = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: extractedRole,
      roles: rolesArray,
      menus,
      company: profile.company,
      division: profile.division,
      department: profile.department,

      // RBAC v2 fields
      roles_v2: profile.roles_v2,
      permissions_v2: profile.permissions_v2,
      rbac_version: profile.rbac_version || (profile.roles_v2 ? 'v2' : 'v1'),
    };

    console.log('✅ User data being set:', userData);
    console.log('✅ RBAC Version:', userData.rbac_version);
    console.log('✅ User role:', userData.role);
    console.log('✅ User roles array:', userData.roles);
    console.log('✅ User roles_v2:', userData.roles_v2);
    console.log('✅ User permissions_v2:', userData.permissions_v2);
    console.log('✅ User menus:', userData.menus);

    setUser(userData);
  };

  // ==========================================================================
  // Initialization
  // ==========================================================================
  useEffect(() => {
    console.log('🔄 Auth initialization useEffect running...');
    (async () => {
      try {
        // Check for Magic Link token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const magicToken = urlParams.get('token');

        let token = localStorage.getItem("auth_token");

        if (magicToken) {
          console.log('🔗 Magic Link token found in URL, verifying...');
          try {
            const response = await apiClient.request<any>({
              url: '/auth/passwordless/verify',
              method: 'GET',
              params: { token: magicToken }
            });

            if (response && response.access_token) {
              token = response.access_token;
              apiClient.setToken(token);
              console.log('✅ Magic Link verified successfully');

              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (error) {
            console.error('❌ Magic Link verification failed:', error);
          }
        }

        console.log('🔑 Token status:', token ? 'exists' : 'none');

        if (!token) {
          console.log('❌ No token found, setting loading to false');
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode<JWTPayload>(token);
        if (decoded.exp * 1000 < Date.now()) {
          console.log('⏰ Token expired');
          apiClient.clearToken();
          setUser(null);
          setIsLoading(false);
          return;
        }

        apiClient.setToken(token);
        const profile = await apiClient.getCurrentUser();
        handleUserProfile(profile, token);
      } catch (err) {
        console.error("❌ Auth init error:", err);
        apiClient.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth initialization complete');
      }
    })();
  }, []);

  // ==========================================================================
  // Login & Logout
  // ==========================================================================
  const login = async (username: string, password: string) => {
    const { access_token } = await apiClient.login({ username, password });
    apiClient.setToken(access_token);
    const profile = await apiClient.getCurrentUser();
    console.log(profile);
    handleUserProfile(profile, access_token);
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    window.location.href = "/login";
  };

  console.log('📊 AuthProvider render - isLoading:', isLoading, 'user:', user?.email);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isLoading,
      setUser,
      // RBAC v2 functions
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