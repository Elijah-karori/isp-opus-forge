import { useQuery } from "@tanstack/react-query";
import { getPendingWorkflows } from "@/api/workflow";
import { WorkflowOverlay } from "@/components/WorkflowOverlay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Loader2, Eye, Users, DollarSign, AlertCircle } from "lucide-react";
import { useState } from "react";
import type { WorkflowInstance } from "@/api/workflow";

export default function HRWorkflows() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["hr-workflows"],
    queryFn: getPendingWorkflows,
  });

  const workflows = Array.isArray(data) 
    ? data.filter((w: any) => w.module === 'hr')
    : (Array.isArray((data as any)?.data) ? (data as any).data : []).filter((w: any) => w.module === 'hr');

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
        <div className="p-3 rounded-lg bg-blue-500/10">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">HR Workflows</h1>
          <p className="text-muted-foreground">Review and approve payouts, leaves, and HR requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
            <p className="text-xs text-muted-foreground">Requiring your action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payout Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${workflows.reduce((sum: number, w: any) => sum + (parseFloat(w.item_data?.net_amount || 0)), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees Affected</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(workflows.map((w: any) => w.item_data?.employee_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            HR Requests Requiring Approval
            <Badge variant="outline" className="ml-2">
              {workflows.length} pending
            </Badge>
          </CardTitle>
          <CardDescription>
            Review payouts, leave requests, and other HR matters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold mb-2">No Pending HR Workflows</p>
              <p className="text-sm">All HR requests have been reviewed and approved.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow: any) => {
                  const item = workflow.item_data;

                  return (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-mono text-sm">#{workflow.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {workflow.workflow_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item?.employee?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {item?.employee?.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item?.period_start && item?.period_end ? (
                          <>
                            {new Date(item.period_start).toLocaleDateString()} - <br />
                            {new Date(item.period_end).toLocaleDateString()}
                          </>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-600">
                          ${parseFloat(item?.net_amount || 0).toFixed(2)}
                        </div>
                        {item?.gross_amount && (
                          <div className="text-sm text-muted-foreground">
                            Gross: ${parseFloat(item.gross_amount).toFixed(2)}
                          </div>
                        )}
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
          module="hr"
          item={selectedWorkflow.item_data}
          onActionComplete={handleClose}
        />
      )}
    </div>
  );
}
