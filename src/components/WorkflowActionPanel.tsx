import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { performWorkflowAction } from "@/api/workflow";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";

export function WorkflowActionPanel({ instanceId }: { instanceId: number }) {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const actionMutation = useMutation({
    mutationFn: (action: "approve" | "reject" | "comment") =>
      performWorkflowAction({ instance_id: instanceId, action, comment }),
    onSuccess: (_, action) => {
      toast({
        title: "Success",
        description: `Action '${action}' completed successfully`,
      });
      setComment("");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to perform action",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
      <Textarea
        placeholder="Add a comment (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[80px]"
      />
      <div className="flex gap-2">
        <Button
          onClick={() => actionMutation.mutate("approve")}
          disabled={actionMutation.isPending}
          variant="default"
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve
        </Button>
        <Button
          onClick={() => actionMutation.mutate("reject")}
          disabled={actionMutation.isPending}
          variant="destructive"
          className="flex-1"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reject
        </Button>
        <Button
          onClick={() => actionMutation.mutate("comment")}
          disabled={actionMutation.isPending || !comment.trim()}
          variant="outline"
          className="flex-1"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Comment
        </Button>
      </div>
    </div>
  );
}
