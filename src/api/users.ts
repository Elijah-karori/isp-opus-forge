// src/api/users.ts
import axios from "./axios";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
  roles: string[];
  last_login?: string;
  created_at: string;
  updated_at?: string;
  department?: string;
  position?: string;
  employee_id?: string;
  avatar_url?: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  phone?: string;
  password: string;
  role_ids?: number[];
  department?: string;
  position?: string;
  employee_id?: string;
  is_active?: boolean;
}

export interface UserUpdate {
  full_name?: string;
  phone?: string;
  is_active?: boolean;
  role_ids?: number[];
  department?: string;
  position?: string;
  employee_id?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  created_at: string;
  user_count?: number;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  module: string;
}

export interface UserActivity {
  id: number;
  user_id: number;
  action: string;
  module: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

// User management
export const getUsers = (params?: { 
  is_active?: boolean;
  role?: string;
  department?: string;
  skip?: number;
  limit?: number;
}) => axios.get("/users", { params });

export const getUser = (userId: number) =>
  axios.get(`/users/${userId}`);

export const createUser = (data: UserCreate) =>
  axios.post("/users", data);

export const updateUser = (userId: number, data: UserUpdate) =>
  axios.put(`/users/${userId}`, data);

export const deleteUser = (userId: number) =>
  axios.delete(`/users/${userId}`);

export const restoreUser = (userId: number) =>
  axios.post(`/users/${userId}/restore`);

export const changeUserPassword = (userId: number, data: {
  new_password: string;
  confirm_password: string;
}) => axios.post(`/users/${userId}/change-password`, data);

export const deactivateUser = (userId: number) =>
  axios.post(`/users/${userId}/deactivate`);

export const activateUser = (userId: number) =>
  axios.post(`/users/${userId}/activate`);

// Role management
export const getRoles = () =>
  axios.get("/users/roles");

export const getRole = (roleId: number) =>
  axios.get(`/users/roles/${roleId}`);

export const createRole = (data: Partial<Role>) =>
  axios.post("/users/roles", data);

export const updateRole = (roleId: number, data: Partial<Role>) =>
  axios.put(`/users/roles/${roleId}`, data);

export const deleteRole = (roleId: number) =>
  axios.delete(`/users/roles/${roleId}`);

export const assignRoleToUser = (userId: number, roleId: number) =>
  axios.post(`/users/${userId}/roles/${roleId}`);

export const removeRoleFromUser = (userId: number, roleId: number) =>
  axios.delete(`/users/${userId}/roles/${roleId}`);

// Permission management
export const getPermissions = () =>
  axios.get("/users/permissions");

export const getModulePermissions = (module: string) =>
  axios.get(`/users/permissions/${module}`);

// User activity
export const getUserActivity = (params?: {
  user_id?: number;
  module?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) => axios.get("/users/activity", { params });

export const getRecentActivity = (limit: number = 50) =>
  axios.get(`/users/activity/recent?limit=${limit}`);

// User statistics
export const getUserStats = () =>
  axios.get("/users/stats");

export const getRoleDistribution = () =>
  axios.get("/users/stats/role-distribution");

// Bulk operations
export const bulkUpdateUsers = (userIds: number[], data: Partial<UserUpdate>) =>
  axios.post("/users/bulk-update", { user_ids: userIds, ...data });

export const exportUsers = (format: 'csv' | 'excel' | 'pdf' = 'csv') =>
  axios.get(`/users/export?format=${format}`);
