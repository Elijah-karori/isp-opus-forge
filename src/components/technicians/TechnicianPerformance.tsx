// src/components/technicians/TechnicianPerformance.tsx
import { useQuery } from '@tanstack/react-query';
import { getTechnicianLeaderboard, getTechnicianPerformance } from '@/api/technicians';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  TrendingUp, 
  TrendingDown,
  Star,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function TechnicianPerformance() {
  const { data: leaderboard, isLoading } = useQuery<any>({
    queryKey: ['technician-leaderboard-detailed'],
    queryFn: () => getTechnicianLeaderboard({ limit: 20 }),
  });

  if (isLoading) {
    return <div>Loading performance data...</div>;
  }

  const leaderboardData = Array.isArray(leaderboard?.data) ? leaderboard.data : (Array.isArray(leaderboard) ? leaderboard : []);

  // Sample performance data for charts
  const performanceMetrics = [
    { name: 'Completion Rate', value: 94, change: +2.1 },
    { name: 'On-Time Rate', value: 88, change: +1.5 },
    { name: 'First Time Fix', value: 92, change: +0.8 },
    { name: 'Customer Rating', value: 4.7, change: +0.2 },
    { name: 'Cost Efficiency', value: 87, change: -1.2 },
  ];

  const monthlyPerformance = [
    { month: 'Jan', completion: 89, onTime: 85, satisfaction: 4.5 },
    { month: 'Feb', completion: 91, onTime: 87, satisfaction: 4.6 },
    { month: 'Mar', completion: 92, onTime: 88, satisfaction: 4.7 },
    { month: 'Apr', completion: 93, onTime: 89, satisfaction: 4.7 },
    { month: 'May', completion: 94, onTime: 90, satisfaction: 4.8 },
    { month: 'Jun', completion: 95, onTime: 91, satisfaction: 4.8 },
  ];

  const skillDistribution = [
    { name: 'Fiber Optics', value: 35 },
    { name: 'Networking', value: 25 },
    { name: 'Wireless', value: 20 },
    { name: 'Cabling', value: 15 },
    { name: 'Security', value: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {performanceMetrics.map((metric, index) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{metric.value}{metric.name.includes('Rating') ? '' : '%'}</div>
                  <div className="text-sm text-muted-foreground">{metric.name}</div>
                </div>
                <div className={`flex items-center gap-1 ${
                  metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Completion Rate"
                />
                <Line 
                  type="monotone" 
                  dataKey="onTime" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="On-Time Rate"
                />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  name="Satisfaction"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Skill Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={skillDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {skillDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Technician Performance Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>On-Time Rate</TableHead>
                <TableHead>FTF Rate</TableHead>
                <TableHead>Avg. Rating</TableHead>
                <TableHead>Tasks Completed</TableHead>
                <TableHead>Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((kpi: any, index) => (
                <TableRow key={kpi.id}>
                  <TableCell>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {kpi.technician?.full_name}
                    <div className="text-sm text-muted-foreground">
                      {kpi.technician?.certification_level}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${kpi.completion_rate}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{kpi.completion_rate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${kpi.on_time_rate}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{kpi.on_time_rate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${kpi.ftfr}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{kpi.ftfr}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{kpi.csat_score || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {kpi.tasks_completed} tasks
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-lg font-bold text-green-600">
                      {kpi.total_score}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
