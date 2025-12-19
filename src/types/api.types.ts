// =====================================================================
// FILE: src/types/api.types.ts
// Centralized API types based on OpenAPI specification
// =====================================================================

// =====================================================================
// ENUMS
// =====================================================================

export enum ProjectStatus {
    PLANNING = 'planning',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    ON_HOLD = 'on_hold',
    CANCELLED = 'cancelled',
}

export enum TaskStatus {
    PENDING = 'pending',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export enum InfrastructureType {
    PPOE = 'ppoe',
    HOTSPOT = 'hotspot',
    FIBER = 'fiber',
    WIRELESS = 'wireless',
    HYBRID = 'hybrid',
    NETWORK_INFRASTRUCTURE = 'network_infrastructure',
}

export enum AssignedRole {
    TECH_LEAD = 'tech_lead',
    PROJECT_MANAGER = 'project_manager',
    TECHNICIAN = 'technician',
    CUSTOMER_SUPPORT = 'customer_support',
    MARKETING = 'marketing',
}

export enum BudgetCategory {
    LABOR = 'labor',
    MATERIALS = 'materials',
    EQUIPMENT = 'equipment',
    OVERHEAD = 'overhead',
    CONTINGENCY = 'contingency',
    OTHER = 'other',
}

export enum BudgetUsageType {
    CREDIT = 'credit',
    DEBIT = 'debit',
}

export enum BudgetUsageStatus {
    PENDING_APPROVAL = 'pending_approval',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum DealStage {
    PROSPECTING = 'prospecting',
    PROPOSAL = 'proposal',
    NEGOTIATION = 'negotiation',
    CLOSED_WON = 'closed_won',
    CLOSED_LOST = 'closed_lost',
}

export enum LeadStatus {
    NEW = 'new',
    CONTACTED = 'contacted',
    QUALIFIED = 'qualified',
    PROPOSAL = 'proposal',
    NEGOTIATION = 'negotiation',
    WON = 'won',
    LOST = 'lost',
}

export enum InteractionType {
    CALL = 'call',
    EMAIL = 'email',
    MEETING = 'meeting',
    NOTE = 'note',
    SITE_SURVEY = 'site_survey',
}

export enum ComplaintSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum EngagementType {
    FULL_TIME = 'full_time',
    PART_TIME = 'part_time',
    CONTRACT = 'contract',
    INTERN = 'intern',
}

// =====================================================================
// AUTH TYPES
// =====================================================================

export interface Token {
    access_token: string;
    token_type: string;
}

export interface UserCreate {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role_id?: number;
    department_id?: number;
    division_id?: number;
}

export interface UserUpdate {
    full_name?: string;
    email?: string;
    phone?: string;
    is_active?: boolean;
    role_id?: number;
    department_id?: number;
    division_id?: number;
}

export interface UserResponse {
    id: number;
    email: string;
    full_name: string;
    phone?: string;
    is_active: boolean;
    is_superuser: boolean;
    role_id?: number;
    department_id?: number;
    division_id?: number;
    created_at: string;
}

export interface UserOut {
    id: number;
    email: string;
    full_name: string;
    phone?: string;
    is_active: boolean;
    is_superuser: boolean;
    role?: string;
    role_v2?: RoleV2;
    permissions_v2?: PermissionV2[];
    department_id?: number;
    division_id?: number;
}

export interface UserListResponse {
    users: UserResponse[];
    total: number;
}

export interface RoleV2 {
    id: number;
    name: string;
    description?: string;
    level: number;
}

export interface PermissionV2 {
    name: string;
    resource: string;
    action: string;
    scope: string;
    description?: string;
}

// =====================================================================
// RBAC TYPES
// =====================================================================

export interface PermissionCheckResponse {
    permission: string;
    granted: boolean;
}

export interface BatchPermissionCheckRequest {
    permissions: string[];
}

export interface MyPermissionsResponse {
    permissions: PermissionV2[];
    count: number;
}

// =====================================================================
// PROJECT TYPES
// =====================================================================

export interface ProjectCreate {
    name: string;
    description?: string;
    status?: ProjectStatus;
    infrastructure_type: InfrastructureType;
    department_id?: number;
    division_id?: number;
    start_date?: string;
    end_date?: string;
    budget?: number;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    location?: string;
}

export interface ProjectUpdate {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    infrastructure_type?: InfrastructureType;
    start_date?: string;
    end_date?: string;
    budget?: number;
}

export interface ProjectOut {
    id: number;
    name: string;
    description?: string;
    status: ProjectStatus;
    infrastructure_type: InfrastructureType;
    department_id?: number;
    division_id?: number;
    start_date?: string;
    end_date?: string;
    budget?: string;
    customer_name?: string;
    created_at: string;
    updated_at?: string;
}

export interface MilestoneCreate {
    name: string;
    description?: string;
    due_date?: string;
    payment_percentage?: number;
}

export interface MilestoneUpdate {
    name?: string;
    description?: string;
    status?: string;
    completion_date?: string;
}

export interface MilestoneOut {
    id: number;
    project_id: number;
    name: string;
    description?: string;
    status: string;
    due_date?: string;
    completion_date?: string;
    payment_percentage?: string;
}

export interface ProjectBudgetCreate {
    total_amount: number;
    notes?: string;
}

export interface ProjectBudgetOut {
    id: number;
    project_id: number;
    total_amount: string;
    used_amount: string;
    remaining_amount: string;
    created_at: string;
}

export interface BudgetLineItemOut {
    id: number;
    category: BudgetCategory;
    description: string;
    quantity: string;
    unit_cost: string;
    total_cost: string;
    actual_cost: string;
}

export interface BudgetSummary {
    total_allocated: string;
    total_spent: string;
    remaining: string;
    percent_used: number;
    by_category: Record<string, any>;
}

// =====================================================================
// TASK TYPES
// =====================================================================

export interface TaskCreate {
    title: string;
    description?: string;
    project_id: number;
    assigned_role?: AssignedRole;
    assignee_id?: number;
    department_id?: number;
    priority?: TaskPriority;
    due_date?: string;
    estimated_hours?: number;
}

export interface TaskUpdate {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: number;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
}

export interface TaskOut {
    id: number;
    title: string;
    description?: string;
    project_id: number;
    status: TaskStatus;
    assigned_role?: AssignedRole;
    assignee_id?: number;
    department_id?: number;
    priority: TaskPriority;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    created_at: string;
    updated_at?: string;
}

export interface TaskAssignByRole {
    task_id: number;
    role: AssignedRole;
    department_id?: number;
}

export interface TaskHoursLog {
    hours: number;
    notes?: string;
}

export interface TaskWithDependencies extends TaskOut {
    dependencies: TaskDependency[];
    dependents: TaskDependency[];
}

export interface TaskDependency {
    id: number;
    task_id: number;
    depends_on_task_id: number;
    dependency_type: string;
}

// =====================================================================
// INVENTORY TYPES
// =====================================================================

export interface SupplierCreate {
    name: string;
    website?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
}

export interface Supplier {
    id: number;
    name: string;
    website?: string;
    contact_email?: string;
    contact_phone?: string;
    is_active: boolean;
    created_at: string;
}

export interface ProductCreate {
    name: string;
    sku: string;
    category?: string;
    description?: string;
    unit_price: number;
    stock_quantity?: number;
    reorder_point?: number;
    unit?: string;
    supplier_id: number;
}

export interface ProductUpdate {
    name?: string;
    sku?: string;
    category?: string;
    description?: string;
    unit_price?: number;
    stock_quantity?: number;
    reorder_point?: number;
    is_active?: boolean;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    category?: string;
    description?: string;
    unit_price: string;
    stock_quantity: number;
    reorder_point: number;
    unit: string;
    supplier_id: number;
    is_active: boolean;
    created_at: string;
}

export interface PriceHistory {
    id: number;
    product_id: number;
    old_price: string;
    new_price: string;
    price_change: string;
    price_change_percent: string;
    recorded_at: string;
}

export interface ScraperRun {
    id: number;
    supplier_id: number;
    status: string;
    products_found: number;
    products_updated: number;
    started_at: string;
    completed_at?: string;
}

// =====================================================================
// CRM TYPES
// =====================================================================

export interface LeadCreate {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    source?: string;
    rating?: number;
}

export interface LeadUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    status?: LeadStatus;
    rating?: number;
}

export interface LeadOut {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    source?: string;
    rating?: number;
    status: LeadStatus;
    assigned_to_id?: number;
    created_at: string;
}

export interface DealCreate {
    name: string;
    value?: number;
    probability?: number;
    stage?: DealStage;
    expected_close_date?: string;
    lead_id: number;
}

export interface DealOut {
    id: number;
    name: string;
    value: number;
    probability: number;
    stage: DealStage;
    expected_close_date?: string;
    lead_id: number;
    customer_id?: number;
    created_at: string;
}

export interface ActivityCreate {
    type: InteractionType;
    summary: string;
    details?: string;
    lead_id?: number;
    deal_id?: number;
    customer_id?: number;
}

export interface ActivityOut {
    id: number;
    type: InteractionType;
    summary: string;
    details?: string;
    performed_by_id: number;
    performed_at: string;
}

// =====================================================================
// MARKETING TYPES
// =====================================================================

export interface CampaignCreate {
    name: string;
    description?: string;
    target_leads?: number;
    budget?: number;
    start_date?: string;
    end_date?: string;
}

export interface MarketingLeadCreate {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    campaign_id?: number;
}

// =====================================================================
// HR TYPES
// =====================================================================

export interface EmployeeProfileCreate {
    user_id: number;
    role_id?: number;
    employee_code: string;
    engagement_type: EngagementType;
    department?: string;
    designation?: string;
    hire_date: string;
    contract_end_date?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    address?: string;
    bank_name?: string;
    bank_account?: string;
    tax_id?: string;
}

export interface EmployeeProfileResponse {
    id: number;
    user_id: number;
    role_id?: number;
    employee_code: string;
    engagement_type: EngagementType;
    department?: string;
    designation?: string;
    hire_date: string;
    is_active: boolean;
    quality_rating?: string;
}

export interface RateCardCreate {
    employee_id: number;
    task_type: string;
    rate_per_task: number;
    rate_per_hour?: number;
    effective_from: string;
    effective_to?: string;
}

export interface RateCardResponse {
    id: number;
    employee_id: number;
    task_type: string;
    rate_per_task: string;
    rate_per_hour?: string;
    is_active: boolean;
}

export interface PayoutCalculateRequest {
    employee_id: number;
    period_start: string;
    period_end: string;
}

export interface PayoutApproveRequest {
    approved: boolean;
    notes?: string;
}

export interface PayoutResponse {
    id: number;
    employee_id: number;
    period_start: string;
    period_end: string;
    gross_amount: string;
    deductions: string;
    net_amount: string;
    status: string;
    approved_by_id?: number;
    payment_method?: string;
    payment_reference?: string;
}

export interface ComplaintCreate {
    employee_id: number;
    task_id?: number;
    complaint_type: string;
    severity?: ComplaintSeverity;
    description: string;
    customer_name?: string;
    customer_phone?: string;
}

export interface ComplaintResponse {
    id: number;
    employee_id: number;
    task_id?: number;
    complaint_type: string;
    severity: ComplaintSeverity;
    description: string;
    is_valid?: boolean;
    deduction_amount?: string;
    reported_at: string;
}

export interface AttendanceRecordCreate {
    employee_id: number;
    date: string;
    check_in?: string;
    check_out?: string;
    status: string;
    hours_worked?: number;
    notes?: string;
}

export interface AttendanceRecordResponse {
    id: number;
    employee_id: number;
    date: string;
    check_in?: string;
    check_out?: string;
    status: string;
    hours_worked?: string;
}

// =====================================================================
// TECHNICIAN TYPES
// =====================================================================

export interface TechnicianKPI {
    technician_id: number;
    technician_name: string;
    tasks_completed: number;
    avg_completion_time: number;
    satisfaction_score: number;
    efficiency_rating: number;
    on_time_completion_rate: number;
}

export interface CustomerSatisfactionCreate {
    task_id: number;
    rating: number;
    feedback?: string;
}

export interface CustomerSatisfaction {
    id: number;
    task_id: number;
    technician_id: number;
    rating: number;
    feedback?: string;
    created_at: string;
}

// =====================================================================
// FINANCE TYPES
// =====================================================================

export interface FinancialAccountCreate {
    name: string;
    account_number: string;
    type: string;
    description?: string;
}

export interface FinancialAccount {
    id: number;
    name: string;
    account_number: string;
    type: string;
    description?: string;
    created_at: string;
}

export interface SubBudgetCreate {
    name: string;
    category: string;
    allocated_amount: number;
    description?: string;
}

export interface SubBudget {
    id: number;
    master_budget_id: number;
    name: string;
    category: string;
    allocated_amount: string;
    used_amount: string;
}

export interface BudgetUsageCreate {
    sub_budget_id: number;
    description?: string;
    amount: number;
    type: BudgetUsageType;
    transaction_date: string;
}

export interface BudgetUsage {
    id: number;
    sub_budget_id: number;
    description?: string;
    amount: string;
    type: BudgetUsageType;
    status: BudgetUsageStatus;
    transaction_date: string;
    created_at: string;
}

export interface BOMVarianceCreate {
    task_id: number;
    product_id: number;
    expected_qty: number;
    actual_qty: number;
    variance_qty: number;
    variance_cost: number;
    variance_percent: number;
    approval_notes?: string;
}

export interface BOMVarianceOut {
    id: number;
    task_id: number;
    product_id: number;
    expected_qty: number;
    actual_qty: number;
    variance_qty: number;
    variance_cost: string;
    variance_percent: string;
    approved: boolean;
    approver_id?: number;
    created_at: string;
    approved_at?: string;
}

export interface ProjectFinancialsOut {
    project_id: number;
    project_name: string;
    total_budget: string;
    total_spent: string;
    total_variance: string;
    variance_count: number;
    pending_approvals: number;
}

// =====================================================================
// M-PESA TYPES
// =====================================================================

export interface STKPushRequest {
    phone_number: string;
    amount: number;
    account_reference: string;
    transaction_desc?: string;
}

export interface C2BSimulateRequest {
    phone_number: string;
    amount: number;
    bill_ref_number: string;
}

export interface DynamicQRRequest {
    amount: number;
    merchant_name: string;
    ref_no: string;
    trx_code?: string;
}

export interface B2CRequest {
    phone_number: string;
    amount: number;
    remarks: string;
    occasion?: string;
}

export interface B2BRequest {
    amount: number;
    receiver_shortcode: string;
    account_reference: string;
}

export interface TaxRemittanceRequest {
    amount: number;
    payer_id: string;
    tax_type: string;
}

export interface RatibaRequest {
    phone_number: string;
    amount: number;
    start_date: string;
    end_date: string;
    frequency: string;
    account_reference: string;
}

export interface BankPaymentRequest {
    account_number: string;
    amount: number;
    currency?: string;
}

// =====================================================================
// WORKFLOW TYPES
// =====================================================================

export interface WorkflowGraphCreate {
    name: string;
    description?: string;
    entity_type: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

export interface WorkflowNode {
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
    data?: Record<string, any>;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

export interface WorkflowDefinitionRead {
    id: number;
    name: string;
    description?: string;
    entity_type: string;
    status: string;
    version: number;
    graph_data?: Record<string, any>;
    created_at: string;
    updated_at?: string;
}

export interface WorkflowInstanceCreate {
    workflow_id: number;
    entity_id: number;
    initiated_by?: number;
    context?: Record<string, any>;
}

export interface WorkflowInstanceRead {
    id: number;
    workflow_id: number;
    entity_id: number;
    status: string;
    current_step?: string;
    initiated_by?: number;
    context?: Record<string, any>;
    created_at: string;
    completed_at?: string;
}

// =====================================================================
// PROCUREMENT TYPES
// =====================================================================

export interface PurchaseOrderCreate {
    supplier_id: number;
    items: PurchaseOrderItem[];
    notes?: string;
    expected_delivery?: string;
}

export interface PurchaseOrderItem {
    product_id: number;
    quantity: number;
    unit_price: number;
}

export interface PurchaseOrderRead {
    id: number;
    supplier_id: number;
    status: string;
    total_amount: string;
    notes?: string;
    created_by_id: number;
    approved_by_id?: number;
    created_at: string;
}

export interface PurchaseCreate {
    supplier_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    notes?: string;
}

export interface PurchaseResponse {
    id: number;
    supplier_id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    status: string;
    created_at: string;
}

// =====================================================================
// FINANCIAL SERVICES TYPES
// =====================================================================

export interface BudgetLineItemCreate {
    category: BudgetCategory;
    description: string;
    quantity: number;
    unit_cost: number;
}

export interface BudgetAllocationRequest {
    project_id: number;
    line_items: BudgetLineItemCreate[];
    notes?: string;
}

export interface BudgetSummaryResponse {
    project_id: number;
    total_allocated: string;
    total_spent: string;
    variance: string;
    variance_percent: string;
    status: string;
    categories: Record<string, any>;
}

export interface InvoiceCreate {
    project_id: number;
    milestone_name: string;
    amount: number;
    due_date?: string;
}

export interface InvoiceResponse {
    id: number;
    invoice_number: string;
    project_id: number;
    customer_name?: string;
    amount: string;
    amount_paid: string;
    status: string;
    due_date?: string;
    payment_date?: string;
}

export interface PaymentProcessRequest {
    invoice_id: number;
    amount_paid: number;
    payment_method: string;
    payment_reference: string;
    payment_date?: string;
}

export interface ProfitabilityReportRequest {
    start_date: string;
    end_date: string;
}

export interface ProfitabilityReportResponse {
    period: { start_date: string; end_date: string };
    total_revenue: string;
    total_costs: string;
    gross_profit: string;
    gross_margin: string;
    by_infrastructure: Record<string, any>;
}

export interface InfrastructureProfitabilityResponse {
    infrastructure_profitability: Record<string, any>;
    most_profitable?: string;
    least_profitable?: string;
}

export interface BudgetAllocationRecommendation {
    total_budget: string;
    period_months: number;
    allocation: Record<string, string>;
}

export interface FinancialSnapshotResponse {
    generated_at: string;
    active_projects: Record<string, any>;
    monthly_performance: Record<string, any>;
    receivables: Record<string, any>;
    infrastructure_performance: Record<string, any>;
    top_infrastructure?: string;
}

export interface ProjectProfitabilityResponse {
    project_id: number;
    project_name: string;
    revenue: string;
    costs: string;
    profit: string;
    margin: string;
}

export interface ReconciliationRequest {
    start_date: string;
    end_date: string;
    account_ids?: number[];
}

export interface ReconciliationResponse {
    period: { start_date: string; end_date: string };
    accounts_reconciled: number;
    discrepancies: any[];
    status: string;
}

export interface SuccessResponse {
    success: boolean;
    message: string;
    data?: any;
}

// =====================================================================
// PROCUREMENT SERVICES TYPES
// =====================================================================

export interface ProductSearchResult {
    id: number;
    name: string;
    sku: string;
    category?: string;
    unit_price: string;
    stock_quantity: number;
    supplier_name?: string;
    supplier_id: number;
}

export interface PriceComparisonRequest {
    product_name: string;
    quantity?: number;
    min_stock?: number;
}

export interface PriceComparisonResponse {
    product_name: string;
    suppliers: Array<{
        supplier_id: number;
        supplier_name: string;
        unit_price: string;
        stock_available: number;
        rating?: number;
    }>;
    best_price?: { supplier_id: number; price: string };
}

export interface SmartPurchaseOrderRequest {
    product_id: number;
    quantity: number;
    requester_id: number;
    prefer_supplier_id?: number;
}

export interface PurchaseOrderResponse {
    id: number;
    supplier_id: number;
    status: string;
    total_amount: string;
    created_at: string;
}

export interface BulkProcurementRequest {
    items: Array<{ product_id: number; quantity: number }>;
    requester_id: number;
    optimize_by_supplier?: boolean;
}

export interface SpendingTrendsResponse {
    period_days: number;
    total_spend: string;
    trends: Array<{
        group: string;
        amount: string;
        percentage: number;
    }>;
}

export interface InventoryReorderPrediction {
    product_id: number;
    product_name: string;
    current_stock: number;
    reorder_level: number;
    usage_rate_per_day: number;
    days_until_reorder: number;
    predicted_reorder_date: string;
    reorder_needed: boolean;
    recommended_order_qty: number;
}

export interface StockOptimizationResponse {
    product_id: number;
    current_stock: number;
    optimal_stock: number;
    safety_stock: number;
    reorder_point: number;
    economic_order_qty: number;
}

export interface InventoryTurnoverResponse {
    product_id: number;
    product_name: string;
    category?: string;
    current_stock: number;
    usage_period: number;
    turnover_ratio: number;
    annual_turnover: number;
    days_of_inventory: number;
    velocity: string;
}

export interface DeadStockItem {
    product_id: number;
    product_name: string;
    supplier?: string;
    quantity_in_stock: number;
    unit_value: number;
    total_value: number;
    days_since_last_use: number;
    last_used_date?: string;
    recommendation: string;
}

export interface AutoReorderRequest {
    product_id: number;
    requester_id: number;
    price_threshold_percent?: number;
}

// =====================================================================
// VALIDATION ERROR TYPES
// =====================================================================

export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface HTTPValidationError {
    detail: ValidationError[];
}
