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
import { Button } from '@/components/ui/button';
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
      className={`${collapsed ? 'w-16' : 'w-72'} border-r border-white/10 bg-white/40 dark:bg-[#0f172a]/40 backdrop-blur-2xl transition-all duration-300`}
      collapsible="icon"
    >
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Icons.Layers className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">ISP Opus</h2>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Enterprise Forge</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="px-4">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="px-4 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 px-2">Main Navigation</SidebarGroupLabel>}

          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
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
                          <SidebarMenuButton className={`h-12 rounded-2xl transition-all duration-200 ${isActive || hasActiveChild ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}>
                            <Icon className={`h-5 w-5 ${isActive || hasActiveChild ? 'text-blue-500' : 'text-slate-500'}`} />
                            <span className="font-bold">{item.label}</span>
                            <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90 ${isActive || hasActiveChild ? 'text-blue-500' : 'text-slate-400'}`} />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-6 border-l border-slate-200 dark:border-slate-800 space-y-1 mt-1">
                            {item.children.map((child) => {
                              const ChildIcon = getIcon(child.icon);
                              return (
                                <SidebarMenuSubItem key={child.key || child.path}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink
                                      to={child.path}
                                      className="h-10 rounded-xl px-4 hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                                      activeClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                                    >
                                      <ChildIcon className="h-4 w-4" />
                                      <span className="text-sm">{child.label}</span>
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
                        className={`h-12 rounded-2xl px-4 transition-all duration-200 ${isActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}
                        activeClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border-r-4 border-blue-500"
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                        {!collapsed && <span className="font-bold">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-6">
        {!collapsed && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-widest mb-1">Support Plan</p>
            <p className="text-sm font-black dark:text-white">Premium Enterprise</p>
            <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-tighter mt-2">
              Upgrade Account <ChevronRight className="h-2 w-2 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Sidebar>
  );
}