import { apiClient } from "@/lib/api";

export const workflowsApi = {
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
};
