// =====================================================================
// FILE: src/lib/api.ts
// Comprehensive API Client for ISP ERP
// =====================================================================

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthToken,
  LoginCredentials,
  UserCreate,
  UserCreatePasswordless,
  PasswordSetRequest,
  User,
  AdminDashboardMetrics,
  AuditTrail,
  AuditStats,
  RoleV2,
  RoleHierarchy,
  Project,
  Task,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.endsWith("/api/v1")
  ? import.meta.env.VITE_API_BASE_URL
  : `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

class ApiClient {
  private axiosInstance: AxiosInstance;
  public axios: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          const isAuthEndpoint = error.config?.url?.includes('/auth/');
          if (!isAuthEndpoint) {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }
        }

        const errorData = error.response?.data as { detail?: any };
        let errorMessage = "An unexpected error occurred.";

        if (errorData?.detail) {
          if (typeof errorData.detail === 'object') {
            errorMessage = JSON.stringify(errorData.detail);
          } else {
            errorMessage = errorData.detail.toString();
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return Promise.reject(new Error(errorMessage));
      }
    );
    
    this.axios = this.axiosInstance;
  }

  setToken(token: string) {
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    localStorage.removeItem("auth_token");
  }

  async request<T>(config: import('axios').AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<T>(config);
    return response.data;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({ url, method: 'GET', params });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'POST', data });
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'PATCH', data });
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'PUT', data });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>({ url, method: 'DELETE' });
  }

  // =========================================================================
  // AUTHENTICATION
  // =========================================================================
  
  /** Standard OAuth2 Password Login */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await this.axiosInstance.post<AuthToken>("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    this.setToken(response.data.access_token);
    return response.data;
  }

  /** Refresh access token */
  async refreshToken(): Promise<AuthToken> {
    return this.request<AuthToken>({ url: "/auth/refresh", method: "POST" });
  }

  /** Standard registration with password */
  async register(data: UserCreate): Promise<any> {
    return this.request<any>({ url: "/auth/register", method: "POST", data });
  }

  /** Get current user profile with RBAC data */
  async getCurrentUser(): Promise<User> {
    return this.request<User>({ url: "/auth/me" });
  }

  // =========================================================================
  // PASSWORDLESS AUTH
  // =========================================================================

  /** Request magic link email */
  async requestPasswordlessLogin(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      url: "/auth/passwordless/request",
      method: "POST",
      params: { email },
    });
  }

  /** Verify magic link token */
  async verifyPasswordlessToken(token: string): Promise<AuthToken> {
    return this.request<AuthToken>({
      url: "/auth/passwordless/verify",
      method: "GET",
      params: { token },
    });
  }

  // =========================================================================
  // OTP REGISTRATION FLOW
  // =========================================================================

  /** Step 1: Request OTP for registration (creates inactive user) */
  async requestRegistrationOTP(data: UserCreatePasswordless): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      url: "/auth/register/otp/request",
      method: "POST",
      data,
    });
  }

  /** Step 2: Verify OTP and activate user (auto-login) */
  async verifyRegistrationOTP(email: string, otp: string): Promise<AuthToken> {
    return this.request<AuthToken>({
      url: "/auth/register/otp/verify",
      method: "POST",
      params: { email, otp },
    });
  }

  /** Set password after passwordless registration */
  async setPassword(data: PasswordSetRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      url: "/auth/set-password",
      method: "POST",
      data,
    });
  }

  // =========================================================================
  // RBAC
  // =========================================================================

  /** Check single permission */
  async checkPermission(permission: string): Promise<{ permission: string; granted: boolean }> {
    return this.request<{ permission: string; granted: boolean }>({
      url: "/rbac/check",
      params: { permission },
    });
  }

  /** Check multiple permissions at once */
  async checkPermissionsBatch(permissions: string[]): Promise<Record<string, boolean>> {
    return this.request<Record<string, boolean>>({
      url: "/rbac/check-batch",
      method: "POST",
      data: { permissions },
    });
  }

  /** Get all user permissions */
  async getMyPermissions(): Promise<{ permissions: string[]; count: number }> {
    return this.request<{ permissions: string[]; count: number }>({
      url: "/rbac/my-permissions",
    });
  }

  // =========================================================================
  // RBAC MANAGEMENT
  // =========================================================================

  /** Get sorted users list */
  async getSortedUsers(sortBy = 'email', algorithm = 'quick'): Promise<User[]> {
    return this.request<User[]>({
      url: "/management/rbac/users/sorted",
      params: { sort_by: sortBy, algorithm },
    });
  }

  /** Get role hierarchy tree */
  async getRoleHierarchyTree(): Promise<RoleHierarchy[]> {
    return this.request<RoleHierarchy[]>({ url: "/management/rbac/roles/tree" });
  }

  /** Get sorted roles */
  async getSortedRoles(sortBy = 'name', algorithm = 'merge'): Promise<RoleV2[]> {
    return this.request<RoleV2[]>({
      url: "/management/rbac/roles/sorted",
      params: { sort_by: sortBy, algorithm },
    });
  }

  /** Update user status (suspend/activate) */
  async updateUserStatus(userId: number, data: { status: string; reason?: string }): Promise<any> {
    return this.request<any>({
      url: `/management/rbac/users/${userId}/status`,
      method: "PATCH",
      data,
    });
  }

  // =========================================================================
  // MANAGEMENT DASHBOARDS
  // =========================================================================

  /** Admin dashboard metrics */
  async getAdminDashboardMetrics(days = 7): Promise<AdminDashboardMetrics> {
    return this.request<AdminDashboardMetrics>({
      url: "/management/dashboards/admin/metrics",
      params: { days },
    });
  }

  /** Auditor heatmap */
  async getAuditorHeatmap(): Promise<any> {
    return this.request<any>({ url: "/management/dashboards/auditor/heatmap" });
  }

  /** Auditor audit trails */
  async getAuditTrails(params?: {
    limit?: number;
    resource?: string;
    result?: string;
  }): Promise<AuditTrail[]> {
    return this.request<AuditTrail[]>({
      url: "/management/dashboards/auditor/trails",
      params,
    });
  }

  /** Tester coverage report */
  async getTesterCoverage(): Promise<any> {
    return this.request<any>({ url: "/management/dashboards/tester/coverage" });
  }

  // =========================================================================
  // AUDIT LOGS
  // =========================================================================

  async getAuditLogs(params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
    action?: string;
    resource?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<any[]> {
    return this.request<any[]>({ url: "/audit/", params });
  }

  async getAuditStats(days = 7): Promise<AuditStats> {
    return this.request<AuditStats>({ url: "/audit/stats", params: { days } });
  }

  async exportAuditLogs(format = 'csv', days = 30): Promise<any> {
    return this.request<any>({ url: "/audit/export", params: { format, days } });
  }

  // =========================================================================
  // PROJECTS
  // =========================================================================

  async getProjects(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    division_id?: number;
    department_id?: number;
    infrastructure_type?: string;
  }): Promise<Project[]> {
    return this.request<Project[]>({ url: "/projects/", params });
  }

  async getProject(projectId: number): Promise<Project> {
    return this.request<Project>({ url: `/projects/${projectId}` });
  }

  async createProject(data: any): Promise<Project> {
    return this.request<Project>({ url: "/projects/", method: "POST", data });
  }

  async updateProject(projectId: number, data: any): Promise<Project> {
    return this.request<Project>({ url: `/projects/${projectId}`, method: "PUT", data });
  }

  async deleteProject(projectId: number): Promise<void> {
    return this.request<void>({ url: `/projects/${projectId}`, method: "DELETE" });
  }

  async getProjectsByDepartment(departmentId: number): Promise<Project[]> {
    return this.request<Project[]>({ url: `/projects/by-department/${departmentId}` });
  }

  // =========================================================================
  // TASKS
  // =========================================================================

  async getTasks(params?: {
    skip?: number;
    limit?: number;
    project_id?: number;
    status?: string;
    assigned_role?: string;
    department_id?: number;
    priority?: string;
  }): Promise<Task[]> {
    return this.request<Task[]>({ url: "/tasks/", params });
  }

  async getMyTasks(): Promise<Task[]> {
    return this.request<Task[]>({ url: "/tasks/my-assignments" });
  }

  async getTask(taskId: number): Promise<Task> {
    return this.request<Task>({ url: `/tasks/${taskId}` });
  }

  async createTask(data: any): Promise<Task> {
    return this.request<Task>({ url: "/tasks/", method: "POST", data });
  }

  async updateTask(taskId: number, data: any): Promise<Task> {
    return this.request<Task>({ url: `/tasks/${taskId}`, method: "PUT", data });
  }

  async getTasksByDepartment(departmentId: number): Promise<Task[]> {
    return this.request<Task[]>({ url: `/tasks/by-department/${departmentId}` });
  }

  // =========================================================================
  // USERS
  // =========================================================================

  async getUsers(): Promise<User[]> {
    return this.request<User[]>({ url: "/users/" });
  }

  async getUser(userId: number): Promise<User> {
    return this.request<User>({ url: `/users/${userId}` });
  }

  async updateUser(userId: number, data: any): Promise<User> {
    return this.request<User>({ url: `/users/${userId}`, method: "PUT", data });
  }

  async createUser(data: UserCreate): Promise<User> {
    return this.request<User>({ url: "/users/", method: "POST", data });
  }

  async deleteUser(userId: number): Promise<void> {
    return this.request<void>({ url: `/users/${userId}`, method: "DELETE" });
  }

  async getMyMenu(): Promise<any[]> {
    return this.request<any[]>({ url: "/users/me/menu" });
  }

  // =========================================================================
  // HEALTH
  // =========================================================================

  async healthCheck(): Promise<any> {
    return this.request<any>({ url: "/health" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
