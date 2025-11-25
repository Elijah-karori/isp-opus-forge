import { apiClient } from '@/lib/api';

export interface PermissionV2 {
    name: string;
    resource: string;
    action: string;
    scope: string;
    description?: string;
}

export interface PermissionCheckResponse {
    permission: string;
    granted: boolean;
}

export interface PermissionsBatchResponse {
    [permission: string]: boolean;
}

export interface MyPermissionsResponse {
    permissions: PermissionV2[];
    count: number;
}

export const rbacApi = {
    /**
     * Check if current user has a specific permission
     */
    checkPermission: (permission: string) => {
        return apiClient.get<PermissionCheckResponse>('/api/v1/rbac/check', {
            params: { permission }
        });
    },

    /**
     * Check multiple permissions at once
     */
    checkPermissionsBatch: (permissions: string[]) => {
        return apiClient.post<PermissionsBatchResponse>('/api/v1/rbac/check-batch', permissions);
    },

    /**
     * Get all permissions for current user
     */
    getMyPermissions: () => {
        return apiClient.get<MyPermissionsResponse>('/api/v1/rbac/my-permissions');
    },
};
