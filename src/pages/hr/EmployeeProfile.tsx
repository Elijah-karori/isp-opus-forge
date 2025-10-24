import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  getEmployee, 
  getRateCards, 
  getEmployeePerformance, 
  getComplaints, 
  type Employee, 
  type RateCard, 
  type EmployeePerformance, 
  type Complaint 
} from '@/api/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User, CreditCard, BarChart2, ShieldAlert } from 'lucide-react';

export function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);

  const { data: employeeData, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => getEmployee(employeeId),
    enabled: !!employeeId,
  });

  const { data: rateCardsData, isLoading: isLoadingRateCards } = useQuery({
    queryKey: ['rateCards', employeeId],
    queryFn: () => getRateCards(employeeId),
    enabled: !!employeeId,
  });

  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['employeePerformance', employeeId],
    queryFn: () => getEmployeePerformance(employeeId, { 
      period_start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
    }),
    enabled: !!employeeId,
  });

  const { data: complaintsData, isLoading: isLoadingComplaints } = useQuery({
    queryKey: ['complaints', { employee_id: employeeId }],
    queryFn: () => getComplaints({ employee_id: employeeId }),
    enabled: !!employeeId,
  });

  const isLoading = isLoadingEmployee || isLoadingRateCards || isLoadingPerformance || isLoadingComplaints;
  const employee = employeeData?.data as Employee;
  const rateCards = (rateCardsData?.data || []) as RateCard[];
  const performance = performanceData?.data as EmployeePerformance;
  const complaints = (complaintsData?.data || []) as Complaint[];

  if (isLoading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!employee) {
    return <div className="text-center py-12">Employee not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${employee.user?.email}`} />
            <AvatarFallback className="text-3xl">{employee.user?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{employee.user?.full_name}</h1>
            <p className="text-lg text-muted-foreground">{employee.designation} - {employee.department}</p>
            <div className="flex items-center gap-2 pt-2">
              <Badge>{employee.status}</Badge>
              <span className="text-sm text-muted-foreground">Employee Code: {employee.employee_code}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Rate Cards */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard /> Rate Cards</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Base Rate</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateCards.map(rc => (
                  <TableRow key={rc.id}>
                    <TableCell>{rc.engagement_type}</TableCell>
                    <TableCell>${rc.base_rate}</TableCell>
                    <TableCell>{rc.rate_unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Complaints */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert /> Complaints</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.complaint_type}</TableCell>
                    <TableCell><Badge severity={c.severity}>{c.severity}</Badge></TableCell>
                    <TableCell>{new Date(c.reported_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 /> Performance Metrics</CardTitle></CardHeader>
        <CardContent>
          {performance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{performance.completion_rate}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">{performance.avg_rating?.toFixed(1) || 'N/A'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
