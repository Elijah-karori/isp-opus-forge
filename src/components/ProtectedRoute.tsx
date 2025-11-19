import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions'; // Import usePermissions
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { hasRole, hasAccessToPath } = usePermissions(); // Use hasRole and hasAccessToPath
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

  // Check role-based access
  let hasRoleAccess = true;
  if (roles && roles.length > 0) {
    hasRoleAccess = hasRole(roles); // Use hasRole with the array of roles
  }

  // Check menu-based access
  // A user must have a menu item for the current path, OR if no menus are provided for the user,
  // we assume menu access is not a restriction.
  // This logic ensures that if a user has menus, the current path must be among them,
  // but if the user has no menus (e.g., a new user or a user type without specific menu access control),
  // then menu access doesn't block them.
  let hasMenuAccess = true;
  if (user.menus && user.menus.length > 0) {
      hasMenuAccess = hasAccessToPath(currentPath);
  }
  // If user.menus is empty or undefined, hasMenuAccess remains true, meaning no menu restriction.


  if (!hasRoleAccess || !hasMenuAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
