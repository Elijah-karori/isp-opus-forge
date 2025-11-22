import { apiClient } from "@/lib/api";

export const workflowsApi = {
  // Instance management
  listPending: (role?: string) => {
    const suffix = role ? `/api/v1/workflows/pending/by-role/${encodeURIComponent(role)}` : "/api/v1/workflows/pending";
    return apiClient.get<any>(suffix);
  },
  approveInstance: (instanceId: number) => {
    return apiClient.post(`/api/v1/workflows/${instanceId}/approve`);
  },
  rejectInstance: (instanceId: number) => {
    return apiClient.post(`/api/v1/workflows/${instanceId}/reject`);
  },
  commentInstance: (instanceId: number, userId: number, comment: string) => {
    return apiClient.post(`/api/v1/workflows/${instanceId}/comment`, { instance_id: instanceId, action: "comment", user_id: userId, comment });
  },
  escalate: (instanceId: number, comment?: string) => {
    const q = comment ? `?comment=${encodeURIComponent(comment)}` : "";
    return apiClient.post(`/api/v1/workflows/${instanceId}/escalate${q}`);
  },

  // Workflow template management
  getWorkflows: () => {
    return apiClient.get<any>('/api/v1/workflows/templates');
  },
  getWorkflow: (id: number) => {
    return apiClient.get<any>(`/api/v1/workflows/templates/${id}`);
  },
  createWorkflowGraph: (data: any) => {
    return apiClient.post('/api/v1/workflows/templates', data);
  },
  updateWorkflowGraph: (id: number, data: any) => {
    return apiClient.patch(`/api/v1/workflows/templates/${id}`, data);
  },
  deleteWorkflow: (id: number) => {
    return apiClient.delete(`/api/v1/workflows/templates/${id}`);
  },
  publishWorkflow: (id: number) => {
    return apiClient.post(`/api/v1/workflows/templates/${id}/publish`);
  },
  cloneWorkflow: (id: number, name: string) => {
    return apiClient.post(`/api/v1/workflows/templates/${id}/clone`, { name });
  },
};
