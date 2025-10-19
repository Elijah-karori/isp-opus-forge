import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, TrendingUp, Package, Users, AlertCircle, CheckCircle2, DollarSign, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { isFinance, isHR, isAdmin } = usePermissions();

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects({ limit: 10 }),
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.getTasks({ limit: 10 }),
  });

  const { data: products } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => apiClient.getProducts({ low_stock: true, limit: 10 }),
  });

  const { data: variances } = useQuery({
    queryKey: ['pending-variances-count'],
    queryFn: () => apiClient.getPendingVariances({ limit: 5 }),
    enabled: isFinance() || isAdmin(),
  });

  const { data: payouts } = useQuery({
    queryKey: ['pending-payouts-count'],
    queryFn: () => apiClient.getPendingPayouts({ limit: 5 }),
    enabled: isHR() || isAdmin() || isFinance(),
  });

  const activeProjects = Array.isArray(projects) ? projects.filter((p: any) => p.status === 'active').length : 0;
  const openTasks = Array.isArray(tasks) ? tasks.filter((t: any) => t.status !== 'completed').length : 0;
  const lowStockItems = Array.isArray(products) ? products.length : 0;
  const activeTechnicians = 42;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.full_name || 'User'}</p>
        <p className="text-sm text-muted-foreground">Role: {user?.roles?.join(', ') || user?.role}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTasks}</div>
            <p className="text-xs text-muted-foreground">Pending completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTechnicians}</div>
            <p className="text-xs text-muted-foreground">On field assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific action cards */}
      {(isFinance() || isAdmin()) && variances && Array.isArray(variances) && variances.length > 0 && (
        <Card className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Pending Variance Approvals
            </CardTitle>
            <CardDescription>You have {variances.length} variances awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/finance">
              <Button variant="default">
                <DollarSign className="h-4 w-4 mr-2" />
                Review Variances
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {(isHR() || isAdmin() || isFinance()) && payouts && Array.isArray(payouts) && payouts.length > 0 && (
        <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              Pending Payout Approvals
            </CardTitle>
            <CardDescription>You have {payouts.length} payouts awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/hr">
              <Button variant="default">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Review Payouts
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Link to="/projects">
            <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start">
              <div className="font-medium">Manage Projects</div>
              <div className="text-xs text-muted-foreground">View and create projects</div>
            </Button>
          </Link>
          <Link to="/tasks">
            <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start">
              <div className="font-medium">Manage Tasks</div>
              <div className="text-xs text-muted-foreground">Assign and track work</div>
            </Button>
          </Link>
          <Link to="/inventory">
            <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start">
              <div className="font-medium">Check Inventory</div>
              <div className="text-xs text-muted-foreground">Monitor stock levels</div>
            </Button>
          </Link>
          <Link to="/performance">
            <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start">
              <div className="font-medium">View Performance</div>
              <div className="text-xs text-muted-foreground">Technician metrics</div>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
