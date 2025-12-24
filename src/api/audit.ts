
import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export type AuditLogAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'other';

export interface AuditLog {
    id: number;
    action: AuditLogAction;
    entity_type: string;
    entity_id: string;
    user_id: number;
    user_email: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
    user?: {
        email: string;
        full_name: string;
    };
}

export interface AuditLogFilter {
    action?: AuditLogAction;
    entity_type?: string;
    user_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export const getAuditLogs = (params?: AuditLogFilter) => {
    return axios.get<{ data: AuditLog[]; total: number }>('/audit-logs/logs', { params });
};

export const getAuditLog = (id: number) => {
    return axios.get<AuditLog>(`/audit-logs/${id}`);
};
