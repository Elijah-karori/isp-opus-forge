// src/api/workflow.ts - Workflow API functions
import api from "./axios";

export type WorkflowActionPayload = {
  instance_id: number;
  action: "approve" | "reject" | "comment";
  comment?: string | null;
};

export async function getPendingWorkflows() {
  const res = await api.get("/workflows/pending");
  return res.data;
}

export async function performWorkflowAction(payload: WorkflowActionPayload) {
  const res = await api.post("/workflow/actions", payload);
  return res.data;
}
