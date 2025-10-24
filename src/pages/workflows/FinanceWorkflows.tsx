import { useQuery } from "@tanstack/react-query";
import { getPendingWorkflows } from "@/api/workflow";
import { WorkflowOverlay } from "@/components/WorkflowOverlay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Loader2, Eye, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { WorkflowInstance } from "@/api/workflow";

export default function FinanceWorkflows() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["finance-workflows"],
    queryFn: getPendingWorkflows,
  });

  const workflows = Array.isArray(data) 
    ? data.filter((w: any) => w.module === 'finance')
    : (Array.isArray((data as any)?.data) ? (data as any).data : []).filter((w: any) => w.module === 'finance');

  const handleViewWorkflow = (workflow: WorkflowInstance) => {
    setSelectedWorkflow(workflow);
    setIsOverlayOpen(true);
  };

  const handleClose = () => {
    setIsOverlayOpen(false);
    setSelectedWorkflow(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-green-500/10">
          <DollarSign className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Finance Workflows</h1>
          <p className="text-muted-foreground">Review and approve BOM variances and financial requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
            <p className="text-xs text-muted-foreground">Requiring your action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Variance Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${workflows.reduce((sum: number, w: any) => sum + Math.abs(parseFloat(w.item_data?.variance_cost || 0)), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Variance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${workflows.length > 0 
                ? (workflows.reduce((sum: number, w: any) => sum + Math.abs(parseFloat(w.item_data?.variance_cost || 0)), 0) / workflows.length).toFixed(2)
                : '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">Per variance</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            BOM Variances Requiring Approval
            <Badge variant="outline" className="ml-2">
              {workflows.length} pending
            </Badge>
          </CardTitle>
          <CardDescription>
            Review material usage variances and approve or reject based on justification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold mb-2">No Pending Finance Workflows</p>
              <p className="text-sm">All variances have been reviewed and approved.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow ID</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Cost Impact</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow: any) => {
                  const item = workflow.item_data;
                  const costImpact = parseFloat(item?.variance_cost || 0);
                  const isOverBudget = costImpact > 0;

                  return (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-mono text-sm">#{workflow.id}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium truncate">{item?.task?.title || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {item?.task?.project_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item?.product?.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item?.product?.sku}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                          {item?.variance_qty > 0 ? '+' : ''}{item?.variance_qty}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item?.variance_percent}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                          ${Math.abs(costImpact).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {workflow.current_step}/{workflow.total_steps}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          workflow.status === 'pending' ? 'secondary' :
                          workflow.status === 'approved' ? 'default' :
                          'destructive'
                        }>
                          {workflow.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(workflow.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewWorkflow(workflow)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Workflow Overlay */}
      {selectedWorkflow && (
        <WorkflowOverlay
          isOpen={isOverlayOpen}
          onClose={handleClose}
          workflow={selectedWorkflow}
          module="finance"
          item={selectedWorkflow.item_data}
          onActionComplete={handleClose}
        />
      )}
    </div>
  );
}
