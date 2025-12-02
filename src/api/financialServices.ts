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

// API Functions
export const financialServicesApi = {
    // Budget Management
    allocateBudget: (request: BudgetAllocationRequest) =>
        apiClient.post(`/api/v1/finance/projects/${request.project_id}/budget/allocate`, request),

    getBudgetSummary: (projectId: number) =>
        apiClient.get(`/api/v1/finance/projects/${projectId}/budget/summary`),

    trackProjectCosts: (projectId: number) =>
        apiClient.get(`/api/v1/finance/projects/${projectId}/costs`),

    calculateBudgetVariance: (projectId: number) =>
        apiClient.get(`/api/v1/finance/projects/${projectId}/variance`),

    forecastCompletionCost: (projectId: number) =>
        apiClient.get(`/api/v1/finance/projects/${projectId}/forecast`),

    // Invoicing & Payments
    generateInvoice: (request: InvoiceCreateRequest) =>
        apiClient.post('/api/v1/finance/invoices/generate', request),

    processPayment: (request: PaymentProcessRequest) =>
        apiClient.post('/api/v1/finance/payments/process', request),

    getPaymentSchedule: (projectId: number) =>
        apiClient.get(`/api/v1/finance/payments/schedule/${projectId}`),

    getOverdueInvoices: (daysOverdue: number = 0) =>
        apiClient.get('/api/v1/finance/payments/overdue', {
            params: { days_overdue: daysOverdue },
        }),

    createPaymentMilestones: (projectId: number, paymentTerms: any) =>
        apiClient.post('/api/v1/finance/payments/milestones', paymentTerms, {
            params: { project_id: projectId },
        }),

    // Analytics
    getInfrastructureProfitability: (startDate?: string, endDate?: string) =>
        apiClient.get('/api/v1/finance/analytics/infrastructure-profitability', {
            params: { start_date: startDate, end_date: endDate },
        }),

    recommendBudgetAllocation: (totalBudget: number, periodMonths: number = 12) =>
        apiClient.get('/api/v1/finance/analytics/budget-allocation', {
            params: { total_budget: totalBudget, period_months: periodMonths },
        }),

    generateProfitabilityReport: (request: ProfitabilityReportRequest) =>
        apiClient.post('/api/v1/finance/analytics/profitability-report', request),

    getMonthlyProfit: (year: number, month: number) =>
        apiClient.get(`/api/v1/finance/analytics/monthly-profit/${year}/${month}`),

    getFinancialSnapshot: () =>
        apiClient.get('/api/v1/finance/snapshot'),

    getProjectProfitability: (projectId: number) =>
        apiClient.get(`/api/v1/finance/projects/${projectId}/profitability`),

    // Project Financial Operations
    completeProjectFinancial: (projectId: number) =>
        apiClient.post(`/api/v1/finance/projects/${projectId}/complete`),

    reconcileAccounts: (request: { start_date: string; end_date: string; account_ids?: number[] }) =>
        apiClient.post('/api/v1/finance/reconcile', request),

    processTaskCompletionFinancial: (taskId: number) =>
        apiClient.post(`/api/v1/finance/tasks/${taskId}/complete-financial`),
};
