import axios from "./axios";

export interface Employee {
  id: number;
  user_id: number;
  employee_code: string;
  department: string;
  designation: string;
  date_of_joining: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    email: string;
    full_name: string;
    phone?: string;
  };
}

export interface EmployeeCreate {
  user_id: number;
  employee_code: string;
  department: string;
  designation: string;
  date_of_joining: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  check_in: string;
  check_out?: string;
  status: 'present' | 'absent' | 'half_day' | 'on_leave';
  work_hours?: number;
  overtime_hours?: number;
  location?: string;
  notes?: string;
  created_at: string;
  employee?: Employee;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: 'casual' | 'sick' | 'earned' | 'unpaid';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  employee?: Employee;
  approver?: {
    id: number;
    full_name: string;
  };
}

export interface Complaint {
  id: number;
  employee_id: number;
  task_id?: number;
  complaint_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'closed';
  reported_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  employee?: Employee;
}

export interface RateCard {
  id: number;
  employee_id: number;
  engagement_type: 'full_time' | 'part_time' | 'contract' | 'freelance';
  base_rate: number;
  overtime_rate?: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
}

export interface Payout {
  id: number;
  employee_id: number;
  period_start: string;
  period_end: string;
  gross_amount: number;
  deductions: number;
  net_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paid_at?: string;
  notes?: string;
  created_at: string;
  employee?: Employee;
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
export const getEmployees = (params?: {
  department?: string;
  status?: string;
  skip?: number;
  limit?: number;
}) => axios.get("/hr/employees", { params });

export const getEmployee = (employeeId: number) =>
  axios.get(`/hr/employees/${employeeId}`);

export const createEmployee = (data: EmployeeCreate) =>
  axios.post("/hr/employees", data);

export const updateEmployee = (employeeId: number, data: Partial<EmployeeCreate>) =>
  axios.patch(`/hr/employees/${employeeId}`, data);

export const deleteEmployee = (employeeId: number) =>
  axios.delete(`/hr/employees/${employeeId}`);

// Attendance management
export const getAttendance = (params?: {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
}) => axios.get("/hr/attendance", { params });

export const recordAttendance = (data: {
  employee_id: number;
  date: string;
  check_in: string;
  check_out?: string;
  status: string;
  location?: string;
  notes?: string;
}) => axios.post("/hr/attendance", data);

export const updateAttendance = (attendanceId: number, data: Partial<AttendanceRecord>) =>
  axios.patch(`/hr/attendance/${attendanceId}`, data);

export const getEmployeeAttendance = (employeeId: number, params?: {
  start_date?: string;
  end_date?: string;
}) => axios.get(`/hr/attendance/employee/${employeeId}`, { params });

// Leave management
export const getLeaves = (params?: {
  employee_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}) => axios.get("/hr/leaves", { params });

export const createLeaveRequest = (data: {
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}) => axios.post("/hr/leaves", data);

export const approveLeave = (leaveId: number, data: {
  approved_by: number;
  notes?: string;
}) => axios.post(`/hr/leaves/${leaveId}/approve`, data);

export const rejectLeave = (leaveId: number, data: {
  approved_by: number;
  rejection_reason: string;
}) => axios.post(`/hr/leaves/${leaveId}/reject`, data);

// Complaint management
export const getComplaints = (params?: {
  employee_id?: number;
  status?: string;
  severity?: string;
}) => axios.get("/hr/complaints", { params });

export const createComplaint = (data: {
  employee_id: number;
  task_id?: number;
  complaint_type: string;
  description: string;
  severity: string;
}) => axios.post("/hr/complaints", data);

export const updateComplaint = (complaintId: number, data: {
  status?: string;
  resolution_notes?: string;
}) => axios.patch(`/hr/complaints/${complaintId}`, data);

export const getPendingComplaints = () =>
  axios.get("/hr/complaints/pending");

// Rate card management
export const getRateCards = (employeeId?: number) =>
  axios.get("/hr/rate-cards", { params: { employee_id: employeeId } });

export const createRateCard = (data: {
  employee_id: number;
  engagement_type: string;
  base_rate: number;
  overtime_rate?: number;
  effective_from: string;
}) => axios.post("/hr/rate-cards", data);

export const updateRateCard = (rateCardId: number, data: Partial<RateCard>) =>
  axios.patch(`/hr/rate-cards/${rateCardId}`, data);

// Payroll management
export const calculatePayout = (data: {
  employee_id: number;
  period_start: string;
  period_end: string;
}) => axios.post("/hr/payouts/calculate", data);

export const getPendingPayouts = () =>
  axios.get("/hr/payouts/pending");

export const approvePayout = (payoutId: number, data: {
  approved_by: number;
  notes?: string;
}) => axios.post(`/hr/payouts/${payoutId}/approve`, data);

export const markPayoutPaid = (payoutId: number) =>
  axios.post(`/hr/payouts/${payoutId}/mark-paid`);

// Reports
export const getPayrollSummary = (params: {
  period_start: string;
  period_end: string;
}) => axios.get("/hr/reports/payroll-summary", { params });

export const getEmployeePerformance = (employeeId: number, params?: {
  start_date?: string;
  end_date?: string;
}) => axios.get(`/hr/reports/employee-performance/${employeeId}`, { params });

export const getDepartmentStats = (department?: string) =>
  axios.get("/hr/reports/department-stats", { params: { department } });

export const getAttendanceReport = (params: {
  start_date: string;
  end_date: string;
  department?: string;
}) => axios.get("/hr/reports/attendance", { params });

export const getLeaveBalance = (employeeId: number) =>
  axios.get(`/hr/reports/leave-balance/${employeeId}`);

// Export functions
export const exportEmployees = (format: 'csv' | 'excel' = 'csv') =>
  axios.get(`/hr/employees/export?format=${format}`, { responseType: 'blob' });

export const exportAttendance = (params: {
  start_date: string;
  end_date: string;
  format?: 'csv' | 'excel';
}) => axios.get("/hr/attendance/export", { params, responseType: 'blob' });

export const exportPayroll = (params: {
  period_start: string;
  period_end: string;
  format?: 'csv' | 'excel';
}) => axios.get("/hr/payouts/export", { params, responseType: 'blob' });
