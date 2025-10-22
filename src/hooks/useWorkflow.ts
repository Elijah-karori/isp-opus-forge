// src/hooks/useWorkflow.ts
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPendingWorkflows, 
  getMyPendingApprovals,
  type WorkflowInstance 
} from '@/api/workflow';

export function useWorkflow() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get all pending workflows (for admin view)
  const { data: pendingWorkflows, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-workflows'],
    queryFn: getPendingWorkflows,
  });

  // Get my pending approvals
  const { data: myPendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['my-pending-approvals'],
    queryFn: getMyPendingApprovals,
  });

  const openWorkflowOverlay = (workflow: WorkflowInstance) => {
    setSelectedWorkflow(workflow);
    setIsOverlayOpen(true);
  };

  const closeWorkflowOverlay = () => {
    setIsOverlayOpen(false);
    setSelectedWorkflow(null);
  };

  const refreshWorkflows = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-workflows'] });
    queryClient.invalidateQueries({ queryKey: ['my-pending-approvals'] });
  };

  return {
    // Data
    pendingWorkflows: pendingWorkflows?.data || [],
    myPendingApprovals: myPendingApprovals?.data || [],
    
    // Loading states
    pendingLoading,
    approvalsLoading,
    
    // Overlay state
    selectedWorkflow,
    isOverlayOpen,
    openWorkflowOverlay,
    closeWorkflowOverlay,
    
    // Actions
    refreshWorkflows,
    
    // Stats
    totalPending: pendingWorkflows?.data?.length || 0,
    myPendingCount: myPendingApprovals?.data?.length || 0,
  };
}
