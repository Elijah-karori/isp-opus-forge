// =====================================================================
// Core Types for ISP ERP Frontend
// =====================================================================

// ============================================================================
// RBAC v2 Types
// ============================================================================
export interface PermissionV2 {
  id?: number;
  name: string;
  resource: string;
  action: string;
  scope: 'all' | 'own' | 'department' | 'assigned' | 'team';
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface RoleV2 {
  id: number;
  name: string;
  level: number;
  description?: string;
  scope_level?: string;
  status?: string;
  is_system_role?: boolean;
  created_at?: string;
  permissions?: PermissionV2[];
}

export interface RoleHierarchy {
  id: number;
  name: string;
  level: number;
  description?: string;
  children?: RoleHierarchy[];
}

// ============================================================================
// Organization Types
// ============================================================================
export interface Company {
  id: number;
  name: string;
}

export interface Division {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

// ============================================================================
// User Types
// ============================================================================
export interface User {
  id: number;
  email: string;
  full_name?: string;
  phone?: string;
  position?: string;
  is_active?: boolean;
  role?: string;
  roles?: string[];
  roles_v2?: RoleV2[];
  permissions_v2?: PermissionV2[];
  rbac_version?: 'v1' | 'v2';
  company?: Company;
  division?: Division;
  department?: Department;
  menus?: MenuItem[];
}

export interface UserCreate {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  company_name?: string;
}

export interface UserCreatePasswordless {
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
}

// ============================================================================
// Menu Types
// ============================================================================
export interface MenuItem {
  key?: string;
  label: string;
  path: string;
  icon?: string;
  permission?: string;
  children?: MenuItem[];
}

// ============================================================================
// Auth Types
// ============================================================================
export interface AuthToken {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface PasswordSetRequest {
  new_password: string;
  confirm_password: string;
}

export interface OTPVerifyRequest {
  user_id?: number;
  code: string;
  purpose: 'login' | 'registration' | 'password_reset';
}

// ============================================================================
// Dashboard Types
// ============================================================================
export interface AdminDashboardMetrics {
  total_users?: number;
  active_users?: number;
  total_roles?: number;
  total_permissions?: number;
  login_success_rate?: number;
  recent_logins?: any[];
  audit_summary?: any;
}

export interface AuditorHeatmap {
  policy_usage?: any[];
  result_distribution?: any;
}

export interface AuditTrail {
  id: number;
  user_id?: number;
  user_email?: string;
  user_name?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface TesterCoverage {
  total_features?: number;
  tested_features?: number;
  coverage_percentage?: number;
  feature_usage?: any[];
}

// ============================================================================
// Project & Task Types
// ============================================================================
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type InfrastructureType = 'fiber' | 'wireless' | 'hybrid' | 'datacenter';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  infrastructure_type?: InfrastructureType;
  department_id?: number;
  division_id?: number;
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id?: number;
  assigned_to?: number;
  assigned_role?: string;
  department_id?: number;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Audit Types
// ============================================================================
export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  user_name?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditStats {
  total_logs: number;
  actions_today: number;
  top_resources: { resource: string; count: number }[];
  top_users: { user_email: string; count: number }[];
}
