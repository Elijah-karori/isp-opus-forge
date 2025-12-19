// =====================================================================
// FILE: src/api/rbac.ts
// RBAC (Role-Based Access Control) API Client
// =====================================================================

import { apiClient } from '@/lib/api';
import type {
    PermissionV2,
    PermissionCheckResponse,
    MyPermissionsResponse,
} from '@/types/api.types';

// =====================================================================
// TYPES
// =====================================================================

export interface PermissionsBatchResponse {
    [permission: string]: boolean;
}

export interface BatchPermissionCheckRequest {
    permissions: string[];
}

// Re-export types for convenience
export type { PermissionV2, PermissionCheckResponse, MyPermissionsResponse };

// =====================================================================
// RBAC API OPERATIONS
// =====================================================================

export const rbacApi = {
    /**
     * Check if current user has a specific permission
     * Example: permission = "project:create:all"
     */
    checkPermission: async (permission: string): Promise<PermissionCheckResponse> => {
        return apiClient.get<PermissionCheckResponse>('/rbac/check', {
            permission,
        });
    },

    /**
     * Check multiple permissions at once
     * Request body: { permissions: ["project:create:all", "task:read:assigned"] }
     */
    checkPermissionsBatch: async (
        permissions: string[]
    ): Promise<PermissionsBatchResponse> => {
        return apiClient.post<PermissionsBatchResponse>('/rbac/check-batch', {
            permissions,
        });
    },

    /**
     * Get all permissions for current user (including inherited from role hierarchy)
     */
    getMyPermissions: async (): Promise<MyPermissionsResponse> => {
        return apiClient.get<MyPermissionsResponse>('/rbac/my-permissions');
    },
};

export default rbacApi;
