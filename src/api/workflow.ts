// src/api/workflows.ts
import axios from "./axios";

export interface WorkflowInstance {
  id: number;
  workflow_type: string;
  module: string;
  item_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  current_step: number;
  total_steps: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  item_data?: any;
  comments: WorkflowComment[];
  approvals: WorkflowApproval[];
  current_approvers: number[];
}

export interface WorkflowComment {
  id: number;
  instance_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface WorkflowApproval {
  id: number;
  instance_id: number;
  user_id: number;
  step: number;
  action: 'approved' | 'rejected' | 'commented';
  comments?: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface WorkflowAction {
  action: 'approve' | 'reject' | 'comment';
  comment?: string;
  user_id: number;
}

// Workflow instances
export const getPendingWorkflows = () =>
  axios.get("/workflows/workflows/pending");

export const getWorkflowInstance = (instanceId: number) =>
  axios.get(`/workflows/workflows/${instanceId}`);

export const getMyPendingApprovals = () =>
  axios.get("/workflows/my-pending-approvals");

// Workflow actions
export const approveWorkflow = (instanceId: number) =>
  axios.post(`/workflows/workflows/${instanceId}/approve`);

export const rejectWorkflow = (instanceId: number) =>
  axios.post(`/workflows/workflows/${instanceId}/reject`);

export const commentWorkflow = (instanceId: number, data: { comment: string }) =>
  axios.post(`/workflows/workflows/${instanceId}/comment`, data);

export const performWorkflowAction = (data: {
  instance_id: number;
  action: 'approve' | 'reject' | 'comment';
  comment?: string;
}) => axios.post("/workflows/action", data);

// Workflow history
export const getWorkflowHistory = (params?: {
  module?: string;
  item_id?: number;
  user_id?: number;
  start_date?: string;
  end_date?: string;
}) => axios.get("/workflows/history", { params });

// Workflow templates
export const getWorkflowTemplates = () =>
  axios.get("/workflows/templates");

export const createWorkflowTemplate = (data: any) =>
  axios.post("/workflows/templates", data);
