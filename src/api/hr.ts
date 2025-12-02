
import { apiClient } from '@/lib/api';

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
  check_out_location?: string;
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
  resolution?: string;
  status?: string;
  investigation_notes?: string;
}

export interface ComplaintCreate {
  employee_id: number;
  task_id?: number;
  complaint_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RateCardCreate {
  employee_id: number;
  engagement_type: EngagementType;
  base_rate: number | string;
  rate_unit: string;
  valid_from: string;
}

export interface RateCard extends RateCardCreate {
  id: number;
  created_at: string;
  updated_at?: string;
}

export interface Payout {
  id: number;
  employee_id: number;
  period_start: string;
  period_end: string;
  amount: number;
  net_amount?: number;
  status: PaymentStatus;
  approved_by?: number;
  approved_at?: string;
  paid_at?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  employee?: {
    full_name: string;
    employee_code: string;
  };
}

export interface PayrollSummary {
  period_start: string;
  period_end: string;
  total_payouts: number;
  total_amount: number;
  total_gross?: number;
  total_net?: number;
  by_status: Record<PaymentStatus, number>;
}

export interface EmployeePerformance {
  employee_id: number;
  period_start: string;
  period_end: string;
  tasks_completed: number;
  tasks_on_time: number;
  on_time_rate?: number;
  completion_rate?: number;
  average_rating: number;
  avg_rating?: number;
  total_hours: number;
}

// Employee management
export const getEmployees = (params?: { department?: string; status?: string; skip?: number; limit?: number }) =>
  apiClient.getEmployees(params);

export const getEmployee = (employeeId: number) =>
  apiClient.getEmployee(employeeId);

export const createEmployee = (data: any) => // Changed from EmployeeCreate to any to match usage
  apiClient.createEmployee(data);

export const updateEmployee = (employeeId: number, data: Partial<Employee>) =>
  apiClient.updateEmployee(employeeId, data);

export const deleteEmployee = (employeeId: number) =>
  apiClient.deleteEmployee(employeeId);

// Rate Card Management
export const getRateCards = (employeeId: number) => 
  apiClient.getRateCards(employeeId);

export const createRateCard = (data: RateCardCreate) =>
  apiClient.createRateCard(data);

// Attendance management
export const getAttendance = (params?: { employee_id?: number; date?: string; start_date?: string; end_date?: string; }) =>
  apiClient.getAttendance(params);

export const recordAttendance = (data: AttendanceRecordCreate) =>
  apiClient.recordAttendance(data);

export const getEmployeeAttendance = (employeeId: number, params: { start_date: string; end_date: string; }) =>
  apiClient.getEmployeeAttendance(employeeId, params);

// Payroll Management
export const calculatePayout = (data: { employee_id: number; period_start: string; period_end: string; }) =>
  apiClient.calculatePayout(data);

export const getPendingPayouts = (limit: number = 50) =>
  apiClient.getPendingPayouts({ limit });

export const getEmployeePayouts = (employeeId: number, limit: number = 10) =>
  apiClient.getEmployeePayouts(employeeId, limit);

export const approvePayout = (payoutId: number, data: { approved: boolean; notes?: string }) =>
  apiClient.approvePayout(payoutId, data);

export const markPayoutPaid = (payoutId: number, payment_method: string, payment_reference: string) =>
  apiClient.markPayoutPaid(payoutId, payment_method, payment_reference);


// Complaint management
export const getComplaints = (params?: { employee_id?: number; status?: string; }) =>
  apiClient.getComplaints(params);

export const recordComplaint = (data: ComplaintCreate) =>
  apiClient.recordComplaint(data);

export const getPendingComplaints = (limit: number = 50) =>
  apiClient.getPendingComplaints(limit);

export const investigateComplaint = (complaintId: number, data: { is_valid: boolean; investigation_notes: string; resolution?: string; }) =>
  apiClient.investigateComplaint(complaintId, data);

// Reports
export const getPayrollSummary = (params: { period_start: string; period_end: string; }) =>
  apiClient.getPayrollSummary(params);

export const getEmployeePerformance = (employeeId: number, params: { period_start: string; period_end: string; }) =>
  apiClient.getEmployeePerformance(employeeId, params);


// Export Functions
export const exportEmployees = (format: 'csv' | 'excel' = 'csv') =>
  apiClient.exportEmployees(format);

export const exportAttendance = (params: { start_date: string; end_date: string; format?: 'csv' | 'excel'; }) =>
  apiClient.exportAttendance(params);

export const exportPayroll = (params: { period_start: string; period_end: string; format?: 'csv' | 'excel'; }) =>
  apiClient.exportPayroll(params);

// ===========================================================================
// HR API OBJECT (for components that use object syntax)
// ===========================================================================
export const hrApi = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getRateCards,
  createRateCard,
  getAttendance,
  recordAttendance,
  getEmployeeAttendance,
  calculatePayout,
  getPendingPayouts,
  getEmployeePayouts,
  approvePayout,
  markPayoutPaid,
  getComplaints,
  recordComplaint,
  getPendingComplaints,
  investigateComplaint,
  getPayrollSummary,
  getEmployeePerformance,
  exportEmployees,
  exportAttendance,
  exportPayroll,
};
