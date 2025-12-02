import apiClient from './axios';

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
    rating: number; // 1-5
    feedback?: string;
    created_at: string;
}

export const technicianApi = {
    // Performance
    getTechnicianPerformance: (technicianId: number, params?: {
        period_start?: string;
        period_end?: string;
    }) =>
        apiClient.get<TechnicianKPI>(`/api/v1/technicians/${technicianId}/performance`, { params }),

    getLeaderboard: (params?: {
        period_start?: string;
        period_end?: string;
        limit?: number;
    }) =>
        apiClient.get<TechnicianKPI[]>('/api/v1/technicians/leaderboard', { params }),

    // Customer Satisfaction
    recordSatisfaction: (data: {
        task_id: number;
        rating: number;
        feedback?: string;
    }) =>
        apiClient.post<CustomerSatisfaction>('/api/v1/technicians/satisfaction', data),

    listSatisfaction: (params?: {
        technician_id?: number;
        task_id?: number;
        limit?: number;
    }) =>
        apiClient.get<CustomerSatisfaction[]>('/api/v1/technicians/satisfaction', { params }),

    // Altitude (permission level)
    getTechnicianAltitude: (technicianId: number) =>
        apiClient.get(`/api/v1/technicians/${technicianId}/altitude`),
};

export default technicianApi;
