
// =====================================================================
// FILE: src/lib/api.ts
// =====================================================================

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.endsWith("/api/v1")
  ? import.meta.env.VITE_API_BASE_URL
  : `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

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

  async delete<T>(url: string): Promise<T> {
    return this.request<T>({ url, method: 'DELETE' });
  }

  // -------------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------------
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

  async registerUser(data: any): Promise<any> {
    return this.request<any>({ 
      url: "/auth/register", 
      method: "POST", 
      data 
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.request<any>({ url: "/auth/me" });
  }

  // -------------------------------------------------------------------
  // PROJECTS & TASKS
  // -------------------------------------------------------------------
  async getProjects(params?: { skip?: number; limit?: number; status?: string }) {
    return this.request<any>({ url: '/projects/', method: 'GET', params });
  }

  async getProject(projectId: number) {
    return this.request<any>({ url: `/projects/${projectId}` });
  }

  async createProject(data: any) {
    return this.request<any>({ url: "/projects/", method: "POST", data });
  }

  async updateProject(projectId: number, data: any) {
    return this.request<any>({ url: `/projects/${projectId}`, method: "PATCH", data });
  }
  
  async createProjectFromLead(leadId: number, data: any) {
    return this.createProject({ ...data, lead_id: leadId });
  }

  async getTasks(params?: any) {
    return this.request<any>({ url: '/tasks/', method: 'GET', params });
  }

  async getTask(taskId: number) {
    return this.request<any>({ url: `/tasks/${taskId}` });
  }

  async createTask(data: any) {
    return this.request<any>({ url: "/tasks/", method: "POST", data });
  }

  async updateTask(taskId: number, data: any) {
    return this.request<any>({ url: `/tasks/${taskId}`, method: "PATCH", data });
  }

  async updateTaskBOM(taskId: number, data: any) {
    return this.request<any>({ url: `/tasks/${taskId}/update-bom`, method: "POST", data });
  }

  async approveTaskBOM(taskId: number) {
    return this.request<any>({ url: `/tasks/${taskId}/approve-bom`, method: "POST" });
  }

  async completeTask(taskId: number, data: any) {
    return this.request<any>({ url: `/tasks/${taskId}/complete`, method: "POST", data });
  }

  // -------------------------------------------------------------------
  // INVENTORY
  // -------------------------------------------------------------------
  async getProducts(params?: any) {
    return this.request<any>({ url: '/inventory/products', params });
  }

  async getProduct(productId: number) {
    return this.request<any>({ url: `/inventory/products/${productId}` });
  }

  async createProduct(data: any) {
    return this.request<any>({ url: "/inventory/products", method: "POST", data });
  }

  async updateProduct(productId: number, data: any) {
    return this.request<any>({ url: `/inventory/products/${productId}`, method: "PATCH", data });
  }

  async searchInventory(query: string) {
    return this.request<any>({ url: '/inventory/search', params: { q: query } });
  }

  async getInventoryStats() {
    return this.request<any>({ url: "/inventory/stats" });
  }

  async getLowStockAlerts() {
    return this.request<any>({ url: "/inventory/alerts/low-stock" });
  }

  // -------------------------------------------------------------------
  // TECHNICIANS & SATISFACTION
  // -------------------------------------------------------------------
  async getTechnicians(params?: { active_only?: boolean }) {
    return this.request<any>({ url: '/technicians', params });
  }

  async getTechnician(technicianId: number) {
    return this.request<any>({ url: `/technicians/${technicianId}` });
  }

  async createTechnician(data: any) {
    return this.request<any>({ url: "/technicians", method: "POST", data });
  }

  async getTechnicianLeaderboard(params?: { limit?: number }) {
    return this.request<any>({ url: '/technicians/leaderboard', params });
  }

  async getTechnicianPerformance(technicianId: number, params?: any) {
    return this.request<any>({ url: `/technicians/${technicianId}/performance`, params });
  }

  async getTechnicianTasks(technicianId: number, params?: any) {
    return this.request<any>({ url: `/technicians/${technicianId}/tasks`, params });
  }
    

  async approveTaskCompletion(taskId: number, data: { approved: boolean; notes?: string }) {
    return this.request<any>({ url: `/technicians/tasks/${taskId}/approve`, method: "POST", data });
  }

  async getCustomerSatisfaction(params?: any) {
    return this.request<any>({ url: '/technicians/satisfaction', params });
  }

  async recordCustomerSatisfaction(data: { task_id: number; rating: number; feedback?: string }) {
    return this.request<any>({ url: '/technicians/satisfaction', method: "POST", data });
  }

  // -------------------------------------------------------------------
  // FINANCE
  // -------------------------------------------------------------------
  async getPendingVariances(limit = 50) {
    return this.request<any>({ url: '/finance/variances/pending', params: { limit } });
  }

  async getVarianceHistory(params?: any) {
    return this.request<any>({ url: '/finance/variances/history', params });
  }

  async approveVariance(varianceId: number, data: any) {
    return this.request<any>({ url: `/finance/variances/${varianceId}/approve`, method: "POST", data });
  }

  async detectTaskVariances(taskId: number) {
    return this.request<any>({ url: `/finance/tasks/${taskId}/detect-variances`, method: "POST" });
  }

  async getProjectFinancials(projectId: number) {
    return this.request<any>({ url: `/finance/projects/${projectId}/financials` });
  }
  
  async markPayoutAsPaid(payoutId: number) {
    return this.request<any>({ url: `/hr/payouts/${payoutId}/mark-paid`, method: 'POST' });
  }

  async getProjectsFinancialSummary(params?: any) {
    return this.request<any>({ url: '/finance/projects/summary', params });
  }

  async getFinancialSummary(params?: any) {
    return this.request<any>({ url: '/finance/summary', params });
  }

  async getFinanceDashboardStats() {
    return this.request<any>({ url: "/finance/dashboard/stats" });
  }

  async getExpenses(params?: any) {
    return this.request<any>({ url: '/finance/expenses', params });
  }

  async createExpense(data: any) {
    return this.request<any>({ url: "/finance/expenses", method: "POST", data });
  }

  async approveExpense(expenseId: number, data: any) {
    return this.request<any>({ url: `/finance/expenses/${expenseId}/approve`, method: "POST", data });
  }

  // -------------------------------------------------------------------
  // HR
  // -------------------------------------------------------------------
  async getEmployees(params?: any) {
    return this.request<any>({ url: '/hr/employees', params });
  }

  async getEmployee(employeeId: number) {
    return this.request<any>({ url: `/hr/employees/${employeeId}` });
  }

  async createEmployee(data: any) {
    return this.request<any>({ url: "/hr/employees", method: "POST", data });
  }

  async updateEmployee(employeeId: number, data: any) {
    return this.request<any>({ url: `/hr/employees/${employeeId}`, method: "PATCH", data });
  }

  async deleteEmployee(employeeId: number) {
    return this.request<any>({ url: `/hr/employees/${employeeId}`, method: "DELETE" });
  }

  async getRateCards(employeeId?: number) {
    return this.request<any>({ url: '/hr/rate-cards', params: employeeId ? { employee_id: employeeId } : undefined });
  }

  async createRateCard(data: any) {
    return this.request<any>({ url: "/hr/rate-cards", method: "POST", data });
  }

  async getEmployeeAttendance(employeeId: number, params?: any) {
    return this.request<any>({ url: `/hr/employees/${employeeId}/attendance`, params });
  }

  async getComplaints(params?: any) {
    return this.request<any>({ url: '/hr/complaints', params });
  }

  async recordComplaint(data: any) {
    return this.request<any>({ url: "/hr/complaints", method: "POST", data });
  }

  async getPayrollSummary(params?: any) {
    return this.request<any>({ url: '/hr/payroll/summary', params });
  }

  async getEmployeePerformance(employeeId: number, params?: any) {
    return this.request<any>({ url: `/hr/employees/${employeeId}/performance`, params });
  }

  async exportEmployees(format: string = 'csv') {
    return this.request<any>({ url: '/hr/employees/export', params: { format } });
  }

  async exportAttendance(params?: any) {
    return this.request<any>({ url: '/hr/attendance/export', params });
  }

  async exportPayroll(params?: any) {
    return this.request<any>({ url: '/hr/payroll/export', params });
  }

  async getPendingPayouts(params?: { limit?: number }) {
    return this.request<any>({ url: '/hr/payouts/pending', params });
  }

  async getEmployeePayouts(employeeId: number, limit: number = 10) {
    return this.request<any>({ url: `/hr/payouts/employee/${employeeId}`, params: { limit } });
  }

  async calculatePayout(data: any) {
    return this.request<any>({ url: "/hr/payouts/calculate", method: "POST", data });
  }

  async approvePayout(payoutId: number, data: any) {
    return this.request<any>({ url: `/hr/payouts/${payoutId}/approve`, method: "POST", data });
  }

  async markPayoutPaid(payoutId: number, paymentMethod: string, paymentReference: string) {
    return this.request<any>({ 
      url: `/hr/payouts/${payoutId}/mark-paid`, 
      method: "POST",
      params: { payment_method: paymentMethod, payment_reference: paymentReference },
    });
  }

  async getPendingComplaints(limit: number = 50) {
    return this.request<any>({ url: '/hr/complaints/pending', params: { limit } });
  }

  async investigateComplaint(complaintId: number, data: any) {
    return this.request<any>({ url: `/hr/complaints/${complaintId}/investigate`, method: "POST", data });
  }

  async getAttendance(params?: { employee_id?: number }) {
    return this.request<any>({ url: '/hr/attendance', params });
  }

  async recordAttendance(data: any) {
    return this.request<any>({ url: "/hr/attendance", method: "POST", data });
  }

  // -------------------------------------------------------------------
  // PROCUREMENT
  // -------------------------------------------------------------------
  async getSuppliers(params?: any) {
    return this.request<any>({ url: '/procurement/suppliers', params });
  }

  async getSupplier(supplierId: number) {
    return this.request<any>({ url: `/procurement/suppliers/${supplierId}` });
  }

  async createSupplier(data: any) {
    return this.request<any>({ url: "/procurement/suppliers", method: "POST", data });
  }

  async updateSupplier(supplierId: number, data: any) {
    return this.request<any>({ url: `/procurement/suppliers/${supplierId}`, method: "PATCH", data });
  }

  async getPurchases(params?: any) {
    return this.request<any>({ url: '/procurement/purchases', params });
  }

  async getPurchaseOrder(orderId: number) {
    return this.request<any>({ url: `/procurement/purchases/${orderId}` });
  }

  async createPurchaseOrder(data: any) {
    return this.request<any>({ url: "/procurement/purchases", method: "POST", data });
  }

  async updatePurchaseOrder(orderId: number, data: any) {
    return this.request<any>({ url: `/procurement/purchases/${orderId}`, method: "PATCH", data });
  }

  async approvePurchase(purchaseId: number, data: any) {
    return this.request<any>({ url: `/procurement/purchases/${purchaseId}/approve`, method: "POST", data });
  }

  async getProcurementStats() {
    return this.request<any>({ url: "/procurement/stats" });
  }

  async getSupplierPerformance(supplierId?: number) {
    return this.request<any>({ url: '/procurement/supplier-performance', params: { supplier_id: supplierId } });
  }

  // -------------------------------------------------------------------
  // MARKETING
  // -------------------------------------------------------------------
  async getCampaigns(params?: any) {
    return this.request<any>({ url: '/marketing/campaigns', params });
  }

  async getCampaign(campaignId: number) {
    return this.request<any>({ url: `/marketing/campaigns/${campaignId}` });
  }

  async createCampaign(data: any) {
    return this.request<any>({ url: "/marketing/campaigns", method: "POST", data });
  }

  async getLeads(params?: any) {
    return this.request<any>({ url: '/marketing/leads', params });
  }
  
  async createLead(data: any) {
    return this.request<any>({ url: '/marketing/leads', method: 'POST', data });
  }

  async approveCampaign(campaignId: number, data: any) {
    return this.request<any>({ url: `/marketing/campaigns/${campaignId}/approve`, method: "POST", data });
  }

  // -------------------------------------------------------------------
  // SCRAPERS & PRICE MONITORING
  // -------------------------------------------------------------------
  async triggerSupplierScrape(supplierId: number) {
    return this.request<any>({ url: `/scrapers/suppliers/${supplierId}/scrape`, method: "POST" });
  }

  async scrapeGenericUrl(data: any) {
    return this.request<any>({ url: "/scrapers/scrape-generic", method: "POST", data });
  }

  async scrapeAllSuppliers() {
    return this.request<any>({ url: "/scrapers/scrape-all", method: "POST" });
  }

  async getPriceHistory(productId: number, limit: number = 100) {
    return this.request<any>({ url: `/scrapers/price-history/${productId}`, params: { limit } });
  }

  async getRecentPriceDrops(days: number = 7, min_drop_percent: number = 5.0) {
    return this.request<any>({ 
      url: '/scrapers/price-drops', 
      params: { days, min_drop_percent } 
    });
  }

  // -------------------------------------------------------------------
  // WORKFLOWS & APPROVALS
  // -------------------------------------------------------------------
  async commentWorkflow(instanceId: number, comment: string) {
    return this.request<any>({ 
      url: `/workflows/workflows/${instanceId}/comment`, 
      method: 'POST',
      data: { comment },
    });
  }

  async getPendingWorkflows() {
    return this.request<any>({ url: "/workflows/workflows/pending" });
  }

  async approveWorkflow(instanceId: number) {
    return this.request<any>({ url: `/workflows/workflows/${instanceId}/approve`, method: "POST" });
  }

  async rejectWorkflow(instanceId: number) {
    return this.request<any>({ url: `/workflows/workflows/${instanceId}/reject`, method: "POST" });
  }

  async workflowAction(module: string, itemId: number, action: string, data: any) {
    return this.request<any>({ url: `/workflows/${module}/${itemId}/${action}`, method: "POST", data });
  }

  // -------------------------------------------------------------------
  // TASK STATISTICS
  // -------------------------------------------------------------------
  async getTaskStats() {
    return this.request<any>({ url: "/tasks/stats" });
  }

  // -------------------------------------------------------------------
  // USERS & PERMISSIONS
  // -------------------------------------------------------------------
  async getUsers() {
    return this.request<any>({ url: "/users/" });
  }

  async updateUser(userId: number, data: any) {
    return this.request<any>({ url: `/users/${userId}`, method: "PUT", data });
  }
}

// Export a single shared instance
export const apiClient = new ApiClient(API_BASE_URL);
