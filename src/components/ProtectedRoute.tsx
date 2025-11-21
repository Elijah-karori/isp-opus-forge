import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; 
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { hasAccessToPath, hasRole } = usePermissions();
  const location = useLocation();
  const currentPath = location.pathname;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  console.log('🔐 ProtectedRoute check:', {
    currentPath,
    requiredRoles: roles,
    userRole: user.role,
    userRoles: user.roles,
    hasMenus: !!user.menus?.length
  });

  let isAuthorized = false;

  // First priority: Check role-based access if roles are specified for this route
  if (roles && roles.length > 0) {
    isAuthorized = hasRole(roles);
    console.log('✅ Role-based check:', isAuthorized);
  } 
  // Second priority: If no roles specified, allow any authenticated user
  // The fact that they have a user object means they passed authentication
  else {
    isAuthorized = true;
    console.log('✅ Authenticated user access granted (no role restrictions)');
  }

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
