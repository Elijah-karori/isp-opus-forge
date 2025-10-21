import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { menusByRole } from "@/lib/menus_by_role";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ListTodo, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Home,
  BarChart3,
  CheckSquare,
  MessageSquare,
  Search
} from 'lucide-react';
import { useState } from 'react';

// Icon mapping for dynamic backend menus (by menu key)
const iconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  home: Home,
  projects: FolderKanban,
  tasks: ListTodo,
  'task-board': ClipboardList,
  checklist: CheckSquare,
  inventory: Package,
  performance: TrendingUp,
  reports: BarChart3,
  hr: Users,
  finance: DollarSign,
  marketing: MessageSquare,
  search: Search,
  attendance: ClipboardList,
};

export const Layout = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use dynamic menu items from backend (fetched via /api/v1/auth/me)
  //const menuItems = user?.menu_items || [];

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  export function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || "technician"; // fallback
  const menus = menusByRole[role] || [];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
            <h1 className="text-xl font-bold text-sidebar-foreground">ISP ERP</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3">
        {menus.map((item) => {
          const Icon = Icons[item.icon] || Icons.Circle;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
                {user?.roles && user.roles.length > 0 && (
                  <p className="text-xs text-sidebar-foreground/50 truncate capitalize mt-1">
                    {user.roles.join(', ')}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-sidebar-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
