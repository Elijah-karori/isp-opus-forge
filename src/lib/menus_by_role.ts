// ============================================================================
// FILE: src/lib/menus_by_role.ts
// ============================================================================

export const menusByRole: Record<string, any[]> = {
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Projects", path: "/projects", icon: "FolderKanban" },
    { label: "Tasks", path: "/tasks", icon: "ListTodo" },
    { label: "Inventory", path: "/inventory", icon: "Package" },
    { label: "Suppliers", path: "/suppliers", icon: "Building" },
    { label: "Procurement", path: "/procurement", icon: "ShoppingCart" },
    { label: "Finance", path: "/finance", icon: "DollarSign" },
    { label: "HR", path: "/hr", icon: "Users" },
    { label: "Marketing", path: "/marketing", icon: "Megaphone" },
    { label: "Workflows", path: "/workflows", icon: "GitBranch" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
    { label: "Users", path: "/users", icon: "UserCog" },
    { label: "Reports", path: "/reports", icon: "BarChart3" },
  ],

  finance: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Projects", path: "/projects", icon: "FolderKanban" },
    { label: "Finance", path: "/finance", icon: "DollarSign" },
    { label: "Pending Variances", path: "/finance/variances", icon: "ClipboardList" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
    { label: "Reports", path: "/finance/reports", icon: "BarChart3" },
  ],

  hr: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Employees", path: "/hr/employees", icon: "Users" },
    { label: "Attendance", path: "/hr/attendance", icon: "CalendarCheck" },
    { label: "Payouts", path: "/hr/payouts", icon: "DollarSign" },
    { label: "Complaints", path: "/hr/complaints", icon: "AlertCircle" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
    { label: "Reports", path: "/hr/reports", icon: "TrendingUp" },
  ],

  technician: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Tasks", path: "/tasks", icon: "ClipboardCheck" },
    { label: "Attendance", path: "/technician/attendance", icon: "CalendarCheck" },
    { label: "Reports", path: "/technician/reports", icon: "FileBarChart" },
    { label: "Performance", path: "/technician/performance", icon: "TrendingUp" },
  ],

  marketing: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Campaigns", path: "/marketing/campaigns", icon: "Megaphone" },
    { label: "Leads", path: "/marketing/leads", icon: "Users" },
    { label: "Analytics", path: "/marketing/analytics", icon: "BarChart3" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  procurement: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Purchase Orders", path: "/procurement/purchases", icon: "ShoppingCart" },
    { label: "Suppliers", path: "/procurement/suppliers", icon: "Building" },
    { label: "Price Monitoring", path: "/procurement/price-monitoring", icon: "TrendingDown" },
    { label: "Inventory", path: "/inventory", icon: "Package" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],
};
