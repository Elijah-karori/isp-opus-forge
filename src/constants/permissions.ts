/**
 * RBAC v2 Permission Constants
 * 
 * Format: resource:action:scope
 * 
 * Scopes:
 * - ALL: All items
 * - OWN: Own items only
 * - DEPARTMENT: Department items
 * - TEAM: Team items
 * - ASSIGNED: Assigned items
 */

// ============================================================================
// PROJECTS
// ============================================================================
export const PROJECT_PERMISSIONS = {
    CREATE_ALL: 'project:create:all',
    READ_ALL: 'project:read:all',
    READ_OWN: 'project:read:own',
    READ_DEPARTMENT: 'project:read:department',
    UPDATE_ALL: 'project:update:all',
    UPDATE_OWN: 'project:update:own',
    DELETE_ALL: 'project:delete:all',
    APPROVE_ALL: 'project:approve:all',
    MANAGE_BUDGET: 'project:manage_budget:all',
    VIEW_FINANCIALS: 'project:view_financials:all',
} as const;

// ============================================================================
// TASKS
// ============================================================================
export const TASK_PERMISSIONS = {
    CREATE_ALL: 'task:create:all',
    READ_ALL: 'task:read:all',
    READ_ASSIGNED: 'task:read:assigned',
    READ_DEPARTMENT: 'task:read:department',
    UPDATE_ALL: 'task:update:all',
    UPDATE_ASSIGNED: 'task:update:assigned',
    DELETE_ALL: 'task:delete:all',
    ASSIGN_ALL: 'task:assign:all',
    ASSIGN_DEPARTMENT: 'task:assign:department',
    COMPLETE_ASSIGNED: 'task:complete:assigned',
    APPROVE_ALL: 'task:approve:all',
} as const;

// ============================================================================
// INVOICES
// ============================================================================
export const INVOICE_PERMISSIONS = {
    CREATE_ALL: 'invoice:create:all',
    READ_ALL: 'invoice:read:all',
    READ_DEPARTMENT: 'invoice:read:department',
    UPDATE_ALL: 'invoice:update:all',
    DELETE_ALL: 'invoice:delete:all',
    APPROVE_ALL: 'invoice:approve:all',
    PROCESS_PAYMENT: 'invoice:process_payment:all',
    SEND_ALL: 'invoice:send:all',
} as const;

// ============================================================================
// FINANCE
// ============================================================================
export const FINANCE_PERMISSIONS = {
    // Budgets
    CREATE_BUDGET: 'budget:create:all',
    READ_BUDGET: 'budget:read:all',
    UPDATE_BUDGET: 'budget:update:all',
    APPROVE_BUDGET: 'budget:approve:all',

    // Variances
    READ_VARIANCE: 'variance:read:all',
    APPROVE_VARIANCE: 'variance:approve:all',

    // Payouts
    CREATE_PAYOUT: 'payout:create:all',
    READ_PAYOUT: 'payout:read:all',
    APPROVE_PAYOUT: 'payout:approve:all',
    PROCESS_PAYOUT: 'payout:process:all',

    // Reports
    VIEW_REPORTS: 'finance:view_reports:all',
    EXPORT_REPORTS: 'finance:export_reports:all',
} as const;

// ============================================================================
// HR (Human Resources)
// ============================================================================
export const HR_PERMISSIONS = {
    // Employees
    CREATE_EMPLOYEE: 'employee:create:all',
    READ_EMPLOYEE: 'employee:read:all',
    UPDATE_EMPLOYEE: 'employee:update:all',
    DELETE_EMPLOYEE: 'employee:delete:all',

    // Attendance
    RECORD_ATTENDANCE: 'attendance:record:all',
    READ_ATTENDANCE: 'attendance:read:all',
    APPROVE_ATTENDANCE: 'attendance:approve:all',

    // Leaves
    CREATE_LEAVE: 'leave:create:own',
    READ_LEAVE: 'leave:read:all',
    APPROVE_LEAVE: 'leave:approve:all',

    // Complaints
    READ_COMPLAINT: 'complaint:read:all',
    INVESTIGATE_COMPLAINT: 'complaint:investigate:all',
    RESOLVE_COMPLAINT: 'complaint:resolve:all',

    // Payroll
    VIEW_PAYROLL: 'payroll:read:all',
    PROCESS_PAYROLL: 'payroll:process:all',
} as const;

// ============================================================================
// WORKFLOWS
// ============================================================================
export const WORKFLOW_PERMISSIONS = {
    CREATE_ALL: 'workflow:create:all',
    READ_ALL: 'workflow:read:all',
    UPDATE_ALL: 'workflow:update:all',
    DELETE_ALL: 'workflow:delete:all',
    APPROVE_INSTANCE: 'workflow:approve:all',
    REJECT_INSTANCE: 'workflow:reject:all',
    DESIGNER_ACCESS: 'workflow:designer:all',
    PUBLISH_ALL: 'workflow:publish:all',
} as const;

