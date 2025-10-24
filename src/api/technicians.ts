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

export interface TechnicianCreate {
  user_id: number;
  specialization?: string;
  certifications?: string[];
  certification_level?: string;
  designation?: string;
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

export const getTechnicians = (params?: { active_only?: boolean }) =>
  axios.get("/technicians", { params });

export const getTechnician = (technicianId: number) =>
  axios.get(`/technicians/${technicianId}`);
  
export const createTechnician = (data: TechnicianCreate) =>
  axios.post("/technicians", data);

export const getTechnicianLeaderboard = (params?: { limit?: number }) => {
  return axios.get("/technicians/leaderboard", { params });
};

export const getTechnicianPerformance = (
  technicianId: number,
  params?: { period_start?: string; period_end?: string }
) => {
  return axios.get(`/technicians/${technicianId}/performance`, { params });
};

export const approveTaskCompletion = (
  taskId: number,
  data: { approved: boolean; notes?: string }
) => {
  return axios.post(`/technicians/tasks/${taskId}/approve`, data);
};

export const recordTechnicianSatisfaction = (data: {
  task_id: number;
  rating: number;
  feedback?: string;
}) => {
  return axios.post(`/technicians/satisfaction`, data);
};
