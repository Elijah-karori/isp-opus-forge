import apiClient from "@/lib/api-client";

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
export const getMenuItems = () =>
  apiClient.get<MenuItem[]>("/menus/items");

export const getMenuItem = (id: number) =>
  apiClient.get<MenuItem>(`/menus/items/${id}`);

export const createMenuItem = (data: Omit<MenuItem, 'id'>) =>
  apiClient.post<MenuItem>("/menus/items", data);

export const updateMenuItem = (id: number, data: Partial<MenuItem>) =>
  apiClient.patch<MenuItem>(`/menus/items/${id}`, data);

export const deleteMenuItem = (id: number) =>
  apiClient.delete(`/menus/items/${id}`);

// Role-Menu Assignments
export const getRoleMenus = (role: string) =>
  apiClient.get<MenuItem[]>(`/menus/roles/${role}`);

export const getAllRoleMenus = () =>
  apiClient.get<MenusByRole>("/menus/roles");

export const assignMenuToRole = (data: Omit<RoleMenuAssignment, 'id' | 'created_at'>) =>
  apiClient.post<RoleMenuAssignment>("/menus/roles/assign", data);

export const removeMenuFromRole = (roleMenuId: number) =>
  apiClient.delete(`/menus/roles/assign/${roleMenuId}`);

export const bulkAssignMenusToRole = (role: string, menuItemIds: number[]) =>
  apiClient.post("/menus/roles/bulk-assign", { role_name: role, menu_item_ids: menuItemIds });

export const reorderMenuItems = (updates: { id: number; order_index: number }[]) =>
  apiClient.post("/menus/items/reorder", { updates });

// Get available roles for assignment
export const getAvailableRoles = () =>
  apiClient.get<string[]>("/menus/available-roles");
