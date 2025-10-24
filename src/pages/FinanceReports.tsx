import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Loader2,
  PieChart as PieChartIcon,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
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
  Line,
  Legend,
} from 'recharts';
import { getProjects } from '@/api/projects';
import {
  getFinancialSummary,
  getProfitLossReport,
  getBudgetVsActualReport,
  getVarianceHistory,
} from '@/api/finance';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const FinanceReports = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('summary');
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month');

  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial-summary', startDate, endDate],
    queryFn: () => getFinancialSummary({ start_date: startDate, end_date: endDate }),
  });

  const { data: profitLoss, isLoading: plLoading } = useQuery({
    queryKey: ['profit-loss', startDate, endDate, groupBy],
    queryFn: () =>
      getProfitLossReport({
        start_date: startDate,
        end_date: endDate,
        group_by: groupBy,
      }),
    enabled: selectedTab === 'profit-loss',
  });

  const { data: budgetVsActual, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget-vs-actual', selectedProject],
    queryFn: () => getBudgetVsActualReport(selectedProject !== 'all' ? parseInt(selectedProject) : undefined),
    enabled: selectedTab === 'budget',
  });

  const { data: varianceHistory, isLoading: varianceLoading } = useQuery({
    queryKey: ['variance-history', startDate, endDate, selectedProject],
    queryFn: () =>
      getVarianceHistory({
        start_date: startDate,
        end_date: endDate,
        project_id: selectedProject !== 'all' ? parseInt(selectedProject) : undefined,
        limit: 50,
      }),
    enabled: selectedTab === 'variances',
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects({ limit: 200 }),
  });

  const summary = financialSummary?.data || {};
  const plData = profitLoss?.data || [];
  const budgetData = budgetVsActual?.data || [];
  const variances = varianceHistory?.data || [];
  const projectList = Array.isArray(projects?.data) ? projects.data : [];

  const plChartData = Array.isArray(plData)
    ? plData.map((item: any) => ({
        period: item.period,
        revenue: item.revenue,
        cost: item.cost,
        profit: item.profit,
      }))
    : [];

  const expenseBreakdown = [
    { name: 'Materials', value: summary.material_cost || 0 },
    { name: 'Labor', value: summary.labor_cost || 0 },
    { name: 'Overhead', value: summary.overhead_cost || 0 },
    { name: 'Other', value: summary.other_cost || 0 },
  ];

  const budgetChartData = Array.isArray(budgetData)
    ? budgetData.map((item: any) => ({
        project: item.project_name,
        budget: item.budget,
        actual: item.actual_cost,
        variance: item.budget - item.actual_cost,
      }))
    : [];

  const handleExport = (reportType: string) => {
    toast({
      title: 'Export Started',
      description: `Generating ${reportType} report...`,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Finance Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive financial reports, P&L statements, and budget analysis
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="grid gap-2 flex-1">
          <Label>Start Date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="grid gap-2 flex-1">
          <Label>End Date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="profit-loss" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            P&L
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Budget Analysis
          </TabsTrigger>
          <TabsTrigger value="variances" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Variances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(summary.total_revenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.revenue_growth > 0 ? '+' : ''}
                  {(summary.revenue_growth || 0).toFixed(1)}% from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(summary.total_cost || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.cost_growth > 0 ? '+' : ''}
                  {(summary.cost_growth || 0).toFixed(1)}% from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(summary.gross_profit || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(summary.margin_percent || 0).toFixed(1)}% margin
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FileText className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.project_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.completed_projects || 0} completed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Operating Margin</div>
                      <div className="text-lg font-bold">
                        {(summary.operating_margin || 0).toFixed(1)}%
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">EBITDA</div>
                      <div className="text-lg font-bold">
                        ${(summary.ebitda || 0).toLocaleString()}
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Cash Flow</div>
                      <div className="text-lg font-bold">
                        ${(summary.cash_flow || 0).toLocaleString()}
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">ROI</div>
                      <div className="text-lg font-bold">{(summary.roi || 0).toFixed(1)}%</div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20"
                  onClick={() => handleExport('Financial Summary')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Download className="h-5 w-5" />
                    <span className="text-sm">Export Summary</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20"
                  onClick={() => handleExport('Balance Sheet')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Balance Sheet</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20"
                  onClick={() => handleExport('Cash Flow')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">Cash Flow</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20"
                  onClick={() => handleExport('Tax Report')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Tax Report</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-6">
          <div className="flex gap-4">
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => handleExport('P&L Report')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {plLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={plChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
                    <Line type="monotone" dataKey="cost" stroke="#ef4444" name="Cost" />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed P&L Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Gross Profit</TableHead>
                    <TableHead>Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(plData) && plData.length > 0 ? (
                    plData.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.period}</TableCell>
                        <TableCell className="text-green-600">
                          ${item.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-red-600">
                          ${item.cost.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold">
                          ${item.profit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.margin > 20 ? 'default' : 'secondary'}
                          >
                            {item.margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No P&L data available for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="flex gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectList.map((project: any) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleExport('Budget Report')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={budgetChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="budget" fill="#0088FE" name="Budget" />
                    <Bar dataKey="actual" fill="#FF8042" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Budget Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(budgetData) && budgetData.length > 0 ? (
                    budgetData.map((item: any, index: number) => {
                      const variance = item.budget - item.actual_cost;
                      const variancePercent = (variance / item.budget) * 100;
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.project_name}</TableCell>
                          <TableCell>${item.budget.toLocaleString()}</TableCell>
                          <TableCell>${item.actual_cost.toLocaleString()}</TableCell>
                          <TableCell>
                            <span
                              className={
                                variance >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'
                              }
                            >
                              {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={variancePercent >= 0 ? 'default' : 'destructive'}
                            >
                              {variancePercent >= 0 ? 'Under' : 'Over'} Budget
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No budget data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variances" className="space-y-6">
          <div className="flex gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectList.map((project: any) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleExport('Variance Report')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>BOM Variance History</CardTitle>
            </CardHeader>
            <CardContent>
              {varianceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Cost Impact</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(variances) && variances.length > 0 ? (
                      variances.map((variance: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(variance.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">{variance.task?.title}</TableCell>
                          <TableCell>{variance.product?.name}</TableCell>
                          <TableCell>{variance.expected_qty}</TableCell>
                          <TableCell>{variance.actual_qty}</TableCell>
                          <TableCell>
                            <span
                              className={
                                variance.variance_qty > 0
                                  ? 'text-red-600 font-bold'
                                  : 'text-green-600 font-bold'
                              }
                            >
                              {variance.variance_qty > 0 ? '+' : ''}
                              {variance.variance_qty}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                parseFloat(variance.variance_cost) > 0
                                  ? 'text-red-600 font-bold'
                                  : 'text-green-600 font-bold'
                              }
                            >
                              ${Math.abs(parseFloat(variance.variance_cost)).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={variance.approved ? 'default' : 'secondary'}
                            >
                              {variance.approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No variance records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceReports;
