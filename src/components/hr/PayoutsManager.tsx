import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPendingPayouts, 
  calculatePayout, 
  approvePayout,
  markPayoutPaid,
  type Payout 
} from '@/api/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PayoutsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calculationParams, setCalculationParams] = useState({ 
    employeeId: '', 
    startDate: '', 
    endDate: '' 
  });

  const { data: pendingPayouts, isLoading } = useQuery({
    queryKey: ['pending-payouts'],
    queryFn: () => getPendingPayouts(),
  });

  const calculatePayoutMutation = useMutation({
    mutationFn: calculatePayout,
    onSuccess: () => {
      toast({ title: 'Calculation Started', description: 'Payout calculation is in progress.' });
      queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
    },
    onError: (error: any) => {
      toast({ title: 'Calculation Failed', description: error.message, variant: 'destructive' });
    },
  });

  const approvePayoutMutation = useMutation({
    mutationFn: (payoutId: number) => approvePayout(payoutId, { approved: true }),
    onSuccess: () => {
      toast({ title: 'Payout Approved' });
      queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
    },
  });

  const handleCalculate = () => {
    calculatePayoutMutation.mutate({
      employee_id: Number(calculationParams.employeeId),
      period_start: calculationParams.startDate,
      period_end: calculationParams.endDate,
    });
  };

  const payoutList = pendingPayouts?.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Calculate Payouts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          {/* Calculation form will go here */}
          <Button onClick={handleCalculate} disabled={calculatePayoutMutation.isPending}>
            {calculatePayoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Calculate Payout
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Pending Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutList.map((payout: Payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{payout.employee_id}</TableCell>
                    <TableCell>{payout.period_start} to {payout.period_end}</TableCell>
                    <TableCell className="font-medium">${payout.net_amount}</TableCell>
                    <TableCell>
                      <Badge variant={payout.status === 'pending' ? 'warning' : 'outline'}>
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payout.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => approvePayoutMutation.mutate(payout.id)}
                          disabled={approvePayoutMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
