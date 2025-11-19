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

// API hooks based on the blueprint

/**
 * Fetch detailed performance KPIs for a technician.
 * @param technicianId The ID of the technician.
 * @param params Optional date range.
 */
export const getTechnicianPerformance = (technicianId: number, params?: { period_start?: string; period_end?: string }) => 
  apiClient.get<TechnicianKPI>(`/technicians/${technicianId}/performance`, { params });

/**
 * Fetch all customer reviews for a specific technician.
 * @param technicianId The ID of the technician.
 */
export const getCustomerSatisfactionReviews = (technicianId: number) => 
  apiClient.get<CustomerSatisfaction[]>(`/technicians/satisfaction?technician_id=${technicianId}`);

/**
 * Record customer satisfaction feedback for a task.
 * @param data The satisfaction data.
 */
export const recordCustomerSatisfaction = (data: { task_id: number; rating: number; feedback?: string }) => 
  apiClient.post('/technicians/satisfaction', data);

/**
 * Fetch the technician leaderboard.
 * @param params Optional query parameters like limit.
 */
export const getTechnicianLeaderboard = (params?: { limit?: number }) => 
  apiClient.get('/technicians/leaderboard', { params });

/**
 * Get a list of technicians.
 * @param params Optional parameters like active_only.
 */
export const getTechnicians = (params?: { active_only?: boolean }) =>
  apiClient.get('/technicians', { params });

/**
 * Get a technician's altitude level and permissions.
 * @param technicianId The ID of the technician.
 */
export const getTechnicianAltitude = (technicianId: number) =>
  apiClient.get(`/technicians/${technicianId}/altitude`);
