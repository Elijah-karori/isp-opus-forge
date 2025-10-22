import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getPayrollSummary,
  getEmployeePerformance,
  getAttendanceReport,
  getDepartmentStats,
  exportPayroll,
  exportAttendance,
  type PayrollSummary,
  type EmployeePerformance,
} from '@/api/hr';
import { getEmployees } from '@/api/hr';
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
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  Loader2,
  Award,
  Clock,
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
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const HRReports = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('payroll');
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ['payroll-summary', startDate, endDate],
    queryFn: () => getPayrollSummary({ period_start: startDate, period_end: endDate }),
    enabled: selectedTab === 'payroll',
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-report', startDate, endDate, selectedDepartment],
    queryFn: () =>
      getAttendanceReport({
        start_date: startDate,
        end_date: endDate,
        department: selectedDepartment || undefined,
      }),
    enabled: selectedTab === 'attendance',
  });

  const { data: departmentData, isLoading: departmentLoading } = useQuery({
    queryKey: ['department-stats', selectedDepartment],
    queryFn: () => getDepartmentStats(selectedDepartment || undefined),
    enabled: selectedTab === 'department',
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees({ limit: 200 }),
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['employee-performance', selectedEmployee, startDate, endDate],
    queryFn: () =>
      getEmployeePerformance(parseInt(selectedEmployee), {
        start_date: startDate,
        end_date: endDate,
      }),
    enabled: selectedTab === 'performance' && !!selectedEmployee,
  });

  const employeeList = Array.isArray(employees?.data) ? employees.data : [];
  const payroll = payrollData?.data || {};
  const attendance = attendanceData?.data || [];
  const departments = departmentData?.data || [];
  const performance = performanceData?.data || {};

  const handleExportPayroll = async () => {
    try {
      const response = await exportPayroll({
        period_start: startDate,
        period_end: endDate,
        format: 'csv',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: 'Success',
        description: 'Payroll report exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export payroll report',
        variant: 'destructive',
      });
    }
  };

  const handleExportAttendance = async () => {
    try {
      const response = await exportAttendance({
        start_date: startDate,
        end_date: endDate,
        format: 'csv',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: 'Success',
        description: 'Attendance report exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export attendance report',
        variant: 'destructive',
      });
    }
  };

  const departmentChartData = Array.isArray(departments)
    ? departments.map((dept: any) => ({
        name: dept.department,
        employees: dept.employee_count,
        active: dept.active_count,
      }))
    : [];

  const attendanceChartData = Array.isArray(attendance)
    ? attendance.slice(0, 30).map((record: any) => ({
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present: record.present_count,
        absent: record.absent_count,
      }))
    : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            HR Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive HR reports, payroll summaries, and performance analytics
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
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="department" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Department
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payroll.total_employees || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(payroll.total_gross || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deductions</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(payroll.total_deductions || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Payout</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(payroll.total_net || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payroll Summary</CardTitle>
              <Button onClick={handleExportPayroll} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {payrollLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Period</div>
                      <div className="font-medium">
                        {new Date(startDate).toLocaleDateString()} -{' '}
                        {new Date(endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Pending Payouts</div>
                      <div className="font-medium">{payroll.pending_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Paid</div>
                      <div className="font-medium">{payroll.paid_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Average Payout</div>
                      <div className="font-medium">
                        $
                        {payroll.total_employees
                          ? (payroll.total_net / payroll.total_employees).toFixed(2)
                          : '0'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="flex gap-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departmentChartData.map((dept: any) => (
                  <SelectItem key={dept.name} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExportAttendance} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                    <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>On Leave</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(attendance) && attendance.length > 0 ? (
                    attendance.slice(0, 10).map((record: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {record.present_count}
                        </TableCell>
                        <TableCell className="text-red-600 font-medium">
                          {record.absent_count}
                        </TableCell>
                        <TableCell className="text-yellow-600 font-medium">
                          {record.leave_count || 0}
                        </TableCell>
                        <TableCell>
                          {(
                            (record.present_count /
                              (record.present_count + record.absent_count)) *
                            100
                          ).toFixed(1)}
                          %
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No attendance records found for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-2">
            <Label>Select Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employeeList.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.user?.full_name} - {emp.employee_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                    <Award className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performance.tasks_completed || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(performance.completion_rate || 0).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Award className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(performance.avg_rating || 0).toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <Clock className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(performance.attendance_rate || 0).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Department</div>
                        <div className="font-medium">{performance.department}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Tasks Assigned</div>
                        <div className="font-medium">{performance.tasks_assigned || 0}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                        <div className="font-medium">
                          ${(performance.total_revenue || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Complaints</div>
                        <div className="font-medium">{performance.complaints_count || 0}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">On-Time Rate</div>
                        <div className="font-medium">
                          {(performance.on_time_rate || 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="department" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {departmentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="employees" fill="#0088FE" name="Total Employees" />
                    <Bar dataKey="active" fill="#00C49F" name="Active" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Total Employees</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>On Leave</TableHead>
                    <TableHead>Avg. Tasks/Employee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(departments) && departments.length > 0 ? (
                    departments.map((dept: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell>{dept.employee_count}</TableCell>
                        <TableCell className="text-green-600">{dept.active_count}</TableCell>
                        <TableCell className="text-yellow-600">{dept.on_leave_count || 0}</TableCell>
                        <TableCell>{(dept.avg_tasks || 0).toFixed(1)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No department data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRReports;
