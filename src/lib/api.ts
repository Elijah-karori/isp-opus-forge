const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async getProjects(params?: { skip?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/projects/?${query}`);
  }

  async getTasks(params?: { skip?: number; limit?: number; project_id?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/tasks/?${query}`);
  }

  async getProducts(params?: { skip?: number; limit?: number; category?: string; low_stock?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/inventory/products?${query}`);
  }

  async getTechnicianLeaderboard(params?: { limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/technicians/leaderboard?${query}`);
  }

  async getPendingVariances(params?: { limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/finance/variances/pending?${query}`);
  }

  async getEmployees(params?: { engagement_type?: string; is_active?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/hr/employees?${query}`);
  }

  async getPendingPayouts(params?: { limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/hr/payouts/pending?${query}`);
  }

  async getCurrentUser(): Promise<any> {
    return this.request<any>('/api/v1/auth/me');
  }

  // Finance Actions
  async approveVariance(varianceId: number, data: { approved: boolean; approver_id: number; notes?: string }) {
    return this.request(`/api/v1/finance/variances/${varianceId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async detectTaskVariances(taskId: number) {
    return this.request(`/api/v1/finance/tasks/${taskId}/detect-variances`, {
      method: 'POST',
    });
  }

  async getProjectFinancials(projectId: number) {
    return this.request(`/api/v1/finance/projects/${projectId}/financials`);
  }

  // HR Actions
  async approvePayout(payoutId: number, data: { approved: boolean; notes?: string }) {
    return this.request(`/api/v1/hr/payouts/${payoutId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markPayoutPaid(payoutId: number, paymentMethod: string, paymentReference: string) {
    const query = new URLSearchParams({ payment_method: paymentMethod, payment_reference: paymentReference }).toString();
    return this.request(`/api/v1/hr/payouts/${payoutId}/mark-paid?${query}`, {
      method: 'POST',
    });
  }

  async investigateComplaint(complaintId: number, data: { is_valid: boolean; investigation_notes: string; resolution?: string }) {
    const query = new URLSearchParams({
      is_valid: data.is_valid.toString(),
      investigation_notes: data.investigation_notes,
      ...(data.resolution && { resolution: data.resolution }),
    }).toString();
    return this.request(`/api/v1/hr/complaints/${complaintId}/investigate?${query}`, {
      method: 'POST',
    });
  }

  async getPendingComplaints(limit: number = 50) {
    return this.request(`/api/v1/hr/complaints/pending?limit=${limit}`);
  }

  // Task Actions
  async updateTaskBOM(taskId: number, data: any) {
    return this.request(`/api/v1/tasks/${taskId}/update-bom`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveTaskBOM(taskId: number) {
    return this.request(`/api/v1/tasks/${taskId}/approve-bom`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
