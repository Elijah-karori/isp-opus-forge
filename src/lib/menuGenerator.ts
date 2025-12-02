// src/lib/menuGenerator.ts
import type { MenuItem } from '@/contexts/AuthContext';
import type { PermissionV2 } from '@/contexts/AuthContext';

/**
 * Menu Generation System based on RBAC v2 Permissions
 * 
 * This system automatically generates navigation menus by decoding user permissions.
 * Each menu item is associated with one or more permissions that grant access.
 */

interface MenuDefinition {
    label: string;
    path: string;
    icon?: string;
    requiredPermissions: string[]; // Any of these permissions grants access
    children?: MenuDefinition[];
    order?: number; // For menu ordering
}

/**
 * Master Menu Definitions
 * Define all possible menu items with their required permissions
 */
const MENU_DEFINITIONS: MenuDefinition[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        requiredPermissions: ['*'], // Everyone can access dashboard
        order: 1,
        children: [
            {
                label: 'Overview',
                path: '/dashboard',
                requiredPermissions: ['*'],
            },
            {
                label: 'Executive Dashboard',
                path: '/executive-dashboard',
                requiredPermissions: ['dashboard:view:all', 'finance:read:all'],
            },
        ],
    },

    // HR Module
    {
        label: 'HR',
        path: '/hr',
        icon: 'Users',
        requiredPermissions: ['hr:read:all', 'hr:read:department', 'employee:read:all'],
        order: 2,
        children: [
            {
                label: 'Dashboard',
                path: '/hr',
                requiredPermissions: ['hr:read:all', 'hr:read:department'],
            },
            {
                label: 'Employees',
                path: '/hr/employees',
                requiredPermissions: ['employee:read:all', 'employee:read:department'],
            },
            {
                label: 'Rate Cards',
                path: '/hr/rate-cards',
                requiredPermissions: ['hr:read:all', 'rate_card:read:all'],
            },
            {
                label: 'Attendance',
                path: '/hr/attendance',
                requiredPermissions: ['attendance:read:all', 'attendance:read:department'],
            },
            {
                label: 'Payouts',
                path: '/hr/payouts',
                requiredPermissions: ['payout:read:all', 'payout:read:department'],
            },
            {
                label: 'Complaints',
                path: '/hr/complaints',
                requiredPermissions: ['complaint:read:all', 'complaint:read:department'],
            },
        ],
    },

    // Finance Module
    {
        label: 'Finance',
        path: '/finance',
        icon: 'DollarSign',
        requiredPermissions: ['finance:read:all', 'finance:read:department', 'budget:read:all'],
        order: 3,
        children: [
            {
                label: 'Dashboard',
                path: '/finance',
                requiredPermissions: ['finance:read:all', 'finance:read:department'],
            },
            {
                label: 'Invoices',
                path: '/finance/invoices',
                requiredPermissions: ['finance:read:all', 'invoice:create:all'],
            },
            {
                label: 'Budgets',
                path: '/finance/budgets',
                requiredPermissions: ['budget:read:all', 'budget:read:department'],
            },
            {
                label: 'Variances',
                path: '/finance/variances',
                requiredPermissions: ['finance:read:all'],
            },
            {
                label: 'Payouts',
                path: '/finance/payouts',
                requiredPermissions: ['payout:read:all', 'payout:approve:all'],
            },
            {
                label: 'Reports',
                path: '/finance/reports',
                requiredPermissions: ['finance:read:all', 'report:read:all'],
            },
        ],
    },

    // Projects Module
    {
        label: 'Projects',
        path: '/projects',
        icon: 'FolderKanban',
        requiredPermissions: ['project:read:all', 'project:read:own', 'project:read:department'],
        order: 4,
    },

    // Tasks Module
    {
        label: 'Tasks',
        path: '/tasks',
        icon: 'CheckSquare',
        requiredPermissions: ['task:read:all', 'task:read:assigned', 'task:read:department'],
        order: 5,
        children: [
            {
                label: 'Dashboard',
                path: '/tasks/dashboard',
                requiredPermissions: ['dashboard:view:all', 'task:read:all'],
            },
            {
                label: 'All Tasks',
                path: '/tasks',
                requiredPermissions: ['task:read:all', 'task:read:assigned', 'task:read:department'],
            },
        ],
    },

    // Procurement Module
    {
        label: 'Procurement',
        path: '/procurement',
        icon: 'ShoppingCart',
        requiredPermissions: ['procurement:read:all', 'procurement:read:department', 'purchase:read:all'],
        order: 6,
        children: [
            {
                label: 'Dashboard',
                path: '/procurement',
                requiredPermissions: ['procurement:read:all', 'procurement:read:department'],
            },
            {
                label: 'Smart Search',
                path: '/procurement/search',
                requiredPermissions: ['procurement:read:all', 'product:read:all'],
            },
            {
                label: 'Suppliers',
                path: '/suppliers',
                requiredPermissions: ['supplier:read:all'],
            },
            {
                label: 'Price Monitoring',
                path: '/price-monitoring',
                requiredPermissions: ['procurement:read:all', 'price:read:all'],
            },
        ],
    },

    // Inventory Module
    {
        label: 'Inventory',
        path: '/inventory',
        icon: 'Package',
        requiredPermissions: ['inventory:read:all', 'inventory:read:department'],
        order: 7,
        children: [
            {
                label: 'Overview',
                path: '/inventory',
                requiredPermissions: ['inventory:read:all', 'inventory:read:department'],
            },
            {
                label: 'Optimization',
                path: '/inventory/optimization',
                requiredPermissions: ['inventory:read:all', 'inventory:optimize:all'],
            },
        ],
    },

    // Workflows Module
    {
        label: 'Workflows',
        path: '/workflows',
        icon: 'GitBranch',
        requiredPermissions: ['workflow:read:all', 'workflow:read:department'],
        order: 8,
        children: [
            {
                label: 'Workflows',
                path: '/workflows',
                requiredPermissions: ['workflow:read:all', 'workflow:read:department'],
            },
            {
                label: 'Designer',
                path: '/workflows/designer',
                requiredPermissions: ['workflow:create:all', 'workflow:update:all'],
            },
            {
                label: 'Dashboard',
                path: '/workflow-dashboard',
                requiredPermissions: ['workflow:read:all'],
            },
        ],
    },

    // Invoices Module
    {
        label: 'Invoices',
        path: '/invoices',
        icon: 'FileText',
        requiredPermissions: ['invoice:read:all', 'invoice:read:department'],
        order: 9,
    },

    // Marketing Module
    {
        label: 'Marketing',
        path: '/marketing',
        icon: 'TrendingUp',
        requiredPermissions: ['marketing:read:all', 'marketing:read:department'],
        order: 10,
        children: [
            {
                label: 'Dashboard',
                path: '/marketing',
                requiredPermissions: ['marketing:read:all'],
            },
            {
                label: 'Campaigns',
                path: '/marketing/campaigns',
                requiredPermissions: ['campaign:read:all', 'campaign:read:department'],
            },
            {
                label: 'Leads',
                path: '/marketing/leads',
                requiredPermissions: ['lead:read:all', 'lead:read:department'],
            },
        ],
    },

    // Technician Performance Module
    {
        label: 'Performance',
        path: '/technicians',
        icon: 'BarChart3',
        requiredPermissions: ['performance:read:all', 'performance:read:department'],
        order: 11,
        children: [
            {
                label: 'Dashboard',
                path: '/technicians/performance',
                requiredPermissions: ['performance:read:all'],
            },
            {
                label: 'Leaderboard',
                path: '/technicians/leaderboard',
                requiredPermissions: ['performance:read:all'],
            },
            {
                label: 'Satisfaction',
                path: '/technicians/satisfaction',
                requiredPermissions: ['performance:read:all'],
            },
        ],
    },

    // Approvals Module
    {
        label: 'Approvals',
        path: '/approvals',
        icon: 'CheckCircle',
        requiredPermissions: ['approval:read:all', 'approval:read:assigned'],
        order: 12,
    },

    // Admin Module
    {
        label: 'Admin',
        path: '/admin',
        icon: 'Settings',
        requiredPermissions: ['admin:read:all', 'user:read:all'],
        order: 100,
        children: [
            {
                label: 'Users',
                path: '/users',
                requiredPermissions: ['user:read:all'],
            },
            {
                label: 'Menu Management',
                path: '/admin/menu-management',
                requiredPermissions: ['admin:read:all', 'menu:update:all'],
            },
        ],
    },
];

