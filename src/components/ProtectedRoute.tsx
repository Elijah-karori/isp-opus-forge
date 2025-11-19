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

  let isAuthorized = false;

  if (user.menus && user.menus.length > 0) {
    // If user has menus, access is determined by whether the path is in the menu.
    isAuthorized = hasAccessToPath(currentPath);
  } else if (roles && roles.length > 0) {
    // If no menus are available for the user, fall back to role-based check.
    isAuthorized = hasRole(roles);
  } else {
    // If no menus and no roles are specified for the route, assume default access.
    // For now, let's make this default to true to allow unconfigured routes.
    // This could be made stricter to `false` depending on security policy.
    isAuthorized = true; 
  }

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
