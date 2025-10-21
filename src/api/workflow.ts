// src/api/workflow.ts
import api from "./axios";

export type WorkflowActionPayload = {
  instance_id: number;
  action: "approve" | "reject" | "comment";
  comment?: string | null;
};

export async function performWorkflowAction(payload: WorkflowActionPayload) {
  const res = await api.post("/workflow/actions", payload);
  return res.data;
}
