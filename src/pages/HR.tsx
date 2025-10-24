import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, DollarSign, Flag, BarChart2 } from 'lucide-react';

// Import HR-related components
import { EmployeeList } from '@/components/hr/EmployeeList';
import { AttendanceLogs } from '@/components/hr/AttendanceLogs';
import { PayoutsManager } from '@/components/hr/PayoutsManager';
import { ComplaintsManager } from '@/components/hr/ComplaintsManager';
import { HRReports } from '@/components/hr/HRReports';

const HRPage = () => {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Human Resources</h1>
          <p className="text-muted-foreground">
            Manage employees, attendance, payroll, and performance.
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Complaints
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <EmployeeList />
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <AttendanceLogs />
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <PayoutsManager />
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="space-y-6">
          <ComplaintsManager />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <HRReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRPage;