/**
 * Check if user has any of the required permissions
 */
function hasAnyPermission(
    userPermissions: PermissionV2[],
    requiredPermissions: string[]
): boolean {
    // Special case: '*' means everyone can access
    if (requiredPermissions.includes('*')) {
        return true;
    }

    // Check if user has any of the required permissions
    return requiredPermissions.some(required => {
        return userPermissions.some(userPerm => userPerm.name === required);
    });
}

/**
 * Generate menu items based on user permissions
 */
export function generateMenuFromPermissions(permissions: PermissionV2[]): MenuItem[] {
    const menus: MenuItem[] = [];

    // Process each menu definition
    for (const menuDef of MENU_DEFINITIONS) {
        // Check if user has permission for this menu item
        if (hasAnyPermission(permissions, menuDef.requiredPermissions)) {
            const menuItem: MenuItem = {
                label: menuDef.label,
                path: menuDef.path,
                icon: menuDef.icon,
                permission: menuDef.requiredPermissions[0], // Use first permission for reference
            };

            // Process children if they exist
            if (menuDef.children && menuDef.children.length > 0) {
                const accessibleChildren: MenuItem[] = [];

                for (const childDef of menuDef.children) {
                    if (hasAnyPermission(permissions, childDef.requiredPermissions)) {
                        accessibleChildren.push({
                            label: childDef.label,
                            path: childDef.path,
                            icon: childDef.icon,
                            permission: childDef.requiredPermissions[0],
                        });
                    }
                }

                // Only add children if there are accessible sub-items
                if (accessibleChildren.length > 0) {
                    menuItem.children = accessibleChildren;
                }
            }

            menus.push(menuItem);
        }
    }

    // Sort by order
    return menus.sort((a, b) => {
        const orderA = MENU_DEFINITIONS.find(m => m.label === a.label)?.order || 999;
        const orderB = MENU_DEFINITIONS.find(m => m.label === b.label)?.order || 999;
        return orderA - orderB;
    });
}

/**
 * Get permission name from a permission object or string
 */
export function getPermissionName(permission: string | PermissionV2): string {
    if (typeof permission === 'string') {
        return permission;
    }
    return permission.name;
}
