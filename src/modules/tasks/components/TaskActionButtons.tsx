
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function TaskActionButtons({ task }) {
  const { user } = useAuth();

  const canApprove = user.role === 'admin' || user.role === 'finance';
  const canRequestParts = user.role === 'technician';
  const canMarkComplete = user.role === 'technician';

  return (
    <div className="flex gap-2">
      {canApprove && task.status === 'pending_approval' && (
        <Button>Approve</Button>
      )}
      {canRequestParts && task.status === 'in_progress' && (
        <Button>Request Parts</Button>
      )}
      {canMarkComplete && task.status === 'in_progress' && (
        <Button>Mark as Complete</Button>
      )}
    </div>
  );
}
