// ============================================================================
// FILE: src/lib/menus_by_role.ts
// ============================================================================
export const menusByRole: Record<string, any[]> = {
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Finance", path: "/finance", icon: "DollarSign" },
    { label: "Procurement", path: "/procurement", icon: "ShoppingCart" },
    { label: "HR", path: "/hr", icon: "Users" },
    { label: "Technicians", path: "/technicians", icon: "Tool" },
    { label: "Inventory", path: "/inventory", icon: "Boxes" },
    { label: "Marketing", path: "/marketing", icon: "Megaphone" },
    { label: "Workflows", path: "/workflows", icon: "GitBranch" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  finance: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Finance", path: "/finance", icon: "DollarSign" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  hr: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Employees", path: "/hr/employees", icon: "User" },
    { label: "Attendance", path: "/hr/attendance", icon: "CalendarCheck" },
    { label: "Complaints", path: "/hr/complaints", icon: "AlertCircle" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  technician: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "My Tasks", path: "/tasks", icon: "ClipboardCheck" },
    { label: "Performance", path: "/technicians/performance", icon: "BarChart" },
  ],

  marketing: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Campaigns", path: "/marketing", icon: "Megaphone" },
    { label: "Leads", path: "/marketing/leads", icon: "Users" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  procurement: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Purchase Orders", path: "/procurement", icon: "ShoppingCart" },
    { label: "Suppliers", path: "/inventory/suppliers", icon: "Building" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],
};
