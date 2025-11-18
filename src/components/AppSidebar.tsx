import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { menusByRole } from '@/lib/menus_by_role';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  group?: string;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user } = useAuth();
  
  const userRole = user?.role || 'guest';
  const menuItems: MenuItem[] = menusByRole[userRole] || [];

  const getIcon = (iconName: string): LucideIcon => {
    return (Icons as any)[iconName] || Icons.Circle;
  };

  const groupedMenus = menuItems.reduce((acc, item) => {
    const group = item.group || 'Main';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <Sidebar
      className={collapsed ? 'w-14' : 'w-64'}
      collapsible="icon"
    >
      <SidebarContent>
        {Object.entries(groupedMenus).map(([groupName, items]) => {
          const hasActiveRoute = items.some(item => 
            location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          );

          return (
            <SidebarGroup key={groupName}>
              {!collapsed && <SidebarGroupLabel>{groupName}</SidebarGroupLabel>}
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = getIcon(item.icon);
                    
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.path} 
                            className="hover:bg-accent/50"
                            activeClassName="bg-accent text-accent-foreground font-medium"
                          >
                            <Icon className="h-4 w-4" />
                            {!collapsed && <span>{item.label}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
