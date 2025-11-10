// src/api/workflows.ts
import { apiClient } from "@/lib/api";

export const workflowsApi = {
  listPending: (role?: string) => {
    const suffix = role ? `/api/v1/workflows/pending/by-role/${encodeURIComponent(role)}` : "/api/v1/workflows/pending";
    return apiClient.request<any>(suffix, { method: "GET" });
  },
  approveInstance: (instanceId: number) => {
    return apiClient.request(`/api/v1/workflows/${instanceId}/approve`, { method: "POST" });
  },
  rejectInstance: (instanceId: number) => {
    return apiClient.request(`/api/v1/workflows/${instanceId}/reject`, { method: "POST" });
  },
  commentInstance: (instanceId: number, userId: number, comment: string) => {
    return apiClient.request(`/api/v1/workflows/${instanceId}/comment`, {
      method: "POST",
      body: JSON.stringify({ instance_id: instanceId, action: "comment", user_id: userId, comment }),
    });
  },
  escalate: (instanceId: number, comment?: string) => {
    const q = comment ? `?comment=${encodeURIComponent(comment)}` : "";
    return apiClient.request(`/api/v1/workflows/${instanceId}/escalate${q}`, { method: "POST" });
  },
};
