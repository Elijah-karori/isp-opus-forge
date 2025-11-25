import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/constants/permissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;

  /**
   * Legacy: Required roles (v1 RBAC)
   * @deprecated Use permission or anyPermission instead
   */
  roles?: string[];

  /**
   * RBAC v2: Single required permission
   */
  permission?: string | Permission;

  /**
   * RBAC v2: User must have ANY of these permissions
   */
  anyPermission?: (string | Permission)[];

  /**
   * RBAC v2: User must have ALL of these permissions
   */
  allPermissions?: (string | Permission)[];
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on user authentication and permissions.
 * Supports both legacy role-based (v1) and new permission-based (v2) access control.
 * 
 * @example
 * // Legacy role-based (v1)
 * <ProtectedRoute roles={['admin', 'finance']}>
 *   <FinancePage />
 * </ProtectedRoute>
 * 
 * @example
 * // RBAC v2: Single permission
 * <ProtectedRoute permission="invoice:create:all">
 *   <CreateInvoicePage />
 * </ProtectedRoute>
 * 
 * @example
 * // RBAC v2: Any permission (OR logic)
 * <ProtectedRoute anyPermission={["project:read:all", "project:read:own"]}>
 *   <ProjectsPage />
 * </ProtectedRoute>
 * 
 * @example
 * // RBAC v2: All permissions (AND logic)
 * <ProtectedRoute allPermissions={["invoice:create:all", "invoice:approve:all"]}>
 *   <InvoiceAdminPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  roles,
  permission,
  anyPermission,
  allPermissions
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🔐 ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('🔐 ProtectedRoute check:', {
    currentPath,
    rbacVersion: user.rbac_version,
    requiredRoles: roles,
    requiredPermission: permission,
    requiredAnyPermission: anyPermission,
    requiredAllPermissions: allPermissions,
    userRole: user.role,
    userRoles: user.roles,
    userRolesV2: user.roles_v2,
  });

  let isAuthorized = false;

  // Priority 1: RBAC v2 Permission Checks
  if (permission) {
    isAuthorized = hasPermission(permission);
    console.log(`✅ Permission check (${permission}):`, isAuthorized);
  }
  else if (anyPermission && anyPermission.length > 0) {
    isAuthorized = hasAnyPermission(anyPermission);
    console.log(`✅ Any permission check (${anyPermission.join(', ')}):`, isAuthorized);
  }
  else if (allPermissions && allPermissions.length > 0) {
    isAuthorized = hasAllPermissions(allPermissions);
    console.log(`✅ All permissions check (${allPermissions.join(', ')}):`, isAuthorized);
  }
  // Priority 2: Legacy Role-based Check (v1)
  else if (roles && roles.length > 0) {
    isAuthorized = roles.some(role => hasRole(role));
    console.log(`✅ Role-based check (${roles.join(', ')}):`, isAuthorized);
  }
  // Priority 3: No restrictions - allow any authenticated user
  else {
    isAuthorized = true;
    console.log('✅ Authenticated user access granted (no restrictions)');
  }

  // Redirect to unauthorized page if access denied
  if (!isAuthorized) {
    console.log('❌ Access denied, redirecting to /unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
