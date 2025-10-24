// src/components/WorkflowOverlay.tsx
import React, { useState } from "react";
import { workflowsApi } from "@/api/workflows";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  instanceId: number;
  onClose: () => void;
  onActionComplete?: () => void;
}

export const WorkflowOverlay: React.FC<Props> = ({ instanceId, onClose, onActionComplete }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const perform = async (action: "approve" | "reject") => {
    setLoading(true);
    setError(null);
    try {
      if (action === "approve") {
        await workflowsApi.approveInstance(instanceId);
      } else {
        await workflowsApi.rejectInstance(instanceId);
      }
      if (comment.trim()) {
        // attach comment
        await workflowsApi.commentInstance(instanceId, user?.id ?? 0, comment.trim());
      }
      onActionComplete?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">Workflow Action</h3>
        <p className="text-sm text-gray-600 mt-2">Instance #{instanceId} — leave an optional comment below.</p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full mt-4 border p-2 rounded"
          placeholder="Add comment (optional)"
        />

        {error && <div className="text-red-600 mt-2">{error}</div>}

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={() => perform("reject")} disabled={loading}>Reject</button>
          <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={() => perform("approve")} disabled={loading}>Approve</button>
        </div>
      </div>
    </div>
  );
};
