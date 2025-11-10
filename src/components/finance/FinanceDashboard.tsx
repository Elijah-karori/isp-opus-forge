// src/components/finance/FinanceDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { getFinanceDashboardStats, getFinancialSummary } from '@/api/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function FinanceDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['finance-dashboard-stats'],
    queryFn: () => getFinanceDashboardStats(),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => getFinancialSummary(),
  });

  if (statsLoading || summaryLoading) {
    return <div>Loading...</div>;
  }

  const dashboardStats = stats?.data || {};
  const financialSummary = summary?.data || {};

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 125000, cost: 98000 },
    { month: 'Feb', revenue: 143000, cost: 112000 },
    { month: 'Mar', revenue: 138000, cost: 105000 },
    { month: 'Apr', revenue: 156000, cost: 124000 },
    { month: 'May', revenue: 167000, cost: 132000 },
    { month: 'Jun', revenue: 174000, cost: 138000 },
  ];

  const expenseByCategory = [
    { name: 'Materials', value: 45 },
    { name: 'Labor', value: 35 },
    { name: 'Equipment', value: 12 },
    { name: 'Overhead', value: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.margin_percent || '0'}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Project Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(financialSummary.total_cost / financialSummary.project_count) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">
              Of total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Project delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                <Bar dataKey="cost" fill="#FF8042" name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Financial Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Variance Approved', project: 'Apartment Complex Wiring', amount: -2450, date: '2 hours ago' },
              { action: 'Project Completed', project: 'Office Network Setup', amount: 15600, date: '1 day ago' },
              { action: 'Expense Submitted', project: 'Equipment Purchase', amount: -3200, date: '2 days ago' },
              { action: 'Budget Updated', project: 'Shopping Mall Installation', amount: 0, date: '3 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.amount > 0 ? 'bg-green-100 text-green-600' :
                    activity.amount < 0 ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.amount > 0 ? <TrendingUp className="h-4 w-4" /> :
                     activity.amount < 0 ? <TrendingDown className="h-4 w-4" /> :
                     <Package className="h-4 w-4" />
                    }
                  </div>
                  <div>
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">{activity.project}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    activity.amount > 0 ? 'text-green-600' :
                    activity.amount < 0 ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {activity.amount !== 0 ? `$${Math.abs(activity.amount).toLocaleString()}` : 'Updated'}
                  </div>
                  <div className="text-sm text-muted-foreground">{activity.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
