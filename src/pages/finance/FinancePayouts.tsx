import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const FinancePayouts = () => {
  const queryClient = useQueryClient();

  const { data: payouts, isLoading } = useQuery({
    queryKey: ['pending-payouts'],
    queryFn: () => apiClient.getPendingPayouts(),
  });

  const markPaidMutation = useMutation({
    mutationFn: (payoutId: number) => apiClient.markPayoutAsPaid(payoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Finance Payouts</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
          <CardDescription>Review and mark technician and project payouts as disbursed.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Technician/Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5}>Loading payouts...</TableCell></TableRow>
              ) : (
                payouts?.map((payout: any) => (
                  <TableRow key={payout.id}>
                    <TableCell>{payout.id}</TableCell>
                    <TableCell>{payout.recipient_name}</TableCell>
                    <TableCell>${payout.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">{payout.status}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => markPaidMutation.mutate(payout.id)}>
                        Mark as Paid
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancePayouts;
