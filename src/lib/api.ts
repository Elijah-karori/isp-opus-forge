
// =====================================================================
// FILE: src/lib/api.ts
// =====================================================================

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://erp-6dba.onrender.com";

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthToken {
  access_token: string;
  token_type: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
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
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
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
        
        // Instead of throwing a new error, we reject with a custom message
        // to be caught by the calling function.
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  setToken(token: string) {
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    localStorage.removeItem("auth_token");
  }

  private async request<T>(config: import('axios').AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<T>(config);
    return response.data;
  }

  // -------------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------------
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await this.axiosInstance.post<AuthToken>("/api/v1/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    this.setToken(response.data.access_token);
    return response.data;
  }

  async registerUser(data: any): Promise<any> {
    return this.request<any>({ 
      url: "/api/v1/auth/register", 
      method: "POST", 
      data 
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.request<any>({ url: "/api/v1/auth/me" });
  }

  // -------------------------------------------------------------------
  // PROJECTS & TASKS
  // -------------------------------------------------------------------
  async getProjects(params?: { skip?: number; limit?: number; status?: string }) {
    return this.request<any>({ url: '/api/v1/projects/', method: 'GET', params });
  }

  async getProject(projectId: number) {
    return this.request<any>({ url: `/api/v1/projects/${projectId}` });
  }

  async createProject(data: any) {
    return this.request<any>({ url: "/api/v1/projects/", method: "POST", data });
  }

  async updateProject(projectId: number, data: any) {
    return this.request<any>({ url: `/api/v1/projects/${projectId}`, method: "PATCH", data });
  }
  
  async createProjectFromLead(leadId: number, data: any) {
    return this.createProject({ ...data, lead_id: leadId });
  }

  async getTasks(params?: any) {
    return this.request<any>({ url: '/api/v1/tasks/', method: 'GET', params });
  }

  async getTask(taskId: number) {
    return this.request<any>({ url: `/api/v1/tasks/${taskId}` });
  }

  async createTask(data: any) {
    return this.request<any>({ url: "/api/v1/tasks/", method: "POST", data });
  }

  async updateTask(taskId: number, data: any) {
    return this.request<any>({ url: `/api/v1/tasks/${taskId}`, method: "PATCH", data });
  }

  async updateTaskBOM(taskId: number, data: any) {
    return this.request<any>({ url: `/api/v1/tasks/${taskId}/update-bom`, method: "POST", data });
  }

  async approveTaskBOM(taskId: number) {
    return this.request<any>({ url: `/api/v1/tasks/${taskId}/approve-bom`, method: "POST" });
  }

  async completeTask(taskId: number, data: any) {
    return this.request<any>({ url: `/api/v1/tasks/${taskId}/complete`, method: "POST", data });
  }

  // -------------------------------------------------------------------
  // INVENTORY
  // -------------------------------------------------------------------
  async getProducts(params?: any) {
    return this.request<any>({ url: '/api/v1/inventory/products', params });
  }

  async getProduct(productId: number) {
    return this.request<any>({ url: `/api/v1/inventory/products/${productId}` });
  }

  async createProduct(data: any) {
    return this.request<any>({ url: "/api/v1/inventory/products", method: "POST", data });
  }

  async updateProduct(productId: number, data: any) {
    return this.request<any>({ url: `/api/v1/inventory/products/${productId}`, method: "PATCH", data });
  }

  async searchInventory(query: string) {
    return this.request<any>({ url: '/api/v1/inventory/search', params: { q: query } });
  }

  async getInventoryStats() {
    return this.request<any>({ url: "/api/v1/inventory/stats" });
  }

  async getLowStockAlerts() {
    return this.request<any>({ url: "/api/v1/inventory/alerts/low-stock" });
  }

  // -------------------------------------------------------------------
  // TECHNICIANS & SATISFACTION
  // -------------------------------------------------------------------
  async getTechnicians(params?: { active_only?: boolean }) {
    return this.request<any>({ url: '/api/v1/technicians', params });
  }

  async getTechnician(technicianId: number) {
    return this.request<any>({ url: `/api/v1/technicians/${technicianId}` });
  }

  async createTechnician(data: any) {
    return this.request<any>({ url: "/api/v1/technicians", method: "POST", data });
  }

  async getTechnicianLeaderboard(params?: { limit?: number }) {
    return this.request<any>({ url: '/api/v1/technicians/leaderboard', params });
  }

  async getTechnicianPerformance(technicianId: number, params?: any) {
    return this.request<any>({ url: `/api/v1/technicians/${technicianId}/performance`, params });
  }

  async getTechnicianTasks(technicianId: number, params?: any) {
    return this.request<any>({ url: `/api/v1/technicians/${technicianId}/tasks`, params });
  }
    

  async approveTaskCompletion(taskId: number, data: { approved: boolean; notes?: string }) {
    return this.request<any>({ url: `/api/v1/technicians/tasks/${taskId}/approve`, method: "POST", data });
  }

  async getCustomerSatisfaction(params?: any) {
    return this.request<any>({ url: '/api/v1/technicians/satisfaction', params });
  }

  async recordCustomerSatisfaction(data: { task_id: number; rating: number; feedback?: string }) {
    return this.request<any>({ url: '/api/v1/technicians/satisfaction', method: "POST", data });
  }

  // -------------------------------------------------------------------
  // FINANCE
  // -------------------------------------------------------------------
  async getPendingVariances(limit = 50) {
    return this.request<any>({ url: '/api/v1/finance/variances/pending', params: { limit } });
  }

  async getVarianceHistory(params?: any) {
    return this.request<any>({ url: '/api/v1/finance/variances/history', params });
  }

  async approveVariance(varianceId: number, data: any) {
    return this.request<any>({ url: `/api/v1/finance/variances/${varianceId}/approve`, method: "POST", data });
  }

  async detectTaskVariances(taskId: number) {
    return this.request<any>({ url: `/api/v1/finance/tasks/${taskId}/detect-variances`, method: "POST" });
  }

  async getProjectFinancials(projectId: number) {
    return this.request<any>({ url: `/api/v1/finance/projects/${projectId}/financials` });
  }
  
  async markPayoutAsPaid(payoutId: number) {
    return this.request<any>({ url: `/api/v1/hr/payouts/${payoutId}/mark-paid`, method: 'POST' });
  }

  async getProjectsFinancialSummary(params?: any) {
    return this.request<any>({ url: '/api/v1/finance/projects/summary', params });
  }

  async getFinancialSummary(params?: any) {
    return this.request<any>({ url: '/api/v1/finance/summary', params });
  }

  async getFinanceDashboardStats() {
    return this.request<any>({ url: "/api/v1/finance/dashboard/stats" });
  }

  async getExpenses(params?: any) {
    return this.request<any>({ url: '/api/v1/finance/expenses', params });
  }

  async createExpense(data: any) {
    return this.request<any>({ url: "/api/v1/finance/expenses", method: "POST", data });
  }

  async approveExpense(expenseId: number, data: any) {
    return this.request<any>({ url: `/api/v1/finance/expenses/${expenseId}/approve`, method: "POST", data });
  }

  // -------------------------------------------------------------------
  // HR
  // -------------------------------------------------------------------
  async getEmployees(params?: any) {
    return this.request<any>({ url: '/api/v1/hr/employees', params });
  }

  async getEmployee(employeeId: number) {
    return this.request<any>({ url: `/api/v1/hr/employees/${employeeId}` });
  }

  async createEmployee(data: any) {
    return this.request<any>({ url: "/api/v1/hr/employees", method: "POST", data });
  }

  async getPendingPayouts(params?: { limit?: number }) {
    return this.request<any>({ url: '/api/v1/hr/payouts/pending', params });
  }

  async getEmployeePayouts(employeeId: number, limit: number = 10) {
    return this.request<any>({ url: `/api/v1/hr/payouts/employee/${employeeId}`, params: { limit } });
  }

  async calculatePayout(data: any) {
    return this.request<any>({ url: "/api/v1/hr/payouts/calculate", method: "POST", data });
  }

  async approvePayout(payoutId: number, data: any) {
    return this.request<any>({ url: `/api/v1/hr/payouts/${payoutId}/approve`, method: "POST", data });
  }

  async markPayoutPaid(payoutId: number, paymentMethod: string, paymentReference: string) {
    return this.request<any>({ 
      url: `/api/v1/hr/payouts/${payoutId}/mark-paid`, 
      method: "POST",
      params: { payment_method: paymentMethod, payment_reference: paymentReference },
    });
  }

  async getPendingComplaints(limit: number = 50) {
    return this.request<any>({ url: '/api/v1/hr/complaints/pending', params: { limit } });
  }

  async investigateComplaint(complaintId: number, data: any) {
    return this.request<any>({ url: `/api/v1/hr/complaints/${complaintId}/investigate`, method: "POST", data });
  }

  async getAttendance(params?: { employee_id?: number }) {
    return this.request<any>({ url: '/api/v1/hr/attendance', params });
  }

  async recordAttendance(data: any) {
    return this.request<any>({ url: "/api/v1/hr/attendance", method: "POST", data });
  }

  // -------------------------------------------------------------------
  // PROCUREMENT
  // -------------------------------------------------------------------
  async getSuppliers(params?: any) {
    return this.request<any>({ url: '/api/v1/procurement/suppliers', params });
  }

  async getSupplier(supplierId: number) {
    return this.request<any>({ url: `/api/v1/procurement/suppliers/${supplierId}` });
  }

  async createSupplier(data: any) {
    return this.request<any>({ url: "/api/v1/procurement/suppliers", method: "POST", data });
  }

  async updateSupplier(supplierId: number, data: any) {
    return this.request<any>({ url: `/api/v1/procurement/suppliers/${supplierId}`, method: "PATCH", data });
  }

  async getPurchases(params?: any) {
    return this.request<any>({ url: '/api/v1/procurement/purchases', params });
  }

  async getPurchaseOrder(orderId: number) {
    return this.request<any>({ url: `/api/v1/procurement/purchases/${orderId}` });
  }

  async createPurchaseOrder(data: any) {
    return this.request<any>({ url: "/api/v1/procurement/purchases", method: "POST", data });
  }

  async updatePurchaseOrder(orderId: number, data: any) {
    return this.request<any>({ url: `/api/v1/procurement/purchases/${orderId}`, method: "PATCH", data });
  }

  async approvePurchase(purchaseId: number, data: any) {
    return this.request<any>({ url: `/api/v1/procurement/purchases/${purchaseId}/approve`, method: "POST", data });
  }

  async getProcurementStats() {
    return this.request<any>({ url: "/api/v1/procurement/stats" });
  }

  async getSupplierPerformance(supplierId?: number) {
    return this.request<any>({ url: '/api/v1/procurement/supplier-performance', params: { supplier_id: supplierId } });
  }

  // -------------------------------------------------------------------
  // MARKETING
  // -------------------------------------------------------------------
  async getCampaigns(params?: any) {
    return this.request<any>({ url: '/api/v1/marketing/campaigns', params });
  }

  async getCampaign(campaignId: number) {
    return this.request<any>({ url: `/api/v1/marketing/campaigns/${campaignId}` });
  }

  async createCampaign(data: any) {
    return this.request<any>({ url: "/api/v1/marketing/campaigns", method: "POST", data });
  }

  async getLeads(params?: any) {
    return this.request<any>({ url: '/api/v1/marketing/leads', params });
  }
  
  async createLead(data: any) {
    return this.request<any>({ url: '/api/v1/marketing/leads', method: 'POST', data });
  }

  async approveCampaign(campaignId: number, data: any) {
    return this.request<any>({ url: `/api/v1/marketing/campaigns/${campaignId}/approve`, method: "POST", data });
  }

  // -------------------------------------------------------------------
  // SCRAPERS & PRICE MONITORING
  // -------------------------------------------------------------------
  async triggerSupplierScrape(supplierId: number) {
    return this.request<any>({ url: `/api/v1/scrapers/suppliers/${supplierId}/scrape`, method: "POST" });
  }

  async scrapeGenericUrl(data: any) {
    return this.request<any>({ url: "/api/v1/scrapers/scrape-generic", method: "POST", data });
  }

  async scrapeAllSuppliers() {
    return this.request<any>({ url: "/api/v1/scrapers/scrape-all", method: "POST" });
  }

  async getPriceHistory(productId: number, limit: number = 100) {
    return this.request<any>({ url: `/api/v1/scrapers/price-history/${productId}`, params: { limit } });
  }

  async getRecentPriceDrops(days: number = 7, min_drop_percent: number = 5.0) {
    return this.request<any>({ 
      url: '/api/v1/scrapers/price-drops', 
      params: { days, min_drop_percent } 
    });
  }

  // -------------------------------------------------------------------
  // WORKFLOWS & APPROVALS
  // -------------------------------------------------------------------
  async commentWorkflow(instanceId: number, comment: string) {
    return this.request<any>({ 
      url: `/api/v1/workflows/workflows/${instanceId}/comment`, 
      method: 'POST',
      data: { comment },
    });
  }

  async getPendingWorkflows() {
    return this.request<any>({ url: "/api/v1/workflows/workflows/pending" });
  }

  async approveWorkflow(instanceId: number) {
    return this.request<any>({ url: `/api/v1/workflows/workflows/${instanceId}/approve`, method: "POST" });
  }

  async rejectWorkflow(instanceId: number) {
    return this.request<any>({ url: `/api/v1/workflows/workflows/${instanceId}/reject`, method: "POST" });
  }

  async workflowAction(module: string, itemId: number, action: string, data: any) {
    return this.request<any>({ url: `/api/v1/workflows/${module}/${itemId}/${action}`, method: "POST", data });
  }

  // -------------------------------------------------------------------
  // TASK STATISTICS
  // -------------------------------------------------------------------
  async getTaskStats() {
    return this.request<any>({ url: "/api/v1/tasks/stats" });
  }

  // -------------------------------------------------------------------
  // USERS & PERMISSIONS
  // -------------------------------------------------------------------
  async getUsers() {
    return this.request<any>({ url: "/api/v1/users/" });
  }

  async updateUser(userId: number, data: any) {
    return this.request<any>({ url: `/api/v1/users/${userId}`, method: "PUT", data });
  }
}

// Export a single shared instance
export const apiClient = new ApiClient(API_BASE_URL);
