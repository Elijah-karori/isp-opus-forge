import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const Finance = () => {
  const { data: variances, isLoading } = useQuery({
    queryKey: ['pending-variances'],
    queryFn: () => apiClient.getPendingVariances(),
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
                      <Button size="sm" variant="outline">Approve</Button>
                      <Button size="sm" variant="outline">Reject</Button>
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
