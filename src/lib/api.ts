// =====================================================================
// FILE: src/lib/api.ts
// =====================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthToken {
  access_token: string;
  token_type: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = "/login";
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // -------------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------------
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) throw new Error("Invalid credentials");

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<any> {
    return this.request<any>("/api/v1/auth/me");
  }

  // -------------------------------------------------------------------
  // PROJECTS & TASKS
  // -------------------------------------------------------------------
  async getProjects(params?: { skip?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/projects/?${query}`);
  }

  async getProject(projectId: number) {
    return this.request(`/api/v1/projects/${projectId}`);
  }

  async createProject(data: any) {
    return this.request("/api/v1/projects/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(projectId: number, data: any) {
    return this.request(`/api/v1/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getTasks(params?: {
    skip?: number;
    limit?: number;
    project_id?: number;
    technician_id?: number;
    status?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/tasks/?${query}`);
  }

  async getTask(taskId: number) {
    return this.request(`/api/v1/tasks/${taskId}`);
  }

  async createTask(data: any) {
    return this.request("/api/v1/tasks/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId: number, data: any) {
    return this.request(`/api/v1/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async updateTaskBOM(taskId: number, data: any) {
    return this.request(`/api/v1/tasks/${taskId}/update-bom`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async approveTaskBOM(taskId: number) {
    return this.request(`/api/v1/tasks/${taskId}/approve-bom`, { method: "POST" });
  }

  async completeTask(taskId: number, data: any) {
    return this.request(`/api/v1/tasks/${taskId}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // -------------------------------------------------------------------
  // INVENTORY
  // -------------------------------------------------------------------
  async getProducts(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    low_stock?: boolean;
    supplier_id?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/inventory/products?${query}`);
  }

  async getProduct(productId: number) {
    return this.request(`/api/v1/inventory/products/${productId}`);
  }

  async createProduct(data: any) {
    return this.request("/api/v1/inventory/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(productId: number, data: any) {
    return this.request(`/api/v1/inventory/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async searchInventory(query: string) {
    return this.request(`/api/v1/inventory/search?q=${encodeURIComponent(query)}`);
  }

  async getInventoryStats() {
    return this.request("/api/v1/inventory/stats");
  }

  async getLowStockAlerts() {
    return this.request("/api/v1/inventory/alerts/low-stock");
  }

  // -------------------------------------------------------------------
  // TECHNICIANS
  // -------------------------------------------------------------------
  async getTechnicians(params?: { active_only?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/technicians?${query}`);
  }

  async getTechnician(technicianId: number) {
    return this.request(`/api/v1/technicians/${technicianId}`);
  }

  async getTechnicianLeaderboard(params?: { limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/technicians/leaderboard?${query}`);
  }

  async getTechnicianPerformance(technicianId: number, params?: {
    period_start?: string;
    period_end?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/technicians/${technicianId}/performance?${query}`);
  }

  async approveTaskCompletion(taskId: number, data: { approved: boolean; notes?: string }) {
    return this.request(`/api/v1/technicians/tasks/${taskId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async recordCustomerSatisfaction(data: { task_id: number; rating: number; feedback?: string }) {
    return this.request(`/api/v1/technicians/satisfaction`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // -------------------------------------------------------------------
  // FINANCE
  // -------------------------------------------------------------------
  async getPendingVariances(params?: { limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/finance/variances/pending?${query}`);
  }

  async getVarianceHistory(params?: {
    start_date?: string;
    end_date?: string;
    project_id?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/finance/variances/history?${query}`);
  }

  async approveVariance(
    varianceId: number,
    data: { approved: boolean; approver_id: number; notes?: string }
  ) {
    return this.request(`/api/v1/finance/variances/${varianceId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async detectTaskVariances(taskId: number) {
    return this.request(`/api/v1/finance/tasks/${taskId}/detect-variances`, {
      method: "POST",
    });
  }

  async getProjectFinancials(projectId: number) {
    return this.request(`/api/v1/finance/projects/${projectId}/financials`);
  }

  async getProjectsFinancialSummary(params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/finance/projects/summary?${query}`);
  }

  async getFinancialSummary(params?: { start_date?: string; end_date?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/finance/summary?${query}`);
  }

  async getFinanceDashboardStats() {
    return this.request("/api/v1/finance/dashboard/stats");
  }

  async getExpenses(params?: {
    start_date?: string;
    end_date?: string;
    category?: string;
    approved?: boolean;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/finance/expenses?${query}`);
  }

  async createExpense(data: any) {
    return this.request("/api/v1/finance/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async approveExpense(expenseId: number, data: { approved: boolean; approver_id: number; notes?: string }) {
    return this.request(`/api/v1/finance/expenses/${expenseId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // -------------------------------------------------------------------
  // HR
  // -------------------------------------------------------------------
  async getEmployees(params?: { engagement_type?: string; is_active?: boolean; skip?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/hr/employees?${query}`);
  }

  async getEmployee(employeeId: number) {
    return this.request(`/api/v1/hr/employees/${employeeId}`);
  }

  async createEmployee(data: any) {
    return this.request("/api/v1/hr/employees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPendingPayouts(params?: { limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/hr/payouts/pending?${query}`);
  }

  async getEmployeePayouts(employeeId: number, limit: number = 10) {
    return this.request(`/api/v1/hr/payouts/employee/${employeeId}?limit=${limit}`);
  }

  async calculatePayout(data: any) {
    return this.request("/api/v1/hr/payouts/calculate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async approvePayout(payoutId: number, data: { approved: boolean; notes?: string }) {
    return this.request(`/api/v1/hr/payouts/${payoutId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async markPayoutPaid(
    payoutId: number,
    paymentMethod: string,
    paymentReference: string
  ) {
    const query = new URLSearchParams({
      payment_method: paymentMethod,
      payment_reference: paymentReference,
    }).toString();
    return this.request(`/api/v1/hr/payouts/${payoutId}/mark-paid?${query}`, {
      method: "POST",
    });
  }

  async getPendingComplaints(limit: number = 50) {
    return this.request(`/api/v1/hr/complaints/pending?limit=${limit}`);
  }

  async investigateComplaint(
    complaintId: number,
    data: { is_valid: boolean; investigation_notes: string; resolution?: string }
  ) {
    return this.request(`/api/v1/hr/complaints/${complaintId}/investigate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAttendance(params?: { employee_id?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/hr/attendance?${query}`);
  }

  async recordAttendance(data: any) {
    return this.request("/api/v1/hr/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // -------------------------------------------------------------------
  // PROCUREMENT
  // -------------------------------------------------------------------
  async getSuppliers(params?: { skip?: number; limit?: number; active_only?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/procurement/suppliers?${query}`);
  }

  async getSupplier(supplierId: number) {
    return this.request(`/api/v1/procurement/suppliers/${supplierId}`);
  }

  async createSupplier(data: any) {
    return this.request("/api/v1/procurement/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSupplier(supplierId: number, data: any) {
    return this.request(`/api/v1/procurement/suppliers/${supplierId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getPurchases(params?: { status?: string; supplier_id?: number; limit?: number; skip?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/procurement/purchases?${query}`);
  }

  async getPurchaseOrder(orderId: number) {
    return this.request(`/api/v1/procurement/purchases/${orderId}`);
  }

  async createPurchaseOrder(data: any) {
    return this.request("/api/v1/procurement/purchases", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseOrder(orderId: number, data: any) {
    return this.request(`/api/v1/procurement/purchases/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async approvePurchase(purchaseId: number, data: { approved: boolean; notes?: string }) {
    return this.request(`/api/v1/procurement/purchases/${purchaseId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProcurementStats() {
    return this.request("/api/v1/procurement/stats");
  }

  async getSupplierPerformance(supplierId?: number) {
    const query = supplierId ? `?supplier_id=${supplierId}` : '';
    return this.request(`/api/v1/procurement/supplier-performance${query}`);
  }

  // -------------------------------------------------------------------
  // MARKETING
  // -------------------------------------------------------------------
  async getCampaigns(params?: { limit?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/marketing/campaigns?${query}`);
  }

  async getCampaign(campaignId: number) {
    return this.request(`/api/v1/marketing/campaigns/${campaignId}`);
  }

  async createCampaign(data: any) {
    return this.request("/api/v1/marketing/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getLeads(params?: { limit?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/marketing/leads?${query}`);
  }

  async approveCampaign(campaignId: number, data: { approved: boolean; notes?: string }) {
    return this.request(`/api/v1/marketing/campaigns/${campaignId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async recordCustomerSatisfaction(
    customerId: number,
    data: { rating: number; feedback?: string }
  ) {
    return this.request(`/api/v1/marketing/customers/${customerId}/satisfaction`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // -------------------------------------------------------------------
  // SCRAPERS & PRICE MONITORING
  // -------------------------------------------------------------------
  async triggerSupplierScrape(supplierId: number) {
    return this.request(`/api/v1/scrapers/suppliers/${supplierId}/scrape`, {
      method: "POST",
    });
  }

  async scrapeGenericUrl(data: { url: string; category?: string; supplier_id?: number }) {
    return this.request("/api/v1/scrapers/scrape-generic", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async scrapeAllSuppliers() {
    return this.request("/api/v1/scrapers/scrape-all", {
      method: "POST",
    });
  }

  async getPriceHistory(productId: number, limit: number = 100) {
    return this.request(`/api/v1/scrapers/price-history/${productId}?limit=${limit}`);
  }

  async getRecentPriceDrops(days: number = 7, min_drop_percent: number = 5.0) {
    const query = new URLSearchParams({
      days: days.toString(),
      min_drop_percent: min_drop_percent.toString()
    }).toString();
    return this.request(`/api/v1/scrapers/price-drops?${query}`);
  }

  // -------------------------------------------------------------------
  // WORKFLOWS & APPROVALS
  // -------------------------------------------------------------------
  async getPendingWorkflows() {
    return this.request("/api/v1/workflows/workflows/pending");
  }

  async approveWorkflow(instanceId: number) {
    return this.request(`/api/v1/workflows/workflows/${instanceId}/approve`, {
      method: "POST",
    });
  }

  async rejectWorkflow(instanceId: number) {
    return this.request(`/api/v1/workflows/workflows/${instanceId}/reject`, {
      method: "POST",
    });
  }

  async workflowAction(
    module: string,
    itemId: number,
    action: "approve" | "reject" | "comment",
    data: { user_id: number; comment?: string }
  ) {
    return this.request(`/api/v1/workflows/${module}/${itemId}/${action}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // -------------------------------------------------------------------
  // TASK STATISTICS
  // -------------------------------------------------------------------
  async getTaskStats() {
    return this.request("/api/v1/tasks/stats");
  }

  // -------------------------------------------------------------------
  // USERS & PERMISSIONS
  // -------------------------------------------------------------------
  async getUsers() {
    return this.request("/api/v1/users/users/");
  }

  async createUser(data: any) {
    return this.request("/api/v1/users/users/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUser(userId: number, data: any) {
    return this.request(`/api/v1/users/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

// Export a single shared instance
export const apiClient = new ApiClient(API_BASE_URL);
