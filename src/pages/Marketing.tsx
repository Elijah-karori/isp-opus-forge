import { NavLink, Outlet } from 'react-router-dom';
import { Megaphone, Users, BarChart3, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Campaigns', href: '/marketing/campaigns', icon: Megaphone },
    { name: 'Leads', href: '/marketing/leads', icon: Users },
    { name: 'Analytics', href: '/marketing/analytics', icon: BarChart3 },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
];

const MarketingPage = () => {
  return (
    <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-6">
      <aside className="hidden md:flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight px-2">Marketing Menu</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/marketing'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary font-semibold'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MarketingPage;
