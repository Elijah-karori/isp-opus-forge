import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/constants/permissions';

interface PermissionGateProps {
    /**
     * Single permission to check
     */
    permission?: string | Permission;

    /**
     * Check if user has ANY of these permissions
     */
    anyPermission?: (string | Permission)[];

    /**
     * Check if user has ALL of these permissions
     */
    allPermissions?: (string | Permission)[];

    /**
     * Fallback content to render if permission check fails
     */
    fallback?: React.ReactNode;

    /**
     * Content to render if permission check passes
     */
    children: React.ReactNode;
}

/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on user permissions.
 * Supports RBAC v2 permission checking with fallback to v1 role-based checks.
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="project:create:all">
 *   <CreateButton />
 * </PermissionGate>
 * 
 * @example
 * // Any permission (OR logic)
 * <PermissionGate anyPermission={["task:read:all", "task:read:assigned"]}>
 *   <TaskList />
 * </PermissionGate>
 * 
 * @example
 * // All permissions (AND logic)
 * <PermissionGate allPermissions={["invoice:create:all", "invoice:approve:all"]}>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * @example
 * // With fallback
 * <PermissionGate 
 *   permission="project:delete:all"
 *   fallback={<p>You don't have permission to delete projects</p>}
 * >
 *   <DeleteButton />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    permission,
    anyPermission,
    allPermissions,
    fallback = null,
    children
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

    let hasAccess = false;

    // Single permission check
    if (permission) {
        hasAccess = hasPermission(permission);
    }
    // Any permission check (OR logic)
    else if (anyPermission && anyPermission.length > 0) {
        hasAccess = hasAnyPermission(anyPermission);
    }
    // All permissions check (AND logic)
    else if (allPermissions && allPermissions.length > 0) {
        hasAccess = hasAllPermissions(allPermissions);
    }
    // No permission specified - render children by default
    else {
        hasAccess = true;
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;
