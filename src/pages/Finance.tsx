import { NavLink, Outlet } from 'react-router-dom';
import { DollarSign, AlertTriangle, CreditCard, FolderKanban, FileBarChart, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: "Finance Overview", path: "/finance", icon: DollarSign, exact: true },
    { label: "BOM Variances", path: "/finance/variances", icon: AlertTriangle },
    { label: "Payouts", path: "/finance/payouts", icon: CreditCard },
    { label: "Projects", path: "/projects", icon: FolderKanban },
    { label: "Reports", path: "/finance/reports", icon: FileBarChart },
    { label: "Approvals", path: "/workflows/finance", icon: CheckSquare },
];

const FinancePage = () => {
  return (
    <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-6">
      <aside className="hidden md:flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight px-2">Finance Menu</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary font-semibold'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
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

export default FinancePage;
