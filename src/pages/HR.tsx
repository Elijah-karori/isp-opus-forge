import { NavLink, Outlet } from 'react-router-dom';
import { Users, Calendar, DollarSign, Flag, BarChart2, Briefcase, UserPlus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const navItems = [
  { name: 'Dashboard', href: '/hr', icon: Briefcase, exact: true },
  { name: 'Employees', href: '/hr/employees', icon: Users },
  { name: 'Attendance', href: '/hr/attendance', icon: Calendar },
  { name: 'Payouts', href: '/hr/payouts', icon: DollarSign },
  { name: 'Complaints', href: '/hr/complaints', icon: Flag },
  { name: 'Reports', href: '/hr/reports', icon: BarChart2 },
];

const HRDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,257</div>
          <p className="text-xs text-muted-foreground">+20% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">-5% from yesterday</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$120,234.56</div>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </CardContent>
      </Card>
    </div>
    <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
            <NavLink to="/hr/employees" className="bg-card p-4 rounded-lg flex items-center gap-4 hover:bg-muted transition-colors">
                <UserPlus className="h-6 w-6 text-primary" />
                <div>
                    <p className="font-semibold">New Employee</p>
                    <p className="text-sm text-muted-foreground">Onboard a new hire</p>
                </div>
            </NavLink>
            <NavLink to="/hr/payouts" className="bg-card p-4 rounded-lg flex items-center gap-4 hover:bg-muted transition-colors">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                    <p className="font-semibold">Process Payouts</p>
                    <p className="text-sm text-muted-foreground">Run monthly payroll</p>
                </div>
            </NavLink>
            <NavLink to="/hr/reports" className="bg-card p-4 rounded-lg flex items-center gap-4 hover:bg-muted transition-colors">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                    <p className="font-semibold">Generate Report</p>
                    <p className="text-sm text-muted-foreground">Create a new HR report</p>
                </div>
            </NavLink>
        </div>
    </div>
  </div>
);

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

export { HRPage, HRDashboard };
