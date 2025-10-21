import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { performWorkflowAction } from "@/api/workflow"; // backend integration

export function WorkflowActionPanel({ instanceId }: { instanceId: number }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "approve" | "reject" | "comment") => {
    setLoading(true);
    try {
      await performWorkflowAction({ instance_id: instanceId, action, comment });
      alert(`Action '${action}' completed successfully`);
      setComment("");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 border rounded-md space-y-3">
      <Textarea
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={() => handleAction("approve")} disabled={loading} className="bg-green-600">
          Approve
        </Button>
        <Button onClick={() => handleAction("reject")} disabled={loading} className="bg-red-600">
          Reject
        </Button>
        <Button onClick={() => handleAction("comment")} disabled={loading} className="bg-blue-600">
          Comment
        </Button>
      </div>
    </div>
  );
}
