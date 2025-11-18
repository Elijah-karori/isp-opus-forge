// src/lib/menus_by_role.ts
export const menusByRole: Record<string, any[]> = {
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Finance", path: "/finance", icon: "DollarSign" },
    { label: "Procurement", path: "/procurement", icon: "ShoppingCart" },
    { label: "HR", path: "/hr", icon: "Users" },
    { label: "Projects", path: "/projects", icon: "FolderKanban" },
    { label: "Tasks", path: "/tasks", icon: "ListTodo" },
    { label: "Inventory", path: "/inventory", icon: "Package" },
    { label: "Suppliers", path: "/suppliers", icon: "Building" },
    { label: "Price Monitoring", path: "/price-monitoring", icon: "TrendingDown" },
    { label: "Marketing", path: "/marketing", icon: "Megaphone" },
    { label: "Workflows", path: "/workflows", icon: "GitBranch" },
    { label: "Workflow Dashboard", path: "/workflow-dashboard", icon: "LayoutDashboard" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
    { label: "Users", path: "/users", icon: "UserCog" },
  ],

  finance: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Finance", path: "/finance", icon: "DollarSign" },
    { label: "Projects", path: "/projects", icon: "FolderKanban" },
    { label: "Tasks", path: "/tasks", icon: "ListTodo" },
    { label: "Inventory", path: "/inventory", icon: "Package" },
    { label: "Workflow Dashboard", path: "/workflow-dashboard", icon: "LayoutDashboard" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  hr: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "HR", path: "/hr", icon: "Users" },
    { label: "Attendance", path: "/hr/attendance", icon: "CalendarCheck" },
    { label: "Performance", path: "/performance", icon: "TrendingUp" },
    { label: "Workflow Dashboard", path: "/workflow-dashboard", icon: "LayoutDashboard" },
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
    { label: "Suppliers", path: "/suppliers", icon: "Building" },
    { label: "Price Monitoring", path: "/price-monitoring", icon: "TrendingDown" },
    { label: "Projects", path: "/projects", icon: "FolderKanban" },
    { label: "Inventory", path: "/inventory", icon: "Package" },
    { label: "Workflow Dashboard", path: "/workflow-dashboard", icon: "LayoutDashboard" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],

  project_manager: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "Projects", path: "/projects", icon: "FolderKanban" },
    { label: "Tasks", path: "/tasks", icon: "ListTodo" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
    { label: "Reports", path: "/reports", icon: "BarChart3" },
  ],

  lead_technician: [
    { label: "Dashboard", path: "/dashboard", icon: "Home" },
    { label: "My Team", path: "/technicians/team", icon: "Users" },
    { label: "Tasks", path: "/tasks", icon: "ClipboardCheck" },
    { label: "Approvals", path: "/approvals", icon: "CheckSquare" },
  ],
};
