import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Users, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const HR = () => {
  const queryClient = useQueryClient();

  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => apiClient.getEmployees(),
  });

  const { data: payouts, isLoading: loadingPayouts } = useQuery({
    queryKey: ['pending-payouts'],
    queryFn: () => apiClient.getPendingPayouts(),
  });

  const approvePayoutMutation = useMutation({
    mutationFn: ({ payoutId, approved, notes }: { payoutId: number; approved: boolean; notes?: string }) =>
      apiClient.approvePayout(payoutId, { approved, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
      toast.success('Payout decision recorded');
    },
    onError: () => {
      toast.error('Failed to process payout');
    },
  });

  const isLoading = loadingEmployees || loadingPayouts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPendingPayouts = Array.isArray(payouts) ? payouts.reduce((sum: number, p: any) => sum + parseFloat(p.net_amount || 0), 0) : 0;
  const activeEmployees = Array.isArray(employees) ? employees.filter((e: any) => e.is_active).length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Human Resources</h1>
        <p className="text-muted-foreground">Manage employees, payouts, and attendance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(payouts) ? payouts.length : 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPendingPayouts.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Code</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Engagement Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Quality Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(employees) && employees.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.employee_code}</TableCell>
                  <TableCell>{employee.user_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.engagement_type}</Badge>
                  </TableCell>
                  <TableCell>{employee.department || 'N/A'}</TableCell>
                  <TableCell>
                    {employee.quality_rating ? (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{parseFloat(employee.quality_rating).toFixed(1)}</span>
                        <span className="text-muted-foreground">/5.0</span>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.is_active ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(payouts) && payouts.map((payout: any) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">#{payout.id}</TableCell>
                  <TableCell>{payout.employee_id}</TableCell>
                  <TableCell>
                    {new Date(payout.period_start).toLocaleDateString()} -{' '}
                    {new Date(payout.period_end).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${parseFloat(payout.gross_amount).toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">${parseFloat(payout.net_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => approvePayoutMutation.mutate({
                          payoutId: payout.id,
                          approved: true,
                          notes: 'Approved for payment',
                        })}
                        disabled={approvePayoutMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => approvePayoutMutation.mutate({
                          payoutId: payout.id,
                          approved: false,
                          notes: 'Rejected',
                        })}
                        disabled={approvePayoutMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
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
};

export default HR;
