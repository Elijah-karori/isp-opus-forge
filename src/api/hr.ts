import { apiClient } from '@/lib/api';

// Based on OpenAPI spec

export enum EngagementType {
  FullTime = "FULL_TIME",
  Contract = "CONTRACT",
  TaskBased = "TASK_BASED",
  ServiceBased = "SERVICE_BASED",
  Hybrid = "HYBRID",
}

export enum PaymentStatus {
  Pending = 'pending',
  Approved = 'approved',
  Paid = 'paid',
  Rejected = 'rejected',
  Disputed = 'disputed',
}

export interface Employee {
  id: number;
  user_id: number;
  employee_code: string;
  department: string;
  designation: string;
  date_of_joining: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  user?: {
    full_name: string;
    email: string;
  };
}

export interface EmployeeCreate {
  user_id: number;
  employee_code?: string;
  department: string;
  designation: string;
  date_of_joining: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  hours_worked?: number;
  notes?: string;
  check_in_location?: string;
  check_out_location?: string;
  technician?: { 
      id: number;
      full_name: string;
      employee_code: string;
  };
}

export interface AttendanceRecordCreate {
  employee_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  check_in?: string;
  check_out?: string;
  check_in_location?: string;
  notes?: string;
}

export interface Complaint {
  id: number;
  employee_id: number;
  task_id?: number;
  complaint_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  is_valid?: boolean;
  reported_at: string;
}

export interface ComplaintCreate {
  employee_id: number;
  task_id?: number;
  complaint_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RateCard {
  id: number;
  employee_id: number;
  engagement_type: EngagementType;
  base_rate: string;
  rate_unit: string;
  skill_multiplier?: string;
  certification_bonus?: string;
  overtime_rate?: string;
  tax_rate?: string;
  insurance_deduction?: string;
  valid_from: string;
  valid_to?: string;
  is_active: boolean;
  notes?: string;
}

export interface RateCardCreate {
  employee_id: number;
  engagement_type: EngagementType;
  base_rate: number | string;
  rate_unit: string;
  skill_multiplier?: number | string;
  certification_bonus?: number | string;
  overtime_rate?: number | string;
  tax_rate?: number | string;
  insurance_deduction?: number | string;
  valid_from: string;
  valid_to?: string;
  is_active?: boolean;
  notes?: string;
}

export interface Payout {
  id: number;
  employee_id: number;
  gross_amount: string;
  net_amount: string;
  status: PaymentStatus;
  period_start: string;
  period_end: string;
  approved_by?: number;
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
}

export interface PayrollSummary {
  period_start: string;
  period_end: string;
  total_employees: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  pending_count: number;
  paid_count: number;
}

export interface EmployeePerformance {
  employee_id: number;
  employee_name: string;
  department: string;
  tasks_completed: number;
  tasks_assigned: number;
  completion_rate: number;
  avg_rating: number;
  total_revenue: number;
  complaints_count: number;
  attendance_rate: number;
  on_time_rate: number;
}

// Employee management
export const getEmployees = (params?: { department?: string; status?: string; skip?: number; limit?: number }) =>
  apiClient.get('/api/v1/hr/employees', { params });

export const getEmployee = (employeeId: number) =>
  apiClient.get(`/api/v1/hr/employees/${employeeId}`);

export const createEmployee = (data: EmployeeCreate) =>
  apiClient.post('/api/v1/hr/employees', data);

export const updateEmployee = (employeeId: number, data: Partial<Employee>) =>
  apiClient.patch(`/api/v1/hr/employees/${employeeId}`, data);

export const deleteEmployee = (employeeId: number) =>
  apiClient.delete(`/api/v1/hr/employees/${employeeId}`);

// Rate Card Management
export const getRateCards = (employeeId: number) => 
  apiClient.get(`/api/v1/hr/rate-cards/${employeeId}`);

export const createRateCard = (data: RateCardCreate) =>
  apiClient.post('/api/v1/hr/rate-cards', data);

// Attendance management
export const getAttendance = (params?: { employee_id?: number; date?: string; start_date?: string; end_date?: string; }) =>
  apiClient.get('/api/v1/hr/attendance', { params });

export const recordAttendance = (data: AttendanceRecordCreate) =>
  apiClient.post('/api/v1/hr/attendance', data);

export const getEmployeeAttendance = (employeeId: number, params: { start_date: string; end_date: string; }) =>
  apiClient.get(`/api/v1/hr/attendance/${employeeId}`, { params });

// Payroll Management
export const calculatePayout = (data: { employee_id: number; period_start: string; period_end: string; }) =>
  apiClient.post('/api/v1/hr/payouts/calculate', data);

export const getPendingPayouts = (limit: number = 50) =>
  apiClient.get('/api/v1/hr/payouts/pending', { params: { limit } });

export const getEmployeePayouts = (employeeId: number, limit: number = 10) =>
  apiClient.get(`/api/v1/hr/payouts/employee/${employeeId}`, { params: { limit } });

export const approvePayout = (payoutId: number, data: { approved: boolean; notes?: string }) =>
  apiClient.post(`/api/v1/hr/payouts/${payoutId}/approve`, data);

export const markPayoutPaid = (payoutId: number, payment_method: string, payment_reference: string) =>
  apiClient.post(`/api/v1/hr/payouts/${payoutId}/mark-paid?payment_method=${payment_method}&payment_reference=${payment_reference}`);


// Complaint management
export const getComplaints = (params?: { employee_id?: number; status?: string; }) =>
  apiClient.get('/api/v1/hr/complaints', { params });

export const recordComplaint = (data: ComplaintCreate) =>
  apiClient.post('/api/v1/hr/complaints', data);

export const getPendingComplaints = (limit: number = 50) =>
  apiClient.get('/api/v1/hr/complaints/pending', { params: { limit } });

export const investigateComplaint = (complaintId: number, data: { is_valid: boolean; investigation_notes: string; resolution?: string; }) =>
  apiClient.post(`/api/v1/hr/complaints/${complaintId}/investigate`, data);

// Reports
export const getPayrollSummary = (params: { period_start: string; period_end: string; }) =>
  apiClient.get('/api/v1/hr/reports/payroll-summary', { params });

export const getEmployeePerformance = (employeeId: number, params: { period_start: string; period_end: string; }) =>
  apiClient.get(`/api/v1/hr/reports/employee-performance/${employeeId}`, { params });


// Export Functions
export const exportEmployees = (format: 'csv' | 'excel' = 'csv') =>
  apiClient.get(`/api/v1/hr/employees/export?format=${format}`, { responseType: 'blob' });

export const exportAttendance = (params: { start_date: string; end_date: string; format?: 'csv' | 'excel'; }) =>
  apiClient.get('/api/v1/hr/attendance/export', { params, responseType: 'blob' });

export const exportPayroll = (params: { period_start: string; period_end: string; format?: 'csv' | 'excel'; }) =>
  apiClient.get('/api/v1/hr/payouts/export', { params, responseType: 'blob' });
