// =====================================================================
// FILE: src/api/index.ts
// Central API Export - All API modules in one place
// =====================================================================

// Auth & Core
export { apiClient } from '@/lib/api';

// RBAC
export { rbacApi } from './rbac';
export type {
    PermissionV2,
    PermissionCheckResponse,
    MyPermissionsResponse,
    PermissionsBatchResponse,
} from './rbac';

// Dashboards
export { dashboardsApi } from './dashboards';
export type {
    ProjectsOverviewResponse,
    TaskAllocationResponse,
    BudgetTrackingResponse,
    TeamWorkloadResponse,
    DepartmentOverviewResponse,
} from './dashboards';

// CRM (NEW)
export { crmApi } from './crm';

// Marketing
export { marketingApi } from './marketing';
export type { Campaign, CampaignPerformance } from './marketing';

// Integrations (NEW)
export { integrationsApi } from './integrations';
export type {
    ClickUpTeam,
    ClickUpSpace,
    ClickUpList,
    ClickUpWebhookResponse,
} from './integrations';

// Finance
export { financeApi } from './finance';
export type {
    BOMVariance,
    ProjectFinancials,
    FinancialSummary,
    Expense,
    MasterBudget,
    SubBudget,
    BudgetUsage,
    STKPushRequest,
    C2BSimulateRequest,
    DynamicQRRequest,
    B2CRequest,
    B2BRequest,
    TaxRemittanceRequest,
    RatibaRequest,
    BankPaymentRequest,
} from './finance';

// Financial Services (Advanced)
export { financialServicesApi } from './financialServices';

// Inventory
export { inventoryApi } from './inventory';
export type {
    Product,
    Supplier,
    PriceHistory,
    InventoryStats,
} from './inventory';

// Procurement
export * from './procurement';

// Procurement Services (Advanced)
export { procurementServicesApi, inventoryServicesApi } from './procurementServices';

// HR
export * from './hr';
export { hrServicesApi } from './hrServices';

// Technicians
export { technicianServicesApi } from './technicianServices';
export * from './technicians';

// Workflows
export * from './workflow';
export * from './workflows';

// Projects
export * from './projects';

// Tasks
export * from './tasks';

// Users
export * from './users';

// =====================================================================
// RE-EXPORT ALL TYPES FROM CENTRALIZED FILE
// =====================================================================
export * from '@/types/api.types';
