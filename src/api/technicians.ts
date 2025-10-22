// src/api/technicians.ts
import axios from "./axios";

export interface Technician {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  specialization?: string;
  certifications?: string[];
  certification_level?: string;
  designation?: string;
  employee_code?: string;
  rating?: number;
  total_tasks: number;
  completed_tasks: number;
  active_tasks: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TechnicianPerformance {
  technician_id: number;
  period_start: string;
  period_end: string;
  tasks_completed: number;
  tasks_assigned: number;
  avg_completion_time: number;
  customer_satisfaction: number;
  on_time_completion_rate: number;
  revenue_generated: number;
}

export interface AttendanceRecord {
  id: number;
  technician_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  check_in_location?: string;
  check_out_location?: string;
  notes?: string;
  hours_worked?: number;
  technician?: {
    id: number;
    full_name: string;
    employee_code?: string;
  };
  created_at: string;
}

export interface CustomerSatisfaction {
  id: number;
  task_id: number;
  technician_id: number;
  customer_id: number;
  rating: number;
  feedback?: string;
  created_at: string;
}

// Technician CRUD
export const getTechnicians = (params?: { 
  active_only?: boolean;
  specialization?: string;
  skip?: number;
  limit?: number;
}) => axios.get("/technicians", { params });

export const getTechnician = (technicianId: number) =>
  axios.get(`/technicians/${technicianId}`);

export const createTechnician = (data: Partial<Technician>) =>
  axios.post("/technicians", data);

export const updateTechnician = (technicianId: number, data: Partial<Technician>) =>
  axios.put(`/technicians/${technicianId}`, data);

export const deleteTechnician = (technicianId: number) =>
  axios.delete(`/technicians/${technicianId}`);

// Performance
export const getTechnicianPerformance = (technicianId: number, params?: {
  period_start?: string;
  period_end?: string;
}) => axios.get(`/technicians/${technicianId}/performance`, { params });

export const getTechnicianLeaderboard = (params?: {
  limit?: number;
  metric?: string;
}) => axios.get("/technicians/leaderboard", { params });

// Attendance
export const getAttendance = (params?: {
  technician_id?: number;
  date?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}) => axios.get("/technicians/attendance", { params });

export const recordAttendance = (data: {
  technician_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  check_in_location?: string;
  check_out_location?: string;
  notes?: string;
}) => axios.post("/technicians/attendance", data);

export const updateAttendance = (attendanceId: number, data: Partial<AttendanceRecord>) =>
  axios.put(`/technicians/attendance/${attendanceId}`, data);

// Customer Satisfaction
export const recordCustomerSatisfaction = (data: {
  task_id: number;
  technician_id: number;
  customer_id: number;
  rating: number;
  feedback?: string;
}) => axios.post("/technicians/satisfaction", data);

export const getCustomerSatisfactionReviews = (params?: {
  technician_id?: number;
  task_id?: number;
  min_rating?: number;
  limit?: number;
}) => axios.get("/technicians/satisfaction", { params });

// Task Approvals
export const approveTaskCompletion = (taskId: number, data: {
  approved: boolean;
  notes?: string;
}) => axios.post(`/technicians/tasks/${taskId}/approve`, data);

// Statistics
export const getTechnicianStats = (technicianId?: number) => {
  const url = technicianId 
    ? `/technicians/${technicianId}/stats`
    : "/technicians/stats";
  return axios.get(url);
};