// ============================================================================
// PROCUREMENT & INVENTORY
// ============================================================================
export const PROCUREMENT_PERMISSIONS = {
    // Products
    CREATE_PRODUCT: 'product:create:all',
    READ_PRODUCT: 'product:read:all',
    UPDATE_PRODUCT: 'product:update:all',
    DELETE_PRODUCT: 'product:delete:all',

    // Purchase Orders
    CREATE_PO: 'purchase_order:create:all',
    READ_PO: 'purchase_order:read:all',
    APPROVE_PO: 'purchase_order:approve:all',

    // Suppliers
    CREATE_SUPPLIER: 'supplier:create:all',
    READ_SUPPLIER: 'supplier:read:all',
    UPDATE_SUPPLIER: 'supplier:update:all',

    // Inventory
    MANAGE_INVENTORY: 'inventory:manage:all',
    VIEW_INVENTORY: 'inventory:read:all',
    ADJUST_INVENTORY: 'inventory:adjust:all',
} as const;

// ============================================================================
// USERS & ROLES
// ============================================================================
export const USER_PERMISSIONS = {
    CREATE_ALL: 'user:create:all',
    READ_ALL: 'user:read:all',
    UPDATE_ALL: 'user:update:all',
    DELETE_ALL: 'user:delete:all',
    ASSIGN_ROLE: 'user:assign_role:all',
    MANAGE_PERMISSIONS: 'user:manage_permissions:all',
} as const;

// ============================================================================
// SYSTEM & ADMIN
// ============================================================================
export const SYSTEM_PERMISSIONS = {
    ADMIN_ALL: 'system:admin:all',
    AUDIT_ALL: 'system:audit:all',
    SETTINGS_ALL: 'system:settings:all',
    BACKUP_ALL: 'system:backup:all',
    LOGS_ALL: 'system:logs:all',
} as const;

// ============================================================================
// MARKETING
// ============================================================================
export const MARKETING_PERMISSIONS = {
    CREATE_CAMPAIGN: 'campaign:create:all',
    READ_CAMPAIGN: 'campaign:read:all',
    UPDATE_CAMPAIGN: 'campaign:update:all',
    DELETE_CAMPAIGN: 'campaign:delete:all',
    MANAGE_LEADS: 'lead:manage:all',
    VIEW_ANALYTICS: 'marketing:analytics:all',
} as const;

// ============================================================================
// TECHNICIANS
// ============================================================================
export const TECHNICIAN_PERMISSIONS = {
    VIEW_TASKS: 'technician:view_tasks:assigned',
    UPDATE_TASKS: 'technician:update_tasks:assigned',
    VIEW_TOOLS: 'technician:view_tools:all',
    RECORD_ATTENDANCE: 'technician:record_attendance:own',
    VIEW_PERFORMANCE: 'technician:view_performance:own',
} as const;

// ============================================================================
// DASHBOARD
// ============================================================================
export const DASHBOARD_PERMISSIONS = {
    VIEW_ALL: 'dashboard:view:all',
    VIEW_DEPARTMENT: 'dashboard:view:department',
    VIEW_OWN: 'dashboard:view:own',
} as const;

// ============================================================================
// COMBINED PERMISSIONS OBJECT
// ============================================================================
export const PERMISSIONS = {
    PROJECT: PROJECT_PERMISSIONS,
    TASK: TASK_PERMISSIONS,
    INVOICE: INVOICE_PERMISSIONS,
    FINANCE: FINANCE_PERMISSIONS,
    HR: HR_PERMISSIONS,
    WORKFLOW: WORKFLOW_PERMISSIONS,
    PROCUREMENT: PROCUREMENT_PERMISSIONS,
    USER: USER_PERMISSIONS,
    SYSTEM: SYSTEM_PERMISSIONS,
    MARKETING: MARKETING_PERMISSIONS,
    TECHNICIAN: TECHNICIAN_PERMISSIONS,
    DASHBOARD: DASHBOARD_PERMISSIONS,
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================
export type Permission =
    | typeof PROJECT_PERMISSIONS[keyof typeof PROJECT_PERMISSIONS]
    | typeof TASK_PERMISSIONS[keyof typeof TASK_PERMISSIONS]
    | typeof INVOICE_PERMISSIONS[keyof typeof INVOICE_PERMISSIONS]
    | typeof FINANCE_PERMISSIONS[keyof typeof FINANCE_PERMISSIONS]
    | typeof HR_PERMISSIONS[keyof typeof HR_PERMISSIONS]
    | typeof WORKFLOW_PERMISSIONS[keyof typeof WORKFLOW_PERMISSIONS]
    | typeof PROCUREMENT_PERMISSIONS[keyof typeof PROCUREMENT_PERMISSIONS]
    | typeof USER_PERMISSIONS[keyof typeof USER_PERMISSIONS]
    | typeof SYSTEM_PERMISSIONS[keyof typeof SYSTEM_PERMISSIONS]
    | typeof MARKETING_PERMISSIONS[keyof typeof MARKETING_PERMISSIONS]
    | typeof TECHNICIAN_PERMISSIONS[keyof typeof TECHNICIAN_PERMISSIONS]
    | typeof DASHBOARD_PERMISSIONS[keyof typeof DASHBOARD_PERMISSIONS];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all permissions as a flat array
 */
export const getAllPermissions = (): string[] => {
    return Object.values(PERMISSIONS).flatMap(category => Object.values(category));
};

/**
 * Check if a string is a valid permission
 */
export const isValidPermission = (permission: string): permission is Permission => {
    return getAllPermissions().includes(permission);
};

/**
 * Get permissions by resource type
 */
export const getPermissionsByResource = (resource: keyof typeof PERMISSIONS): readonly string[] => {
    return Object.values(PERMISSIONS[resource]);
};
