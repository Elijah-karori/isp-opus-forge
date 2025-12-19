// src/api/finance.ts
import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export interface BOMVariance {
  id: number;
  task_id: number;
  product_id: number;
  expected_qty: number;
  actual_qty: number;
  variance_qty: number;
  variance_cost: string;
  variance_percent: string;
  approval_notes?: string;
  approved: boolean;
  approver_id?: number;
  created_at: string;
  approved_at?: string;
  task?: {
    title: string;
    project_name: string;
    technician_name: string;
  };
  product?: {
    name: string;
    sku: string;
    unit_price: number;
  };
}

export interface ProjectFinancials {
  project_id: number;
  material_cost: string;
  labor_cost: string;
  overhead_cost: string;
  total_cost: string;
  revenue: string;
  gross_margin: string;
  margin_percent: string;
  updated_at: string;
  project?: {
    name: string;
    customer_name: string;
    budget: number;
    status: string;
  };
}

export interface FinancialSummary {
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  margin_percent: number;
  pending_variances: number;
  variance_impact: number;
  project_count: number;
  completed_projects: number;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  project_id?: number;
  task_id?: number;
  approved: boolean;
  approved_by?: number;
  created_at: string;
  receipt_url?: string;
}

export interface MasterBudget {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  created_at: string;
  updated_at?: string;
}

export interface MasterBudgetCreate {
  name: string;
  start_date: string;
  end_date: string;
  total_amount: number;
}

export interface MasterBudgetUpdate {
  name?: string;
  start_date?: string;
  end_date?: string;
  total_amount?: number;
}

export interface SubBudget {
  id: number;
  name: string;
  amount: string;
  financial_account_id?: number;
  master_budget_id: number;
}

export interface SubBudgetCreate {
  name: string;
  amount: number;
  financial_account_id?: number;
}

export interface SubBudgetUpdate {
  name?: string;
  amount?: number;
  financial_account_id?: number;
}

