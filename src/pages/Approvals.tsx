// src/pages/Approvals.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  CheckCircle, 
  Clock,
  DollarSign,
  User,
  ShoppingCart,
  Megaphone,
  FileText
} from 'lucide-react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowOverlay } from '@/components/WorkflowOverlay';
import { getMyPendingApprovals, type WorkflowInstance } from '@/api/workflows';

const Approvals = () => {
  const {
    pendingWorkflows,
    myPendingApprovals,
    pendingLoading,
    approvalsLoading,
    selectedWorkflow,
    isOverlayOpen,
    openWorkflowOverlay,
    closeWorkflowOverlay,
    myPendingCount
  } = useWorkflow();

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'finance': return DollarSign;
      case 'hr': return User;
      case 'procurement': return ShoppingCart;
      case 'marketing': return Megaphone;
      case 'tasks': return FileText;
      default: return FileText;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'finance': return 'text-green-600 bg-green-500/10';
      case 'hr': return 'text-blue-600 bg-blue-500/10';
      case 'procurement': return 'text-orange-600 bg-orange-500/10';
      case 'marketing': return 'text-purple-600 bg-purple-500/10';
      default: return 'text-gray-600 bg-gray-500/10';
    }
  };

  const isLoading = pendingLoading || approvalsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve pending requests across all modules
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {myPendingCount} Pending Your Approval
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{myPendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingWorkflows.filter(w => w.module === 'finance').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Variances & budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HR</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingWorkflows.filter(w => w.module === 'hr').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Payouts & complaints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procurement</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingWorkflows.filter(w => w.module === 'procurement').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Purchase orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="my-approvals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            My Approvals
            {myPendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {myPendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all-pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            All Pending
            <Badge variant="outline" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {pendingWorkflows.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* My Approvals Tab */}
        <TabsContent value="my-approvals" className="space-y-6">
          <ApprovalsTable 
            workflows={myPendingApprovals}
            title="Awaiting My Approval"
            onReview={openWorkflowOverlay}
            getModuleIcon={getModuleIcon}
            getModuleColor={getModuleColor}
          />
        </TabsContent>

        {/* All Pending Tab */}
        <TabsContent value="all-pending" className="space-y-6">
          <ApprovalsTable 
            workflows={pendingWorkflows}
            title="All Pending Approvals"
            onReview={openWorkflowOverlay}
            getModuleIcon={getModuleIcon}
            getModuleColor={getModuleColor}
          />
        </TabsContent>
      </Tabs>

      {/* Workflow Overlay */}
      {selectedWorkflow && (
        <WorkflowOverlay
          isOpen={isOverlayOpen}
          onClose={closeWorkflowOverlay}
          workflow={selectedWorkflow}
          module={selectedWorkflow.module}
          item={selectedWorkflow.item_data}
          onActionComplete={closeWorkflowOverlay}
        />
      )}
    </div>
  );
};

// Approvals Table Component
const ApprovalsTable = ({ 
  workflows, 
  title, 
  onReview,
  getModuleIcon,
  getModuleColor 
}: { 
  workflows: WorkflowInstance[];
  title: string;
  onReview: (workflow: WorkflowInstance) => void;
  getModuleIcon: (module: string) => any;
  getModuleColor: (module: string) => string;
}) => {
  if (workflows.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
          <p className="text-muted-foreground text-center">
            {title === 'Awaiting My Approval' 
              ? "You're all caught up! No approvals require your attention at the moment."
              : "There are no pending approvals in the system."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Step</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Current Approvers</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => {
              const ModuleIcon = getModuleIcon(workflow.module);
              const moduleColor = getModuleColor(workflow.module);
              
              return (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${moduleColor}`}>
                        <ModuleIcon className="h-4 w-4" />
                      </div>
                      <span className="font-medium capitalize">
                        {workflow.module}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {getItemTitle(workflow.module, workflow.item_data)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {workflow.item_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      Step {workflow.current_step}/{workflow.total_steps}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(workflow.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(workflow.created_at).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {workflow.current_approvers?.length || 0} users
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => onReview(workflow)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Helper function to get item title based on module
function getItemTitle(module: string, itemData: any): string {
  if (!itemData) return 'Unknown Item';

  switch (module) {
    case 'finance':
      return itemData.task?.title || `Variance #${itemData.id}`;
    case 'hr':
      return itemData.employee?.full_name || `Payout #${itemData.id}`;
    case 'procurement':
      return itemData.order_number || `Purchase Order #${itemData.id}`;
    case 'marketing':
      return itemData.name || `Campaign #${itemData.id}`;
    case 'tasks':
      return itemData.title || `Task #${itemData.id}`;
    default:
      return `Item #${itemData.id}`;
  }
}

export default Approvals;
