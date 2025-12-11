import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export interface TechnicianKPI {
    technician_id: number;
    name?: string;
    points?: number;
    tasks_completed: number;
    average_rating: number;
    total_revenue_generated: number;
    efficiency_score: number;
    customer_satisfaction: number;
    complaints_count: number;
    period_start: string;
    period_end: string;
}

export interface CustomerSatisfaction {
    id: number;
    task_id: number;
    technician_id: number;
    rating: number;
    feedback?: string;
    created_at: string;
}

export const technicianApi = {
    getTechnicianPerformance: (technicianId: number, params?: { period_start?: string; period_end?: string; }) =>
        axios.get<TechnicianKPI>(`/technicians/${technicianId}/performance`, { params }),
    getLeaderboard: (params?: { period_start?: string; period_end?: string; limit?: number; }) =>
        axios.get<TechnicianKPI[]>('/technicians/leaderboard', { params }),
    recordSatisfaction: (data: { task_id: number; rating: number; feedback?: string; }) =>
        axios.post<CustomerSatisfaction>('/technicians/satisfaction', data),
    listSatisfaction: (params?: { technician_id?: number; task_id?: number; limit?: number; }) =>
        axios.get<CustomerSatisfaction[]>('/technicians/satisfaction', { params }),
    getTechnicianAltitude: (technicianId: number) => axios.get(`/technicians/${technicianId}/altitude`),
};

export default technicianApi;
