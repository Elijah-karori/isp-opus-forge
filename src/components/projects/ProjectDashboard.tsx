// src/components/projects/ProjectDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/api/projects';
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
  Building,
  Home,
  Store,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ProjectDashboard() {
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  if (projectsLoading) {
    return <div>Loading dashboard data...</div>;
  }

  const projectList = Array.isArray(projects) ? projects : [];

  // Calculate stats from project data
  const totalRevenue = projectList.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalCost = projectList.reduce((sum, p) => sum + (p.actual_cost || 0), 0);
  const avgMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1) : '0';
  const activeTeams = projectList.filter(p => p.status === 'in_progress').length;

  // Sample data for charts
  const projectTypeData = [
    { name: 'Apartments', value: projectList.filter(p => p.project_type === 'apartment').length },
    { name: 'Single Homes', value: projectList.filter(p => p.project_type === 'single_home').length },
    { name: 'Commercial', value: projectList.filter(p => p.project_type === 'commercial').length },
  ];

  const statusData = [
    { name: 'Planning', value: projectList.filter(p => p.status === 'planning').length },
    { name: 'In Progress', value: projectList.filter(p => p.status === 'in_progress').length },
    { name: 'Completed', value: projectList.filter(p => p.status === 'completed').length },
    { name: 'On Hold', value: projectList.filter(p => p.status === 'on_hold').length },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 125000, cost: 98000 },
    { month: 'Feb', revenue: 143000, cost: 112000 },
    { month: 'Mar', revenue: 138000, cost: 105000 },
    { month: 'Apr', revenue: 156000, cost: 124000 },
    { month: 'May', revenue: 167000, cost: 132000 },
    { month: 'Jun', revenue: 174000, cost: 138000 },
  ];

  const recentProjects = projectList.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Project Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total project budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMargin}%</div>
            <p className="text-xs text-muted-foreground">
              Gross profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectList.length}</div>
            <p className="text-xs text-muted-foreground">
              All time projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTeams}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Project Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Project Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Cost */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue vs Cost Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0088FE"
                strokeWidth={2}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#FF8042"
                strokeWidth={2}
                name="Cost"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {project.project_type === 'apartment' && <Building className="h-6 w-6 text-blue-600" />}
                    {project.project_type === 'single_home' && <Home className="h-6 w-6 text-blue-600" />}
                    {project.project_type === 'commercial' && <Store className="h-6 w-6 text-blue-600" />}
                  </div>
                  <div>
                    <div className="font-semibold">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.customer_name} • {project.address}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    project.status === 'completed' ? 'default' :
                      project.status === 'in_progress' ? 'secondary' :
                        'outline'
                  }>
                    {project.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    Budget: ${project.budget?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
