import { NavLink, Outlet } from 'react-router-dom';
import { Users, Calendar, DollarSign, Flag, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Employees', href: '/hr', icon: Users, exact: true },
  { name: 'Attendance', href: '/hr/attendance', icon: Calendar },
  { name: 'Payouts', href: '/hr/payouts', icon: DollarSign },
  { name: 'Complaints', href: '/hr/complaints', icon: Flag },
  { name: 'Reports', href: '/hr/reports', icon: BarChart2 },
];

const HRPage = () => {
  return (
    <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight px-2">HR Menu</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.exact}
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

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HRPage;
