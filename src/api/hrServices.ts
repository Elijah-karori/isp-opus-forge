// HR Services API Client
import apiClient from './axios';

// ========== Types ==========
export interface EmployeeProfile {
    id: number;
    user_id: number;
    role_id?: number;
    employee_code: string;
    engagement_type: 'full_time' | 'contract' | 'part_time' | 'temporary';
    department?: string;
    designation?: string;
    hire_date: string;
    contract_end_date?: string;
    termination_date?: string;
    is_active: boolean;
    quality_rating?: number;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    address?: string;
    bank_name?: string;
    bank_account?: string;
    tax_id?: string;
    certification_level?: string;
    notes?: string;
}

export interface RateCard {
    id: number;
    employee_id: number;
    rate_type: 'hourly' | 'daily' | 'project' | 'task';
    rate_amount: number;
    currency: string;
    effective_from: string;
    effective_to?: string;
    is_active: boolean;
}

export interface Payout {
    id: number;
    employee_id: number;
    gross_amount: number;
    net_amount: number;
    status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
    period_start: string;
    period_end: string;
    approved_by?: number;
    payment_method?: string;
    payment_reference?: string;
    paid_at?: string;
}

export interface Complaint {
    id: number;
    employee_id: number;
    task_id?: number;
    complaint_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    customer_name?: string;
    customer_phone?: string;
    is_valid?: boolean;
    deduction_amount?: number;
    reported_at: string;
    resolution?: string;
    investigation_notes?: string;
    status?: string;
}

export interface AttendanceRecord {
    id: number;
    employee_id: number;
    date: string;
    check_in?: string;
    check_out?: string;
    status: 'present' | 'absent' | 'half_day' | 'leave' | 'holiday';
    hours_worked?: number;
    notes?: string;
    check_in_location?: string;
    check_out_location?: string;
}

// ========== API Calls ==========

export const hrApi = {
    // Employee Management
    listEmployees: (params?: {
        engagement_type?: string;
        is_active?: boolean;
        skip?: number;
        limit?: number;
    }) => apiClient.get<EmployeeProfile[]>('/api/v1/hr/employees', { params }),

    createEmployee: (data: Partial<EmployeeProfile>) =>
        apiClient.post<EmployeeProfile>('/api/v1/hr/employees', data),

    getEmployee: (employeeId: number) =>
        apiClient.get<EmployeeProfile>(`/api/v1/hr/employees/${employeeId}`),

    toggleEmployeeStatus: (userId: number) =>
        apiClient.patch(`/api/v1/hr/employees/${userId}/toggle-status`),

    // Rate Cards
    createRateCard: (data: Partial<RateCard>) =>
        apiClient.post<RateCard>('/api/v1/hr/rate-cards', data),

    getEmployeeRateCards: (employeeId: number, activeOnly: boolean = true) =>
        apiClient.get<RateCard[]>(`/api/v1/hr/rate-cards/${employeeId}`, {
            params: { active_only: activeOnly },
        }),

    // Payouts
    calculatePayout: (data: {
        employee_id: number;
        period_start: string;
        period_end: string;
        task_id?: number;
        user_id?: number;
    }) => apiClient.post<Payout>('/api/v1/hr/payouts/calculate', data),

    getPendingPayouts: (limit: number = 50) =>
        apiClient.get<Payout[]>('/api/v1/hr/payouts/pending', { params: { limit } }),

    getEmployeePayouts: (employeeId: number, limit: number = 10) =>
        apiClient.get<Payout[]>(`/api/v1/hr/payouts/employee/${employeeId}`, {
            params: { limit },
        }),

    approvePayout: (payoutId: number, data: { approved: boolean; notes?: string }) =>
        apiClient.post<Payout>(`/api/v1/hr/payouts/${payoutId}/approve`, data),

    markPayoutPaid: (
        payoutId: number,
        paymentMethod: string,
        paymentReference: string
    ) =>
        apiClient.post<Payout>(`/api/v1/hr/payouts/${payoutId}/mark-paid`, null, {
            params: { payment_method: paymentMethod, payment_reference: paymentReference },
        }),

    // Complaints
    recordComplaint: (data: Partial<Complaint>) =>
        apiClient.post<Complaint>('/api/v1/hr/complaints', data),

    listComplaints: (employeeId?: number) =>
        apiClient.get<Complaint[]>('/api/v1/hr/complaints', {
            params: { employee_id: employeeId },
        }),

    getPendingComplaints: (limit: number = 50) =>
        apiClient.get<Complaint[]>('/api/v1/hr/complaints/pending', { params: { limit } }),

    investigateComplaint: (
        complaintId: number,
        isValid: boolean,
        investigationNotes: string,
        resolution?: string
    ) =>
        apiClient.post<Complaint>(`/api/v1/hr/complaints/${complaintId}/investigate`, null, {
            params: {
                is_valid: isValid,
                investigation_notes: investigationNotes,
                resolution,
            },
        }),

    // Attendance
    recordAttendance: (data: Partial<AttendanceRecord>) =>
        apiClient.post<AttendanceRecord>('/api/v1/hr/attendance', data),

    getEmployeeAttendance: (employeeId: number, startDate: string, endDate: string) =>
        apiClient.get<AttendanceRecord[]>(`/api/v1/hr/attendance/${employeeId}`, {
            params: { start_date: startDate, end_date: endDate },
        }),

    // Reports
    getPayrollSummary: (periodStart: string, periodEnd: string) =>
        apiClient.get('/api/v1/hr/reports/payroll-summary', {
            params: { period_start: periodStart, period_end: periodEnd },
        }),

    getEmployeePerformanceReport: (
        employeeId: number,
        periodStart: string,
        periodEnd: string
    ) =>
        apiClient.get(`/api/v1/hr/reports/employee-performance/${employeeId}`, {
            params: { period_start: periodStart, period_end: periodEnd },
        }),

    // Workflow
    approveWorkflowInstance: (instanceId: number, comment?: string) =>
        apiClient.post(`/api/v1/hr/workflow/${instanceId}/approve`, null, {
            params: { comment },
        }),
};

export default hrApi;
