/**
 * Permission-based menu generation utility
 * Dynamically builds navigation menu based on user's RBAC v2 permissions
 */

export interface MenuItem {
    key: string;
    label: string;
    path: string;
    icon?: string;
    permission?: string;
    anyPermissions?: string[];
    children?: MenuItem[];
}

export interface UserPermission {
    name: string;
    resource: string;
    action: string;
    scope: string;
}

/**
 * Check if user has required permission
 */
function hasPermission(
    userPermissions: UserPermission[],
    requiredPermission?: string,
    anyPermissions?: string[]
): boolean {
    if (!requiredPermission && !anyPermissions) {
        return true; // No permission required
    }

    const permissionNames = userPermissions.map(p => p.name);

    if (requiredPermission) {
        return permissionNames.includes(requiredPermission);
    }

    if (anyPermissions && anyPermissions.length > 0) {
        return anyPermissions.some(p => permissionNames.includes(p));
    }

    return false;
}

/**
 * Filter menu items based on user permissions
 */
export function filterMenuByPermissions(
    menuItems: MenuItem[],
    userPermissions: UserPermission[]
): MenuItem[] {
    return menuItems
        .filter(item => {
            return hasPermission(userPermissions, item.permission, item.anyPermissions);
        })
        .map(item => {
            if (item.children) {
                return {
                    ...item,
                    children: filterMenuByPermissions(item.children, userPermissions),
                };
            }
            return item;
        })
        .filter(item => {
            // Remove parent items that have no visible children
            if (item.children) {
                return item.children.length > 0;
            }
            return true;
        });
}

/**
 * Complete menu structure for the ERP application
 */
