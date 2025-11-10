import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const BOMVariances = () => {
  const queryClient = useQueryClient();

  const { data: variances, isLoading } = useQuery({
    queryKey: ['pending-variances'],
    queryFn: () => apiClient.getPendingVariances(),
  });

  const approveMutation = useMutation({
    mutationFn: (varianceId: number) => apiClient.approveVariance(varianceId, { approved: true, approver_id: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-variances'] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">BOM Variances</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending BOM Variance Approvals</CardTitle>
          <CardDescription>Review and approve or reject differences in cost or materials for project tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Variance Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6}>Loading variances...</TableCell></TableRow>
              ) : (
                variances?.map((variance: any) => (
                  <TableRow key={variance.id}>
                    <TableCell>{variance.task_id}</TableCell>
                    <TableCell>{variance.project_name}</TableCell>
                    <TableCell><Badge variant="outline">{variance.type}</Badge></TableCell>
                    <TableCell>${variance.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="destructive">{variance.status}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => approveMutation.mutate(variance.id)}>
                        Approve
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

export default BOMVariances;
