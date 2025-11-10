// src/api/finance.ts
import axios from "./axios";

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

// Variance management
export const getPendingVariances = (limit: number = 50) =>
  axios.get(`/finance/variances/pending`, { params: { limit } });

export const approveVariance = (varianceId: number, data: { 
  approved: boolean; 
  approver_id: number; 
  notes?: string;
}) => axios.post(`/finance/variances/${varianceId}/approve`, data);

export const getVarianceHistory = (params?: {
  start_date?: string;
  end_date?: string;
  project_id?: number;
  limit?: number;
}) => axios.get(`/finance/variances/history`, { params });

// Project financials
export const getProjectFinancials = (projectId: number) =>
  axios.get(`/finance/projects/${projectId}/financials`);

export const getProjectsFinancialSummary = (params?: {
  status?: string;
  start_date?: string;
  end_date?: string;
}) => axios.get(`/finance/projects/summary`, { params });

// Task variance detection
export const detectTaskVariances = (taskId: number) =>
  axios.post(`/finance/tasks/${taskId}/detect-variances`);

// Expense management
export const getExpenses = (params?: {
  start_date?: string;
  end_date?: string;
  category?: string;
  approved?: boolean;
}) => axios.get(`/finance/expenses`, { params });

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
