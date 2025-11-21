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
  // Second priority: Check menu-based access if user has menus
  else if (user.menus && user.menus.length > 0) {
    isAuthorized = hasAccessToPath(currentPath);
    console.log('✅ Menu-based check:', isAuthorized);
  } 
  // Default: Allow access if no specific restrictions
  else {
    isAuthorized = true;
    console.log('✅ Default access granted');
  }

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
