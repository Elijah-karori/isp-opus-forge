import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.some(role => 
      user.roles?.includes(role) || user.role === role
    );
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return hasRole(roles);
  };

  const hasAllRoles = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.every(role => 
      user.roles?.includes(role) || user.role === role
    );
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isFinance = (): boolean => {
    return hasRole('finance');
  };

  const isTechnician = (): boolean => {
    return hasRole('technician');
  };

  const isHR = (): boolean => {
    return hasRole('hr');
  };

  const isProcurement = (): boolean => {
    return hasRole('procurement');
  };

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isFinance,
    isTechnician,
    isHR,
    isProcurement,
    user,
  };
};
