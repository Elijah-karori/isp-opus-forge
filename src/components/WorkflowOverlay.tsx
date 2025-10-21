// src/components/WorkflowOverlay.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Clock,
  User,
  FileText,
  Building,
  DollarSign,
  ShoppingCart,
  Megaphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { performWorkflowAction, type WorkflowInstance } from '@/api/workflows';

interface WorkflowOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: WorkflowInstance | null;
  module: string;
  item?: any;
  onActionComplete?: () => void;
}

export function WorkflowOverlay({ 
  isOpen, 
  onClose, 
  workflow, 
  module,
  item,
  onActionComplete 
}: WorkflowOverlayProps) {
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const actionMutation = useMutation({
    mutationFn: (action: 'approve' | 'reject' | 'comment') =>
      performWorkflowAction({ 
        instance_id: workflow!.id, 
        action, 
        comment: comment.trim() || undefined 
      }),
    onSuccess: (_, action) => {
      toast({
        title: "Action Completed",
        description: `Workflow ${action} successfully`,
      });
      setComment('');
      onClose();
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pending-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-approvals'] });
      
      // Invalidate module-specific queries
      switch (module) {
        case 'finance':
          queryClient.invalidateQueries({ queryKey: ['pending-variances'] });
          queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
          break;
        case 'hr':
          queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
          queryClient.invalidateQueries({ queryKey: ['hr-dashboard-stats'] });
          break;
        case 'procurement':
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
          queryClient.invalidateQueries({ queryKey: ['procurement-stats'] });
          break;
        case 'marketing':
          queryClient.invalidateQueries({ queryKey: ['campaigns'] });
          queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
          break;
        case 'tasks':
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          queryClient.invalidateQueries({ queryKey: ['task-stats'] });
          break;
      }

      if (onActionComplete) {
        onActionComplete();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to perform workflow action",
        variant: "destructive",
      });
    },
  });

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'finance':
        return DollarSign;
      case 'hr':
        return User;
      case 'procurement':
        return ShoppingCart;
      case 'marketing':
        return Megaphone;
      case 'tasks':
        return FileText;
      default:
        return FileText;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'finance':
        return 'text-green-600 bg-green-500/10';
      case 'hr':
        return 'text-blue-600 bg-blue-500/10';
      case 'procurement':
        return 'text-orange-600 bg-orange-500/10';
      case 'marketing':
        return 'text-purple-600 bg-purple-500/10';
      case 'tasks':
        return 'text-gray-600 bg-gray-500/10';
      default:
        return 'text-gray-600 bg-gray-500/10';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Pending' },
      approved: { class: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Approved' },
      rejected: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected' },
      cancelled: { class: 'bg-gray-500/10 text-gray-500 border-gray-500/20', label: 'Cancelled' },
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const ModuleIcon = getModuleIcon(module);
  const moduleColor = getModuleColor(module);
  const statusBadge = getStatusBadge(workflow?.status || 'pending');

  if (!workflow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${moduleColor}`}>
              <ModuleIcon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                Review {module.charAt(0).toUpperCase() + module.slice(1)} Request
                <Badge variant="outline" className={statusBadge.class}>
                  {statusBadge.label}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Step {workflow.current_step} of {workflow.total_steps} in approval process
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {renderItemDetails(module, workflow.item_data || item)}
              </div>
            </CardContent>
          </Card>

          {/* Approval Progress */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Approval Progress
              </h3>
              <div className="space-y-3">
                {workflow.approvals.map((approval, index) => (
                  <div key={approval.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      approval.action === 'approved' ? 'bg-green-100 text-green-600' :
                      approval.action === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {approval.action === 'approved' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : approval.action === 'rejected' ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{approval.user?.full_name}</span>
                        <Badge variant="outline" className={
                          approval.action === 'approved' ? 'bg-green-500/10 text-green-500' :
                          approval.action === 'rejected' ? 'bg-red-500/10 text-red-500' :
                          'bg-blue-500/10 text-blue-500'
                        }>
                          {approval.action}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(approval.created_at).toLocaleDateString()} • Step {approval.step}
                      </div>
                      {approval.comments && (
                        <div className="text-sm mt-1 p-2 bg-muted rounded">
                          {approval.comments}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Current Step */}
                {workflow.status === 'pending' && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 border-2 border-blue-300">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-blue-600">Your Approval Required</div>
                      <div className="text-sm text-muted-foreground">
                        Step {workflow.current_step} - Awaiting your decision
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments & Notes
              </h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {workflow.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.user?.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm mt-1">{comment.comment}</div>
                    </div>
                  </div>
                ))}
                {workflow.comments.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No comments yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Section */}
          {workflow.status === 'pending' && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Your Action</h3>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add comments or notes for this approval (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => actionMutation.mutate('approve')}
                      disabled={actionMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {actionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => actionMutation.mutate('reject')}
                      disabled={actionMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      {actionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      onClick={() => actionMutation.mutate('comment')}
                      disabled={actionMutation.isPending || !comment.trim()}
                      variant="outline"
                      className="flex-1"
                    >
                      {actionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                      )}
                      Comment Only
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to render item details based on module
function renderItemDetails(module: string, item: any) {
  switch (module) {
    case 'finance':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Task</label>
              <div className="font-medium">{item.task?.title || 'N/A'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project</label>
              <div className="font-medium">{item.task?.project_name || 'N/A'}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Variance Amount</label>
              <div className="font-medium text-red-600">
                ${Math.abs(parseFloat(item.variance_cost)).toFixed(2)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Variance %</label>
              <div className="font-medium">{item.variance_percent}%</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Product</label>
              <div className="font-medium">{item.product?.name || 'N/A'}</div>
            </div>
          </div>
        </div>
      );

    case 'hr':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Employee</label>
              <div className="font-medium">{item.employee?.full_name || 'N/A'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Period</label>
              <div className="font-medium">
                {item.period_start} to {item.period_end}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gross Amount</label>
              <div className="font-medium">${item.gross_amount}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Net Amount</label>
              <div className="font-medium">${item.net_amount}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          </div>
        </div>
      );

    case 'procurement':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Order Number</label>
              <div className="font-medium font-mono">{item.order_number}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Supplier</label>
              <div className="font-medium">{item.supplier?.name || 'N/A'}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
              <div className="font-medium">${item.total_amount?.toLocaleString()}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Items</label>
              <div className="font-medium">{item.items?.length || 0} items</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          </div>
        </div>
      );

    case 'marketing':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Campaign Name</label>
              <div className="font-medium">{item.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Budget</label>
              <div className="font-medium">${item.budget?.toLocaleString()}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <div className="font-medium">{item.start_date}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <div className="font-medium">{item.end_date}</div>
            </div>
          </div>
          {item.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <div className="font-medium">{item.description}</div>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="text-muted-foreground">
          No details available for this item.
        </div>
      );
  }
}
