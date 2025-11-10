import { useAuth } from '@/contexts/AuthContext';

interface AccessControlRules {
  requiredRoles?: string[];
  requiredDepartmentId?: number;
  requiredDivisionId?: number;
  requiredCompanyId?: number;
}

export const useAccessControl = () => {
  const { user } = useAuth();

  const canAccess = (rules: AccessControlRules): boolean => {
    if (!user) {
      return false;
    }

    // Role-based check: If user has a role that grants access, return true immediately.
    if (rules.requiredRoles && rules.requiredRoles.length > 0) {
      // The user object from context has `role` (string) and `roles` (array)
      // We should check both for maximum flexibility.
      const userRoles = [user.role, ...(user.roles || [])];
      const hasRequiredRole = rules.requiredRoles.some(requiredRole => userRoles.includes(requiredRole));
      if (hasRequiredRole) {
        return true;
      }
    }

    // Attribute-based checks: If no role-based override, check attributes.
    // The logic is permissive: if a rule is not defined, it's not checked.

    if (rules.requiredDepartmentId) {
      if (user.department?.id !== rules.requiredDepartmentId) {
        return false;
      }
    }

    if (rules.requiredDivisionId) {
      if (user.division?.id !== rules.requiredDivisionId) {
        return false;
      }
    }

    if (rules.requiredCompanyId) {
      if (user.company?.id !== rules.requiredCompanyId) {
        return false;
      }
    }

    // If we passed all the attribute checks (or if no attribute rules were provided),
    // and we didn't get a positive role match, the final decision is based on attributes.
    // This means if only attribute rules are passed, they must all be met.
    // If no rules are passed at all, it defaults to true.
    return true;
  };

  return { canAccess, userRoles: [user?.role, ...(user?.roles || [])], currentUser: user };
};
