import { apiClient } from "@/lib/api";

export interface InvoiceCreate {
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

export interface Invoice {
    id: number;
    invoice_number: string;
    project_id: number;
    customer_name: string | null;
    amount: string;
    amount_paid: string;
    status: string;
    due_date: string | null;
    payment_date: string | null;
}

export const invoicesApi = {
    // Generate new invoice
    generateInvoice: (data: InvoiceCreate) => {
        return apiClient.post<Invoice>('/api/v1/api/v1/finance/invoices/generate', data);
    },

    // Process payment for an invoice
    processPayment: (data: PaymentProcessRequest) => {
        return apiClient.post<Invoice>('/api/v1/api/v1/finance/payments/process', data);
    },

    // Get overdue invoices
    getOverdueInvoices: (daysOverdue: number = 0) => {
        return apiClient.get<any>('/api/v1/api/v1/finance/payments/overdue', {
            params: { days_overdue: daysOverdue }
        });
    },

    // Get payment schedule for a project
    getPaymentSchedule: (projectId: number) => {
        return apiClient.get<any>(`/api/v1/api/v1/finance/payments/schedule/${projectId}`);
    },

    // Create payment milestones
    createPaymentMilestones: (projectId: number, paymentTerms: any) => {
        return apiClient.post('/api/v1/api/v1/finance/payments/milestones', paymentTerms, {
            params: { project_id: projectId }
        });
    },
};
