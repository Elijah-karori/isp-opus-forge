
import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export interface Notification {
    id: number;
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
    type: 'info' | 'success' | 'warning' | 'error';
    metadata?: Record<string, any>;
}

export const getNotifications = (params?: { unread_only?: boolean }) => {
    return axios.get<Notification[]>('/notifications', { params });
};

export const markAsRead = (id: number) => {
    return axios.put(`/notifications/${id}/read`);
};

export const getUnreadCount = () => {
    return axios.get<{ count: number }>('/notifications/unread/count');
};

export const markAllAsRead = () => {
    return axios.put('/notifications/mark-all-read');
};
