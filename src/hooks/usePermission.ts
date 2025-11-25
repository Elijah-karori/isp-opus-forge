import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/constants/permissions';
import { rbacApi } from '@/api/rbac';

interface UsePermissionResult {
    /**
     * Whether the user has the permission(s)
     */
    hasPermission: boolean;

    /**
     * Loading state for async permission checks
     */
    loading: boolean;

    /**
     * Error if permission check failed
     */
    error: Error | null;
}

/**
 * usePermission Hook
 * 
 * Hook for checking user permissions with optional API verification.
 * Supports both local (fast) and API-based (authoritative) permission checks.
 * 
 * @param permission - Single permission or array of permissions to check
 * @param options - Configuration options
 * @returns Permission check result with loading and error states
 * 
 * @example
 * // Simple local check
 * const { hasPermission } = usePermission('project:create:all');
 * 
 * @example
 * // API verification
 * const { hasPermission, loading } = usePermission('invoice:approve:all', { 
 *   verifyWithAPI: true 
 * });
 * 
 * @example
 * // Check any permission
 * const { hasPermission } = usePermission(['task:read:all', 'task:read:assigned'], {
 *   mode: 'any'
 * });
 */
export function usePermission(
    permission: string | Permission | (string | Permission)[],
    options: {
        /**
         * Whether to verify permission with API (slower but authoritative)
         */
        verifyWithAPI?: boolean;

        /**
         * For array of permissions: 'any' (OR) or 'all' (AND)
         */
        mode?: 'any' | 'all';
    } = {}
): UsePermissionResult {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [apiResult, setApiResult] = useState<boolean | null>(null);

    const { verifyWithAPI = false, mode = 'any' } = options;

    // Local permission check (fast)
    const localCheck = (): boolean => {
        if (Array.isArray(permission)) {
            return mode === 'any'
                ? auth.hasAnyPermission(permission)
                : auth.hasAllPermissions(permission);
        }
        return auth.hasPermission(permission);
    };

    // API permission check (authoritative)
    useEffect(() => {
        if (!verifyWithAPI) return;

        const checkWithAPI = async () => {
            setLoading(true);
            setError(null);

            try {
                if (Array.isArray(permission)) {
                    // Batch check
                    const response = await rbacApi.checkPermissionsBatch(permission as string[]);
                    const results = Object.values(response);
                    const hasAccess = mode === 'any'
                        ? results.some(r => r === true)
                        : results.every(r => r === true);
                    setApiResult(hasAccess);
                } else {
                    // Single check
                    const response = await rbacApi.checkPermission(permission as string);
                    setApiResult(response.granted);
                }
            } catch (err) {
                setError(err as Error);
                console.error('Permission check API error:', err);
            } finally {
                setLoading(false);
            }
        };

        checkWithAPI();
    }, [permission, verifyWithAPI, mode]);

    // Return API result if available, otherwise local check
    const hasPermission = verifyWithAPI && apiResult !== null
        ? apiResult
        : localCheck();

    return {
        hasPermission,
        loading,
        error,
    };
}

/**
 * usePermissions Hook
 * 
 * Hook for checking multiple permissions at once.
 * Returns an object mapping each permission to its check result.
 * 
 * @param permissions - Array of permissions to check
 * @returns Object mapping permission names to boolean results
 * 
 * @example
 * const permissions = usePermissions([
 *   'project:create:all',
 *   'task:assign:all',
 *   'invoice:approve:all'
 * ]);
 * 
 * if (permissions['project:create:all']) {
 *   // User can create projects
 * }
 */
export function usePermissions(
    permissions: (string | Permission)[]
): Record<string, boolean> {
    const auth = useAuth();

    return permissions.reduce((acc, perm) => {
        acc[perm as string] = auth.hasPermission(perm);
        return acc;
    }, {} as Record<string, boolean>);
}
