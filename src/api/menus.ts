import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export interface MenuItem {
  id?: number;
  key: string;
  label: string;
  path: string;
  icon?: string;
  parent_id?: number | null;
  order_index?: number;
  children?: MenuItem[];
}

export interface RoleMenuAssignment {
  id?: number;
  role_name: string;
  menu_item_id: number;
  created_at?: string;
}

export interface MenusByRole {
  [role: string]: MenuItem[];
}

// Menu Items CRUD
export const getMenuItems = () => axios.get<MenuItem[]>("/menus/items");
export const getMenuItem = (id: number) => axios.get<MenuItem>(`/menus/items/${id}`);
export const createMenuItem = (data: Omit<MenuItem, 'id'>) => axios.post<MenuItem>("/menus/items", data);
export const updateMenuItem = (id: number, data: Partial<MenuItem>) => axios.patch<MenuItem>(`/menus/items/${id}`, data);
export const deleteMenuItem = (id: number) => axios.delete(`/menus/items/${id}`);

// Role-Menu Assignments
export const getRoleMenus = (role: string) => axios.get<MenuItem[]>(`/menus/roles/${role}`);
export const getAllRoleMenus = () => axios.get<MenusByRole>("/menus/roles");
export const assignMenuToRole = (data: Omit<RoleMenuAssignment, 'id' | 'created_at'>) => axios.post<RoleMenuAssignment>("/menus/roles/assign", data);
export const removeMenuFromRole = (roleMenuId: number) => axios.delete(`/menus/roles/assign/${roleMenuId}`);
export const bulkAssignMenusToRole = (role: string, menuItemIds: number[]) => axios.post("/menus/roles/bulk-assign", { role_name: role, menu_item_ids: menuItemIds });
export const reorderMenuItems = (updates: { id: number; order_index: number }[]) => axios.post("/menus/items/reorder", { updates });
export const getAvailableRoles = () => axios.get<string[]>("/menus/available-roles");
