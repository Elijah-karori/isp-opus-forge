import { apiClient } from '@/lib/api';

// Based on OpenAPI spec
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

// Employee management
export const getEmployees = (params?: { department?: string; status?: string; skip?: number; limit?: number }) =>
  apiClient.get('/api/v1/hr/employees', { params });

export const getEmployee = (employeeId: number) =>
  apiClient.get(`/api/v1/hr/employees/${employeeId}`);

export const createEmployee = (data: Partial<Employee>) =>
  apiClient.post('/api/v1/hr/employees', data);

export const updateEmployee = (employeeId: number, data: Partial<Employee>) =>
  apiClient.patch(`/api/v1/hr/employees/${employeeId}`, data);

export const deleteEmployee = (employeeId: number) =>
  apiClient.delete(`/api/v1/hr/employees/${employeeId}`);


// Attendance management
export const getAttendance = (params?: { employee_id?: number; date?: string; start_date?: string; end_date?: string; }) =>
  apiClient.get('/api/v1/hr/attendance', { params });

export const recordAttendance = (data: AttendanceRecordCreate) =>
  apiClient.post('/api/v1/hr/attendance', data);

export const getEmployeeAttendance = (employeeId: number, params: { start_date: string; end_date: string; }) =>
  apiClient.get(`/api/v1/hr/attendance/${employeeId}`, { params });


// Complaint management
export const getComplaints = (params?: { employee_id?: number; status?: string; }) =>
  apiClient.get('/api/v1/hr/complaints', { params });

/**
 * Submits an HR complaint or support request.
 */
export const recordComplaint = (data: ComplaintCreate) =>
  apiClient.post('/api/v1/hr/complaints', data);

export const getPendingComplaints = (limit: number = 50) =>
  apiClient.get('/api/v1/hr/complaints/pending', { params: { limit } });

export const investigateComplaint = (complaintId: number, data: { is_valid: boolean; investigation_notes: string; resolution?: string; }) =>
  apiClient.post(`/api/v1/hr/complaints/${complaintId}/investigate`, data);

// Export Functions
export const exportEmployees = (format: 'csv' | 'excel' = 'csv') =>
  apiClient.get(`/api/v1/hr/employees/export?format=${format}`, { responseType: 'blob' });

export const exportAttendance = (params: { start_date: string; end_date: string; format?: 'csv' | 'excel'; }) =>
  apiClient.get('/api/v1/hr/attendance/export', { params, responseType: 'blob' });

export const exportPayroll = (params: { period_start: string; period_end: string; format?: 'csv' | 'excel'; }) =>
  apiClient.get('/api/v1/hr/payouts/export', { params, responseType: 'blob' });
