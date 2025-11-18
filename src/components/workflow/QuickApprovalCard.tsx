import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowsApi } from '@/api/workflows';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

interface QuickApprovalCardProps {
  instanceId: number;
  onComplete?: () => void;
}

export function QuickApprovalCard({ instanceId, onComplete }: QuickApprovalCardProps) {
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      await workflowsApi.approveInstance(instanceId);
      if (comment) {
        await workflowsApi.commentInstance(instanceId, 0, comment);
      }
    },
    onSuccess: () => {
      toast.success('Approved successfully');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      onComplete?.();
    },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!comment) {
        throw new Error('Comment required for rejection');
      }
      await workflowsApi.rejectInstance(instanceId);
      await workflowsApi.commentInstance(instanceId, 0, comment);
    },
    onSuccess: () => {
      toast.success('Rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      onComplete?.();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject');
    },
  });

  const handleApprove = () => {
    approveMutation.mutate();
  };

  const handleReject = () => {
    if (!comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick Approval</CardTitle>
          <Badge variant="secondary">Instance #{instanceId}</Badge>
        </div>
        <CardDescription>Review and take action on this workflow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Comment (optional for approval, required for rejection)</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comments here..."
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={handleApprove}
            disabled={approveMutation.isPending || rejectMutation.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={handleReject}
            disabled={approveMutation.isPending || rejectMutation.isPending}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
