import { apiClient } from '@/lib/api';

// TypeScript interfaces based on the blueprint
export interface TechnicianKPI {
  technician_id: number;
  tasks_assigned: number;
  tasks_completed: number;
  on_time_rate: number;
  csat_score: number;
  total_score: number;
  altitude_level: number;
  description: string;
}

export interface CustomerSatisfaction {
  id: number;
  task_id: number;
  technician_id: number;
  rating: number;
  feedback?: string;
  created_at: string;
}

export interface Technician {
  id: number;
  full_name: string;
  employee_code: string;
  is_active: boolean;
  designation?: string;
  specialization?: string;
  certification_level?: string;
  certifications?: string[];
}

// API functions - these return unwrapped data (apiClient already extracts response.data)
export const getTechnicianPerformance = (technicianId: number, params?: { period_start?: string; period_end?: string }) => 
  apiClient.getTechnicianPerformance(technicianId, params);

export const getCustomerSatisfactionReviews = (technicianId: number) => 
  apiClient.getCustomerSatisfaction({ technician_id: technicianId });

export const recordCustomerSatisfaction = (data: { task_id: number; rating: number; feedback?: string }) => 
  apiClient.recordCustomerSatisfaction(data);

export const getTechnicianLeaderboard = (params?: { limit?: number }) => 
  apiClient.getTechnicianLeaderboard(params);

export const getTechnicians = (params?: { active_only?: boolean }) =>
  apiClient.getTechnicians(params);

export const getTechnicianAltitude = (technicianId: number) =>
  apiClient.getTechnicianAltitude(technicianId);
