import { apiClient } from '@/lib/api';

export async function fetchPendingWorkflows() {
  return apiClient.get("/workflows/pending");
}

export async function getWorkflowDetails(id: number) {
  return apiClient.get(`/workflows/${id}`);
}

export async function performWorkflowAction(id: number, action: "approve" | "reject" | "escalate", comment?: string) {
  return apiClient.post(`/workflows/${id}/${action}`, { comment });
}
