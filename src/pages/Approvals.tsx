import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface WorkflowInstance {
  id: number;
  related_model: string;
  related_id: number;
  workflow_step: string;
  current_status: string;
  created_at: string;
  metadata?: any;
}

export default function ApprovalsPage() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const response = await axios.get('/workflows/pending');
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.post(`/workflows/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast({
        title: 'Approved',
        description: 'Item has been approved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to approve item.',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.post(`/workflows/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast({
        title: 'Rejected',
        description: 'Item has been rejected.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reject item.',
        variant: 'destructive',
      });
    },
  });

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      approveMutation.mutate(id);
    } else {
      rejectMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Clock className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and approve pending items</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {items.length} Pending
        </Badge>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No pending approvals</p>
            <p className="text-sm text-muted-foreground">All items have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item: WorkflowInstance) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      {item.related_model} #{item.related_id}
                    </CardTitle>
                    <CardDescription>
                      Step: {item.workflow_step} • Status: {item.current_status}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleAction(item.id, 'reject')}
                    disabled={rejectMutation.isPending || approveMutation.isPending}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAction(item.id, 'approve')}
                    disabled={rejectMutation.isPending || approveMutation.isPending}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