export interface BudgetUsage {
  id: number;
  sub_budget_id: number;
  description?: string;
  amount: string;
  type: 'credit' | 'debit';
  transaction_date: string;
  status?: 'pending_approval' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export interface BudgetUsageCreate {
  sub_budget_id: number;
  description?: string;
  amount: number;
  type: 'credit' | 'debit';
  transaction_date: string;
  status?: 'pending_approval' | 'approved' | 'rejected';
}

export interface BudgetUsageApproval {
  approved: boolean;
  approver_id: number;
  notes?: string;
}

export const createMasterBudget = (data: MasterBudgetCreate) =>
  axios.post<MasterBudget>(`/finance/master-budgets/`, data);

export const getMasterBudgets = () => axios.get<MasterBudget[]>(`/finance/master-budgets/`);

export const getMasterBudget = (masterBudgetId: number) =>
  axios.get<MasterBudget>(`/finance/master-budgets/${masterBudgetId}`);

export const updateMasterBudget = (masterBudgetId: number, data: MasterBudgetUpdate) =>
  axios.patch<MasterBudget>(`/finance/master-budgets/${masterBudgetId}`, data);

export const deleteMasterBudget = (masterBudgetId: number) =>
  axios.delete(`/finance/master-budgets/${masterBudgetId}`);

export const uploadBudget = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post<MasterBudget>(`/finance/upload-budget/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const createSubBudget = (masterBudgetId: number, data: SubBudgetCreate) =>
  axios.post<SubBudget>(`/finance/master-budgets/${masterBudgetId}/sub-budgets/`, data);

export const getSubBudgets = (masterBudgetId: number) =>
  axios.get<SubBudget[]>(`/finance/master-budgets/${masterBudgetId}/sub-budgets/`);

export const getSubBudget = (subBudgetId: number) =>
  axios.get<SubBudget>(`/finance/sub-budgets/${subBudgetId}`);

export const updateSubBudget = (subBudgetId: number, data: SubBudgetUpdate) =>
  axios.patch<SubBudget>(`/finance/sub-budgets/${subBudgetId}`, data);

export const deleteSubBudget = (subBudgetId: number) =>
  axios.delete(`/finance/sub-budgets/${subBudgetId}`);

export const createBudgetUsage = (data: BudgetUsageCreate) =>
  axios.post<BudgetUsage>(`/finance/budget-usages/`, data);

export const approveBudgetUsage = (usageId: number, data: BudgetUsageApproval) =>
  axios.post<BudgetUsage>(`/finance/budget-usages/${usageId}/approve`, data);

export const getBudgetUsages = (subBudgetId: number) =>
  axios.get<BudgetUsage[]>(`/finance/sub-budgets/${subBudgetId}/usages/`);

export const detectTaskVariances = (taskId: number) =>
  axios.post(`/finance/tasks/${taskId}/detect-variances`);

export const approveBomVariance = (varianceId: number, data: { approved: boolean; approver_id: number; notes?: string; }) =>
  axios.post(`/finance/variances/${varianceId}/approve`, data);

export const getPendingVariances = (limit: number = 50) =>
  axios.get(`/finance/variances/pending`, { params: { limit } });

export const getProjectFinancials = (projectId: number) =>
  axios.get(`/finance/projects/${projectId}/financials`);

export const getProjectsFinancialSummary = (params?: {
  status?: string;
  start_date?: string;
  end_date?: string;
}) => axios.get(`/finance/projects/summary`, { params });

export const getVarianceHistory = (params?: {
  start_date?: string;
  end_date?: string;
  project_id?: number;
  limit?: number;
}) => axios.get(`/finance/variances/history`, { params });

export const createExpense = (data: Partial<Expense>) =>
  axios.post(`/finance/expenses`, data);

export const approveExpense = (expenseId: number, data: {
  approved: boolean;
  approver_id: number;
  notes?: string;
}) => axios.post(`/finance/expenses/${expenseId}/approve`, data);

// Financial reports
export const getFinancialSummary = (params?: {
  start_date?: string;
  end_date?: string;
}) => axios.get(`/finance/summary`, { params });

export const getProfitLossReport = (params?: {
  start_date: string;
  end_date: string;
  group_by?: 'day' | 'week' | 'month';
}) => axios.get(`/finance/reports/profit-loss`, { params });

export const getBudgetVsActualReport = (projectId?: number) =>
  axios.get(`/finance/reports/budget-vs-actual`, { params: { project_id: projectId } });

// Dashboard statistics
export const getFinanceDashboardStats = () =>
  axios.get(`/finance/dashboard/stats`);

// =====================================================================
// M-PESA TYPES
// =====================================================================

export interface STKPushRequest {
  phone_number: string;
  amount: number;
  account_reference: string;
  transaction_desc?: string;
}

export interface C2BSimulateRequest {
  phone_number: string;
  amount: number;
  bill_ref_number: string;
}

export interface DynamicQRRequest {
  amount: number;
  merchant_name: string;
  ref_no: string;
  trx_code?: string;
}

export interface B2CRequest {
  phone_number: string;
  amount: number;
  remarks: string;
  occasion?: string;
}

export interface B2BRequest {
  amount: number;
  receiver_shortcode: string;
  account_reference: string;
}

export interface TaxRemittanceRequest {
  amount: number;
  payer_id: string;
  tax_type: string;
}

export interface RatibaRequest {
  phone_number: string;
  amount: number;
  start_date: string;
  end_date: string;
  frequency: string;
  account_reference: string;
}

export interface BankPaymentRequest {
  account_number: string;
  amount: number;
  currency?: string;
}

// =====================================================================
// M-PESA OPERATIONS
// =====================================================================

/**
 * Trigger M-Pesa STK Push
 */
export const triggerSTKPush = async (data: STKPushRequest) => {
  const response = await axios.post('/finance/mpesa/stkpush', data);
  return response.data;
};

/**
 * Simulate C2B Transaction (Sandbox)
 */
export const simulateC2B = async (data: C2BSimulateRequest) => {
  const response = await axios.post('/finance/mpesa/c2b/simulate', data);
  return response.data;
};

/**
 * Generate Dynamic QR Code
 */
export const generateDynamicQR = async (data: DynamicQRRequest) => {
  const response = await axios.post('/finance/mpesa/qr/generate', data);
  return response.data;
};

/**
 * B2C Payment / Salary / Pochi
 */
export const triggerB2CPayment = async (data: B2CRequest) => {
  const response = await axios.post('/finance/mpesa/b2c/pay', data);
  return response.data;
};

/**
 * B2B Payment (PayBill/BuyGoods)
 */
export const triggerB2BPayment = async (data: B2BRequest) => {
  const response = await axios.post('/finance/mpesa/b2b/pay', data);
  return response.data;
};

/**
 * KRA Tax Remittance
 */
export const remitKRATax = async (data: TaxRemittanceRequest) => {
  const response = await axios.post('/finance/mpesa/tax/remit', data);
  return response.data;
};

/**
 * Check M-Pesa Account Balance
 */
export const checkMpesaBalance = async () => {
  const response = await axios.get('/finance/mpesa/balance');
  return response.data;
};

/**
 * Create Standing Order (Ratiba)
 */
export const createRatibaOrder = async (data: RatibaRequest) => {
  const response = await axios.post('/finance/mpesa/ratiba/create', data);
  return response.data;
};

// =====================================================================
// NCBA BANKING
// =====================================================================

/**
 * Trigger NCBA Bank Payment
 */
export const triggerNCBAPayment = async (data: BankPaymentRequest) => {
  const response = await axios.post('/finance/ncba/pay', data);
  return response.data;
};

// Export as single API object for easier testing
export const financeApi = {
  // Variances
  getPendingVariances,
  approveBomVariance,
  detectTaskVariances,
  getVarianceHistory,

  // Project Financials
  getProjectFinancials,
  getProjectsFinancialSummary,

  // Expenses
  createExpense,
  approveExpense,

  // Reports
  getFinancialSummary,
  getProfitLossReport,
  getBudgetVsActualReport,
  getFinanceDashboardStats,

  // Master Budgets
  getMasterBudgets,
  getMasterBudget,
  createMasterBudget,
  updateMasterBudget,
  deleteMasterBudget,
  uploadBudget,

  // Sub Budgets
  getSubBudgets,
  getSubBudget,
  createSubBudget,
  updateSubBudget,
  deleteSubBudget,

  // Budget Usages
  createBudgetUsage,
  getBudgetUsages,
  approveBudgetUsage,

  // M-Pesa
  mpesa: {
    triggerSTKPush,
    simulateC2B,
    generateDynamicQR,
    triggerB2CPayment,
    triggerB2BPayment,
    remitKRATax,
    checkMpesaBalance,
    createRatibaOrder,
  },

  // NCBA Banking
  ncba: {
    triggerPayment: triggerNCBAPayment,
  },
};
