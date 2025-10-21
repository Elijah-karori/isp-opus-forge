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

  async getTasks(params?: {
    skip?: number;
    limit?: number;
    project_id?: number;
    status?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/tasks/?${query}`);
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

  // -------------------------------------------------------------------
  // INVENTORY
  // -------------------------------------------------------------------
  async getProducts(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    low_stock?: boolean;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/inventory/products?${query}`);
  }

  // -------------------------------------------------------------------
  // TECHNICIANS
  // -------------------------------------------------------------------
  async getTechnicianLeaderboard(params?: { limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/technicians/leaderboard?${query}`);
  }

  async approveTaskCompletion(taskId: number, data: { approved: boolean; notes?: string }) {
    return this.request(`/api/v1/technicians/tasks/${taskId}/approve`, {
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

  // -------------------------------------------------------------------
  // HR
  // -------------------------------------------------------------------
  async getEmployees(params?: { engagement_type?: string; is_active?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/hr/employees?${query}`);
  }

  async getPendingPayouts(params?: { limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/hr/payouts/pending?${query}`);
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

  async investigateComplaint(
    complaintId: number,
    data: { is_valid: boolean; investigation_notes: string; resolution?: string }
  ) {
    return this.request(`/api/v1/hr/complaints/${complaintId}/investigate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPendingComplaints(limit: number = 50) {
    return this.request(`/api/v1/hr/complaints/pending?limit=${limit}`);
  }

  // -------------------------------------------------------------------
  // PROCUREMENT
  // -------------------------------------------------------------------
  async getSuppliers(params?: { skip?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/procurement/suppliers?${query}`);
  }

  async getPurchases(params?: { status?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/procurement/purchases?${query}`);
  }

  async approvePurchase(purchaseId: number, data: { approved: boolean; notes?: string }) {
    return this.request(`/api/v1/procurement/purchases/${purchaseId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // -------------------------------------------------------------------
  // MARKETING
  // -------------------------------------------------------------------
  async getCampaigns(params?: { limit?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/marketing/campaigns?${query}`);
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
  // GENERIC WORKFLOW ACTIONS
  // -------------------------------------------------------------------
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
}

// Export a single shared instance
export const apiClient = new ApiClient(API_BASE_URL);
