/**
 * Financial Services API Client
 * Connects to advanced finance endpoints for budgeting, invoicing, and analytics
 */

import apiClient from './axios';

// Types
export interface BudgetLineItem {
    category: 'labor' | 'materials' | 'equipment' | 'overhead' | 'contingency' | 'other';
    description: string;
    quantity: number;
    unit_cost: number;
}

export interface BudgetAllocationRequest {
    project_id: number;
    line_items: BudgetLineItem[];
    notes?: string;
}

export interface InvoiceCreateRequest {
    project_id: number;
    milestone_name: string;
    amount: number;
    due_date?: string;
}

export interface PaymentProcessRequest {
    invoice_id: number;
    amount_paid: number;
    payment_method: string;
    payment_reference: string;
    payment_date?: string;
}

export interface ProfitabilityReportRequest {
    start_date: string;
    end_date: string;
}

// API Functions - return data directly
export const financialServicesApi = {
    // Budget Management
    allocateBudget: async (request: BudgetAllocationRequest) => {
        const response = await apiClient.post(`/api/v1/finance/projects/${request.project_id}/budget/allocate`, request);
        return response.data;
    },

    getBudgetSummary: async (projectId: number) => {
        const response = await apiClient.get(`/api/v1/finance/projects/${projectId}/budget/summary`);
        return response.data;
    },

    trackProjectCosts: async (projectId: number) => {
        const response = await apiClient.get(`/api/v1/finance/projects/${projectId}/costs`);
        return response.data;
    },

    calculateBudgetVariance: async (projectId: number) => {
        const response = await apiClient.get(`/api/v1/finance/projects/${projectId}/variance`);
        return response.data;
    },

    forecastCompletionCost: async (projectId: number) => {
        const response = await apiClient.get(`/api/v1/finance/projects/${projectId}/forecast`);
        return response.data;
    },

    // Invoicing & Payments
    generateInvoice: async (request: InvoiceCreateRequest) => {
        const response = await apiClient.post('/api/v1/finance/invoices/generate', request);
        return response.data;
    },

    processPayment: async (request: PaymentProcessRequest) => {
        const response = await apiClient.post('/api/v1/finance/payments/process', request);
        return response.data;
    },

    getPaymentSchedule: async (projectId: number) => {
        const response = await apiClient.get(`/api/v1/finance/payments/schedule/${projectId}`);
        return response.data;
    },

    getOverdueInvoices: async (daysOverdue: number = 0) => {
        const response = await apiClient.get('/api/v1/finance/payments/overdue', {
            params: { days_overdue: daysOverdue },
        });
        return response.data;
    },

    createPaymentMilestones: async (projectId: number, paymentTerms: any) => {
        const response = await apiClient.post('/api/v1/finance/payments/milestones', paymentTerms, {
            params: { project_id: projectId },
        });
        return response.data;
    },

    // Analytics
    getInfrastructureProfitability: async (startDate?: string, endDate?: string) => {
        const response = await apiClient.get('/api/v1/finance/analytics/infrastructure-profitability', {
            params: { start_date: startDate, end_date: endDate },
        });
        return response.data;
    },

    recommendBudgetAllocation: async (totalBudget: number, periodMonths: number = 12) => {
        const response = await apiClient.get('/api/v1/finance/analytics/budget-allocation', {
            params: { total_budget: totalBudget, period_months: periodMonths },
        });
        return response.data;
    },

    generateProfitabilityReport: async (request: ProfitabilityReportRequest) => {
        const response = await apiClient.post('/api/v1/finance/analytics/profitability-report', request);
        return response.data;
    },

    getMonthlyProfit: async (year: number, month: number) => {
        const response = await apiClient.get(`/api/v1/finance/analytics/monthly-profit/${year}/${month}`);
        return response.data;
    },

    getFinancialSnapshot: async () => {
        const response = await apiClient.get('/api/v1/finance/snapshot');
        return response.data;
    },

    getProjectProfitability: async (projectId: number) => {
        const response = await apiClient.get(`/api/v1/finance/projects/${projectId}/profitability`);
        return response.data;
    },

    // Project Financial Operations
    completeProjectFinancial: async (projectId: number) => {
        const response = await apiClient.post(`/api/v1/finance/projects/${projectId}/complete`);
        return response.data;
    },

    reconcileAccounts: async (request: { start_date: string; end_date: string; account_ids?: number[] }) => {
        const response = await apiClient.post('/api/v1/finance/reconcile', request);
        return response.data;
    },

    processTaskCompletionFinancial: async (taskId: number) => {
        const response = await apiClient.post(`/api/v1/finance/tasks/${taskId}/complete-financial`);
        return response.data;
    },
};