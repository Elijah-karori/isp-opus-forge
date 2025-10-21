// src/components/WorkflowActionPanel.tsx
import React, { useState } from "react";
import { performWorkflowAction } from "@/api/workflow";

type Props = {
  instanceId: number | null | undefined;
  onActionComplete?: (updatedInstance?: any) => void;
  allowApprove?: boolean; // optional quick control
  allowReject?: boolean;
  allowComment?: boolean;
  // optional check to hide panel if instanceId missing
};

export default function WorkflowActionPanel({
  instanceId,
  onActionComplete,
  allowApprove = true,
  allowReject = true,
  allowComment = true,
}: Props) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const disabled = !instanceId;

  const doAction = async (action: "approve" | "reject" | "comment") => {
    if (disabled) return;
    setLoading(true);
    try {
      const payload = {
        instance_id: instanceId!,
        action,
        comment: comment || undefined,
      };
      const updated = await performWorkflowAction(payload);
      setComment("");
      onActionComplete?.(updated);
    } catch (err: any) {
      console.error("Workflow action failed", err?.response?.data ?? err);
      // Optionally show toast/error - integrate with your notification system
      alert(err?.response?.data?.detail || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mt-4 max-w-2xl">
      <h4 className="text-lg font-semibold mb-2">Workflow</h4>
      <textarea
        value={comment}
        placeholder="Add a comment (optional)"
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full border rounded-md p-2 mb-3 text-sm"
      />
      <div className="flex gap-3">
        <button
          onClick={() => doAction("approve")}
          disabled={loading || disabled || !allowApprove}
          className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Working..." : "Approve"}
        </button>

        <button
          onClick={() => doAction("reject")}
          disabled={loading || disabled || !allowReject}
          className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Working..." : "Reject"}
        </button>

        <button
          onClick={() => doAction("comment")}
          disabled={loading || disabled || !allowComment}
          className="px-3 py-2 rounded-md border bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Add comment
        </button>
      </div>
    </div>
  );
}
