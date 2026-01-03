import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
}

export default function ProtectedRoute({
  children,
  roles,
  permission,
  anyPermission,
  allPermissions
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let isAuthorized = false;

  if (permission) {
    isAuthorized = hasPermission(permission);
  } else if (anyPermission && anyPermission.length > 0) {
    isAuthorized = hasAnyPermission(anyPermission);
  } else if (allPermissions && allPermissions.length > 0) {
    isAuthorized = hasAllPermissions(allPermissions);
  } else if (roles && roles.length > 0) {
    isAuthorized = roles.some(role => hasRole(role));
  } else {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
