import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, ListTodo, Package, Users, TrendingUp, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

const stats = [
  {
    title: 'Active Projects',
    value: '24',
    change: '+12%',
    icon: FolderKanban,
    color: 'text-primary',
  },
  {
    title: 'Open Tasks',
    value: '156',
    change: '+8%',
    icon: ListTodo,
    color: 'text-chart-3',
  },
  {
    title: 'Low Stock Items',
    value: '8',
    change: '-5%',
    icon: AlertTriangle,
    color: 'text-warning',
  },
  {
    title: 'Active Technicians',
    value: '42',
    change: '+3%',
    icon: Users,
    color: 'text-success',
  },
  {
    title: 'Pending Variances',
    value: '12',
    change: '+15%',
    icon: DollarSign,
    color: 'text-destructive',
  },
  {
    title: 'Completed Today',
    value: '28',
    change: '+22%',
    icon: CheckCircle,
    color: 'text-success',
  },
];

const recentActivity = [
  { id: 1, type: 'project', title: 'New fiber installation - Downtown', time: '5 min ago' },
  { id: 2, type: 'task', title: 'Router configuration completed', time: '12 min ago' },
  { id: 3, type: 'variance', title: 'BOM variance requires approval', time: '23 min ago' },
  { id: 4, type: 'inventory', title: 'Stock replenished: Cat6 cables', time: '1 hour ago' },
  { id: 5, type: 'employee', title: 'New technician onboarded', time: '2 hours ago' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your system overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-success' : 'text-muted-foreground'}`}>
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full rounded-lg border border-primary bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10">
              <div className="font-medium text-primary">Create New Project</div>
              <div className="text-xs text-muted-foreground">Start a new installation project</div>
            </button>
            <button className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50">
              <div className="font-medium">Assign Task</div>
              <div className="text-xs text-muted-foreground">Delegate work to technicians</div>
            </button>
            <button className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50">
              <div className="font-medium">Review Variances</div>
              <div className="text-xs text-muted-foreground">Approve pending BOM changes</div>
            </button>
            <button className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50">
              <div className="font-medium">Process Payouts</div>
              <div className="text-xs text-muted-foreground">Review employee payments</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
