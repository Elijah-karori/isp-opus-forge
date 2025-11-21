import { useAuth } from '@/hooks/useAuth';
import { MenuItem } from '@/contexts/AuthContext'; // Import MenuItem interface

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

  const isMarketing = (): boolean => {
    return hasRole('marketing');
  };

  const hasAccessToPath = (path: string): boolean => {
    if (!user || !user.menus) return false;

    console.log('🔍 Checking path access:', path, 'User menus:', user.menus);

    const checkMenu = (menuItems: MenuItem[]): boolean => {
      for (const item of menuItems) {
        console.log('🔍 Checking menu item:', item.path, 'against', path);
        if (item.path === path) {
          console.log('✅ Path match found!');
          return true;
        }
        if (item.children && checkMenu(item.children)) {
          return true;
        }
      }
      return false;
    };

    const result = checkMenu(user.menus);
    console.log('🔍 Final access result:', result);
    return result;
  };

  return { user, hasRole, hasAnyRole, hasAllRoles, isAdmin, isFinance, isTechnician, isHR, isMarketing, hasAccessToPath };
};
