import apiClient from "@/lib/apiClient";

export async function fetchPendingWorkflows() {
  const res = await apiClient.get("/workflows/pending");
  return res.data;
}

export async function getWorkflowDetails(id: number) {
  const res = await apiClient.get(`/workflows/${id}`);
  return res.data;
}

export async function performWorkflowAction(id: number, action: "approve" | "reject" | "escalate", comment?: string) {
  const res = await apiClient.post(`/workflows/${id}/${action}`, {
    comment,
  });
  return res.data;
}
