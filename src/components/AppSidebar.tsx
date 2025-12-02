import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { generateUserMenu } from '@/utils/menuBuilder';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { LucideIcon, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user } = useAuth();

  // Generate menus from RBAC v2 permissions using comprehensive menu structure
  const menuItems = user?.permissions_v2 && user.permissions_v2.length > 0
    ? generateUserMenu(user.permissions_v2)
    : [];

  const getIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return Icons.Circle;
    return (Icons as any)[iconName] || Icons.Circle;
  };

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Sidebar
      className={collapsed ? 'w-14' : 'w-64'}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Menu</SidebarGroupLabel>}

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = getIcon(item.icon);
                const hasChildren = item.children && item.children.length > 0;
                const isActive = isPathActive(item.path);
                const hasActiveChild = hasChildren && item.children?.some(child => isPathActive(child.path));

                if (hasChildren && !collapsed) {
                  return (
                    <Collapsible key={item.key || item.path} defaultOpen={hasActiveChild}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="hover:bg-accent/50">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const ChildIcon = getIcon(child.icon);
                              return (
                                <SidebarMenuSubItem key={child.key || child.path}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink
                                      to={child.path}
                                      className="hover:bg-accent/50"
                                      activeClassName="bg-accent text-accent-foreground font-medium"
                                    >
                                      <ChildIcon className="h-4 w-4" />
                                      <span>{child.label}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.key || item.path}>
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
      </SidebarContent>
    </Sidebar>
  );
}