export const COMPLETE_MENU: MenuItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        anyPermissions: ['dashboard:view:all', 'dashboard:view:own'],
    },
    {
        key: 'projects',
        label: 'Projects',
        path: '/projects',
        icon: 'FolderKanban',
        anyPermissions: ['project:read:all', 'project:read:own', 'project:read:department'],
        children: [
            {
                key: 'projects-list',
                label: 'All Projects',
                path: '/projects',
                anyPermissions: ['project:read:all', 'project:read:own', 'project:read:department'],
            },
            {
                key: 'projects-create',
                label: 'New Project',
                path: '/projects?action=create',
                permission: 'project:create:all',
            },
        ],
    },
    {
        key: 'tasks',
        label: 'Tasks',
        path: '/tasks',
        icon: 'ClipboardList',
        anyPermissions: ['task:read:all', 'task:read:assigned'],
        children: [
            {
                key: 'tasks-dashboard',
                label: 'Task Dashboard',
                path: '/tasks/dashboard',
                anyPermissions: ['task:read:all', 'task:read:assigned'],
            },
            {
                key: 'tasks-list',
                label: 'All Tasks',
                path: '/tasks',
                anyPermissions: ['task:read:all', 'task:read:assigned'],
            },
            {
                key: 'tasks-my-assignments',
                label: 'My Tasks',
                path: '/tasks?filter=my-assignments',
                anyPermissions: ['task:read:all', 'task:read:assigned'],
            },
        ],
    },
    {
        key: 'finance',
        label: 'Finance',
        path: '/finance',
        icon: 'DollarSign',
        anyPermissions: ['finance:read:all', 'finance:read:department'],
        children: [
            {
                key: 'finance-dashboard',
                label: 'Finance Dashboard',
                path: '/finance',
                anyPermissions: ['finance:read:all', 'finance:read:department'],
            },
            {
                key: 'finance-budgets',
                label: 'Budgets',
                path: '/finance/budgets',
                anyPermissions: ['finance:read:all', 'budget:read:all'],
            },
            {
                key: 'finance-variances',
                label: 'BOM Variances',
                path: '/finance/variances',
                anyPermissions: ['finance:read:all', 'variance:read:all'],
            },
            {
                key: 'finance-payouts',
                label: 'Payouts',
                path: '/finance/payouts',
                anyPermissions: ['finance:read:all', 'payout:read:all'],
            },
            {
                key: 'finance-reports',
                label: 'Reports',
                path: '/finance/reports',
                anyPermissions: ['finance:read:all', 'report:read:all'],
            },
        ],
    },
    {
        key: 'invoices',
        label: 'Invoices',
        path: '/invoices',
        icon: 'FileText',
        anyPermissions: ['invoice:read:all', 'invoice:read:department'],
        children: [
            {
                key: 'invoices-list',
                label: 'All Invoices',
                path: '/invoices',
                anyPermissions: ['invoice:read:all', 'invoice:read:department'],
            },
            {
                key: 'invoices-create',
                label: 'New Invoice',
                path: '/invoices/create',
                permission: 'invoice:create:all',
            },
        ],
    },
    {
        key: 'hr',
        label: 'Human Resources',
        path: '/hr',
        icon: 'Users',
        anyPermissions: ['hr:read:all', 'employee:read:all'],
        children: [
            {
                key: 'hr-dashboard',
                label: 'HR Dashboard',
                path: '/hr',
                anyPermissions: ['hr:read:all', 'employee:read:all'],
            },
            {
                key: 'hr-employees',
                label: 'Employees',
                path: '/hr/employees',
                anyPermissions: ['hr:read:all', 'employee:read:all'],
            },
            {
                key: 'hr-attendance',
                label: 'Attendance',
                path: '/hr/attendance',
                anyPermissions: ['hr:read:all', 'attendance:read:all'],
            },
            {
                key: 'hr-payouts',
                label: 'Payouts',
                path: '/hr/payouts',
                anyPermissions: ['hr:read:all', 'payout:read:all'],
            },
            {
                key: 'hr-complaints',
                label: 'Complaints',
                path: '/hr/complaints',
                anyPermissions: ['hr:read:all', 'complaint:read:all'],
            },
            {
                key: 'hr-reports',
                label: 'Reports',
                path: '/hr/reports',
                anyPermissions: ['hr:read:all', 'report:read:all'],
            },
        ],
    },
    {
        key: 'inventory',
        label: 'Inventory',
        path: '/inventory',
        icon: 'Package',
        anyPermissions: ['inventory:read:all', 'product:read:all'],
        children: [
            {
                key: 'inventory-products',
                label: 'Products',
                path: '/inventory',
                anyPermissions: ['inventory:read:all', 'product:read:all'],
            },
            {
                key: 'inventory-suppliers',
                label: 'Suppliers',
                path: '/suppliers',
                anyPermissions: ['supplier:read:all', 'inventory:read:all'],
            },
            {
                key: 'inventory-price-monitoring',
                label: 'Price Monitoring',
                path: '/price-monitoring',
                anyPermissions: ['inventory:read:all', 'product:read:all'],
            },
        ],
    },
    {
        key: 'procurement',
        label: 'Procurement',
        path: '/procurement',
        icon: 'ShoppingCart',
        anyPermissions: ['procurement:read:all', 'purchase_order:read:all'],
    },
    {
        key: 'technicians',
        label: 'Technicians',
        path: '/technicians',
        icon: 'Wrench',
        anyPermissions: ['technician:read:all', 'performance:read:all'],
        children: [
            {
                key: 'technicians-dashboard',
                label: 'Dashboard',
                path: '/technicians',
                anyPermissions: ['technician:read:all', 'performance:read:all'],
            },
            {
                key: 'technicians-tasks',
                label: 'Tasks',
                path: '/technicians/tasks',
                anyPermissions: ['task:read:all', 'task:read:assigned'],
            },
            {
                key: 'technicians-performance',
                label: 'Performance',
                path: '/performance',
                anyPermissions: ['performance:read:all', 'performance:read:own'],
            },
        ],
    },
    {
        key: 'marketing',
        label: 'Marketing',
        path: '/marketing',
        icon: 'TrendingUp',
        anyPermissions: ['marketing:read:all', 'campaign:read:all'],
        children: [
            {
                key: 'marketing-campaigns',
                label: 'Campaigns',
                path: '/marketing/campaigns',
                anyPermissions: ['marketing:read:all', 'campaign:read:all'],
            },
            {
                key: 'marketing-leads',
                label: 'Leads',
                path: '/marketing/leads',
                anyPermissions: ['marketing:read:all', 'lead:read:all'],
            },
            {
                key: 'marketing-analytics',
                label: 'Analytics',
                path: '/marketing/analytics',
                anyPermissions: ['marketing:read:all', 'report:read:all'],
            },
        ],
    },
    {
        key: 'workflows',
        label: 'Workflows',
        path: '/workflows',
        icon: 'GitBranch',
        anyPermissions: ['workflow:read:all', 'workflow:approve:all'],
        children: [
            {
                key: 'workflows-list',
                label: 'All Workflows',
                path: '/workflows',
                anyPermissions: ['workflow:read:all'],
            },
            {
                key: 'workflows-dashboard',
                label: 'Dashboard',
                path: '/workflow-dashboard',
                anyPermissions: ['workflow:read:all', 'workflow:approve:all'],
            },
            {
                key: 'workflows-designer',
                label: 'Designer',
                path: '/workflows/designer',
                permission: 'workflow:create:all',
            },
            {
                key: 'workflows-approvals',
                label: 'My Approvals',
                path: '/approvals',
                anyPermissions: ['workflow:approve:all', 'workflow:approve:department'],
            },
        ],
    },
    {
        key: 'admin',
        label: 'Administration',
        path: '/users',
        icon: 'Settings',
        anyPermissions: ['admin:full', 'user:read:all'],
        children: [
            {
                key: 'admin-users',
                label: 'Users',
                path: '/users',
                anyPermissions: ['admin:full', 'user:read:all'],
            },
            {
                key: 'admin-menu',
                label: 'Menu Management',
                path: '/admin/menu-management',
                permission: 'admin:full',
            },
        ],
    },
];

/**
 * Generate menu for current user
 */
export function generateUserMenu(userPermissions: UserPermission[]): MenuItem[] {
    return filterMenuByPermissions(COMPLETE_MENU, userPermissions);
}
