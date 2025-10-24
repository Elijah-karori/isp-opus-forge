import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPayrollSummary, getEmployeePerformance, type PayrollSummary, type EmployeePerformance } from '@/api/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, DollarSign, Users, TrendingUp } from 'lucide-react';

export function HRReports() {
  const [period, setPeriod] = useState({ 
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { data: payrollSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['payroll-summary', period],
    queryFn: () => getPayrollSummary({ period_start: period.start, period_end: period.end }),
  });

  // Example employee performance query (for a specific employee)
  const { data: employeePerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ['employee-performance', 1, period], // Example for employee 1
    queryFn: () => getEmployeePerformance(1, { period_start: period.start, period_end: period.end }),
  });

  const summary = payrollSummary?.data as PayrollSummary;
  const performance = employeePerformance?.data as EmployeePerformance;

  const performanceData = [
    { name: 'Tasks Completed', value: performance?.tasks_completed },
    { name: 'On Time Rate', value: performance?.on_time_rate * 100 },
    { name: 'Avg Rating', value: performance?.avg_rating },
  ].filter(d => d.value !== undefined);

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Select Reporting Period</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          {/* Filters for date range */}
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payroll Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Gross</p>
                <p className="text-2xl font-bold">${summary?.total_gross.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Net</p>
                <p className="text-2xl font-bold">${summary?.total_net.toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Employee Performance Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
