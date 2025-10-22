// src/pages/Finance.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getPendingVariances, 
  approveVariance, 
  getProjectFinancials,
  getFinancialSummary,
  getFinanceDashboardStats,
  type BOMVariance,
  type ProjectFinancials,
  type FinancialSummary
} from '@/api/finance';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText,
  Calendar,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FinanceDashboard } from '@/components/finance/FinanceDashboard';
import { WorkflowOverlay } from '@/components/WorkflowOverlay';
import { useWorkflow } from '@/hooks/useWorkflow';

const Finance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use the workflow hook for overlay management
  const {
    selectedWorkflow,
    isOverlayOpen,
    openWorkflowOverlay,
    closeWorkflowOverlay,
    refreshWorkflows
  } = useWorkflow();

  // Fetch financial data
  const { data: pendingVariances, isLoading: variancesLoading } = useQuery({
    queryKey: ['pending-variances'],
    queryFn: () => apiClient.getPendingVariances(),
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['finance-dashboard-stats'],
    queryFn: () => getFinanceDashboardStats(),
  });

  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => getFinancialSummary(),
  });

  // Get workflow instances for variances
  const { data: varianceWorkflowsData, isLoading: workflowsLoading } = useQuery({
    queryKey: ['variance-workflows'],
    queryFn: () => apiClient.getPendingWorkflows(),
  });

  const varianceWorkflows = Array.isArray(varianceWorkflowsData) 
    ? varianceWorkflowsData.filter((workflow: any) => workflow.module === 'finance')
    : (Array.isArray((varianceWorkflowsData as any)?.data) ? (varianceWorkflowsData as any).data : []).filter((workflow: any) => workflow.module === 'finance');

  // Create a mapping of variance IDs to workflow instances
  const varianceToWorkflowMap = new Map();
  (varianceWorkflows || []).forEach((workflow: any) => {
    varianceToWorkflowMap.set(workflow.item_id, workflow);
  });

  const handleVarianceReview = (variance: BOMVariance) => {
    // Find the workflow instance for this variance
    const workflow = varianceToWorkflowMap.get(variance.id);
    if (workflow) {
      openWorkflowOverlay(workflow);
    } else {
      // Fallback to direct approval if no workflow exists
      toast({
        title: "Workflow Not Found",
        description: "No approval workflow found for this variance",
        variant: "destructive",
      });
    }
  };

  const handleWorkflowActionComplete = () => {
    // Refresh all relevant data after workflow action
    queryClient.invalidateQueries({ queryKey: ['pending-variances'] });
    queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['variance-workflows'] });
    refreshWorkflows();
  };

  const isLoading = variancesLoading || statsLoading || summaryLoading || workflowsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const varianceList = Array.isArray(pendingVariances) ? pendingVariances : [];
  const stats = dashboardStats?.data || {};
  const summary = financialSummary?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
          <p className="text-muted-foreground">
            Monitor project finances, approve variances, and track financial performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <Button className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.total_revenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.gross_profit?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {summary.margin_percent || '0'}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Variances</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{varianceList.length}</div>
            <p className="text-xs text-muted-foreground">
              Requiring approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance Impact</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${summary.variance_impact?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost overruns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="variances" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Variances
            {varianceList.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {varianceList.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <FinanceDashboard />
        </TabsContent>

        {/* Variances Tab */}
        <TabsContent value="variances" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Pending BOM Variances
                <Badge variant="outline" className="ml-2">
                  {varianceList.length} pending
                </Badge>
              </CardTitle>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {varianceList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Cost Impact</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {varianceList.map((variance: BOMVariance) => {
                      const workflow = varianceToWorkflowMap.get(variance.id);
                      const hasWorkflow = !!workflow;
                      const isPendingApproval = workflow?.status === 'pending';
                      
                      return (
                        <TableRow key={variance.id} className={
                          Math.abs(variance.variance_qty) > 10 ? 'bg-red-50' : 'bg-orange-50'
                        }>
                          <TableCell className="font-medium">
                            <div className="max-w-[200px] truncate">
                              {variance.task?.title || `Task #${variance.task_id}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {variance.task?.project_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{variance.product?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {variance.product?.sku}
                            </div>
                          </TableCell>
                          <TableCell>{variance.expected_qty}</TableCell>
                          <TableCell>{variance.actual_qty}</TableCell>
                          <TableCell>
                            <div className={`font-semibold ${
                              variance.variance_qty > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {variance.variance_qty > 0 ? '+' : ''}{variance.variance_qty}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {variance.variance_percent}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`font-semibold ${
                              parseFloat(variance.variance_cost) > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              ${Math.abs(parseFloat(variance.variance_cost)).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {variance.task?.technician_name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {new Date(variance.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {hasWorkflow ? (
                              <Badge variant={
                                workflow.status === 'pending' ? 'secondary' :
                                workflow.status === 'approved' ? 'default' :
                                'destructive'
                              }>
                                {workflow.status}
                              </Badge>
                            ) : (
                              <Badge variant="outline">No Workflow</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                onClick={() => handleVarianceReview(variance)}
                                disabled={!hasWorkflow || !isPendingApproval}
                              >
                                {hasWorkflow ? 'Review' : 'No Workflow'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Variances</h3>
                  <p className="text-muted-foreground">
                    All BOM variances have been reviewed and approved.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <ProjectsFinancialOverview />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <FinancialReports />
        </TabsContent>
      </Tabs>

      {/* Workflow Overlay */}
      {selectedWorkflow && (
        <WorkflowOverlay
          isOpen={isOverlayOpen}
          onClose={closeWorkflowOverlay}
          workflow={selectedWorkflow}
          module="finance"
          item={selectedWorkflow.item_data}
          onActionComplete={handleWorkflowActionComplete}
        />
      )}
    </div>
  );
};

// Additional components for the Finance page
const ProjectsFinancialOverview = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects-financials'],
    queryFn: () => apiClient.getProjects({ limit: 50 }),
  });

  const projectList = Array.isArray(projects) ? projects : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Actual Cost</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectList.map((project: any) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.customer_name}</TableCell>
                <TableCell>${project.budget?.toLocaleString() || '0'}</TableCell>
                <TableCell>${project.actual_cost?.toLocaleString() || '0'}</TableCell>
                <TableCell>
                  <Badge variant={
                    (project.budget - project.actual_cost) >= 0 ? 'default' : 'destructive'
                  }>
                    ${Math.abs(project.budget - project.actual_cost).toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    project.actual_cost < project.budget ? 'default' : 'destructive'
                  }>
                    {project.budget ? 
                      (((project.budget - project.actual_cost) / project.budget) * 100).toFixed(1) + '%' 
                      : '0%'
                    }
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    project.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-gray-500/10 text-gray-500'
                  }>
                    {project.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const FinancialReports = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profit & Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              Monthly P&L Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Quarterly Summary
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Year-to-Date
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              Budget vs Actual
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Variance Analysis
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Cost Breakdown
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finance;
