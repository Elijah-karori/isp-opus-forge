import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const Finance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: variances, isLoading } = useQuery({
    queryKey: ['pending-variances'],
    queryFn: () => apiClient.getPendingVariances(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ varianceId, approved, notes }: { varianceId: number; approved: boolean; notes?: string }) =>
      apiClient.approveVariance(varianceId, {
        approved,
        approver_id: user?.id || 0,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-variances'] });
      toast.success('Variance decision recorded');
    },
    onError: () => {
      toast.error('Failed to process variance');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalVarianceCost = Array.isArray(variances) ? variances.reduce((sum: number, v: any) => sum + parseFloat(v.variance_cost || 0), 0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">Financial oversight and variance management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Variances</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(variances) ? variances.length : 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Variance Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVarianceCost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Variance %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(variances) && variances.length > 0
                ? (
                    variances.reduce((sum: number, v: any) => sum + parseFloat(v.variance_percent || 0), 0) /
                    variances.length
                  ).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending BOM Variances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Expected Qty</TableHead>
                <TableHead>Actual Qty</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Cost Impact</TableHead>
                <TableHead>Variance %</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(variances) && variances.map((variance: any) => (
                <TableRow key={variance.id}>
                  <TableCell className="font-medium">#{variance.task_id}</TableCell>
                  <TableCell>{variance.product_id}</TableCell>
                  <TableCell>{variance.expected_qty}</TableCell>
                  <TableCell>{variance.actual_qty}</TableCell>
                  <TableCell className={variance.variance_qty > 0 ? 'text-red-500' : 'text-green-500'}>
                    {variance.variance_qty > 0 ? '+' : ''}
                    {variance.variance_qty}
                  </TableCell>
                  <TableCell className={parseFloat(variance.variance_cost) > 0 ? 'text-red-500' : 'text-green-500'}>
                    ${parseFloat(variance.variance_cost).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={parseFloat(variance.variance_percent) > 10 ? 'destructive' : 'outline'}>
                      {parseFloat(variance.variance_percent).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => approveMutation.mutate({
                          varianceId: variance.id,
                          approved: true,
                          notes: 'Approved by finance',
                        })}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => approveMutation.mutate({
                          varianceId: variance.id,
                          approved: false,
                          notes: 'Rejected by finance',
                        })}
                        disabled={approveMutation.isPending}
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

export default Finance;
