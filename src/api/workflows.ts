import { apiClient } from "@/lib/api";

export const workflowsApi = {
  // Instance management
  listPending: (role?: string) => {
    // The spec uses /workflow/my-approvals for current user's pending items
    // /workflow/pending is listed as legacy
    return apiClient.get<any>('/workflow/my-approvals');
  },
  approveInstance: (instanceId: number, comment?: string) => {
    return apiClient.request({
      url: `/workflow/${instanceId}/approve`,
      method: 'POST',
      params: { comment }
    });
  },
  rejectInstance: (instanceId: number, comment?: string) => {
    return apiClient.request({
      url: `/workflow/${instanceId}/reject`,
      method: 'POST',
      params: { comment }
    });
  },
  commentInstance: (instanceId: number, userId: number, comment: string) => {
    // Spec uses query param for comment, userId is inferred from token
    return apiClient.request({
      url: `/workflow/${instanceId}/comment`,
      method: 'POST',
      params: { comment }
    });
  },
  // Escalate is not in the current spec, commenting out
  // escalate: (instanceId: number, comment?: string) => {
  //   const q = comment ? `?comment=${encodeURIComponent(comment)}` : "";
  //   return apiClient.post(`/workflow/${instanceId}/escalate${q}`);
  // },
  getStats: () => {
    return apiClient.get<any>('/workflow/stats');
  },

  // Workflow template management
  getWorkflows: () => {
    return apiClient.get<any>('/workflow/');
  },
  getWorkflow: (id: number) => {
    return apiClient.get<any>(`/workflow/${id}`);
  },
  createWorkflowGraph: (data: any) => {
    return apiClient.post('/workflow/graph', data);
  },
  updateWorkflowGraph: (id: number, data: any) => {
    return apiClient.put(`/workflow/${id}/graph`, data);
  },
  deleteWorkflow: (id: number) => {
    return apiClient.delete(`/workflow/${id}`);
  },
  publishWorkflow: (id: number) => {
    return apiClient.post(`/workflow/${id}/publish`);
  },
  cloneWorkflow: (id: number, name: string) => {
    return apiClient.request({
      url: `/workflow/${id}/clone`,
      method: 'POST',
      params: { new_name: name }
    });
  },
};
