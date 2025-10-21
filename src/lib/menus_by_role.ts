// ============================================================================
// FILE: src/lib/menus_by_role.ts
// ============================================================================
export const menusByRole: Record<string, any[]> = {
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Finance", path: "/finance", icon: "DollarSign" },
    { label: "Procurement", path: "/procurement", icon: "ShoppingCart" },
    { label: "HR", path: "/hr", icon: "Users" },
    { label: "Projects", path: "/projects", icon: "FolderKanban" },
    { label: "Tasks", path: "/tasks", icon: "ListTodo" },
    { label: "Inventory", path: "/inventory", icon: "Package" },
    { label: "Marketing", path: "/marketing", icon: "Megaphone" },
    { label: "Workflows", path: "/workflows", icon: "GitBranch" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  finance: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Finance", path: "/finance", icon: "DollarSign" },
    { label: "Projects", path: "/projects", icon: "FolderKanban" },
    { label: "Tasks", path: "/tasks", icon: "ListTodo" },
    { label: "Inventory", path: "/inventory", icon: "Package" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  hr: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "HR", path: "/hr", icon: "Users" },
    { label: "Attendance", path: "/hr/attendance", icon: "CalendarCheck" },
    { label: "Performance", path: "/performance", icon: "TrendingUp" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  technician: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Tasks", path: "/tasks", icon: "ClipboardCheck" },
    { label: "Attendance", path: "/technician/attendance", icon: "CalendarCheck" },
    { label: "Reports", path: "/technician/reports", icon: "BarChart3" },
    { label: "Performance", path: "/performance", icon: "TrendingUp" },
  ],

  marketing: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Campaigns", path: "/marketing", icon: "Megaphone" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  procurement: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Purchase Orders", path: "/procurement", icon: "ShoppingCart" },
    { label: "Projects", path: "/projects", icon: "FolderKanban" },
    { label: "Inventory", path: "/inventory", icon: "Package" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],
};
