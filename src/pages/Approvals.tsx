// src/pages/Approvals.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingWorkflows } from "@/hooks/useWorkflow";
import { WorkflowOverlay } from "@/components/WorkflowOverlay";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const { items, loading, refresh } = usePendingWorkflows(user?.role, !!user);
  const [active, setActive] = React.useState<number | null>(null);

  return (
    <div>
      <h1>Pending Approvals</h1>
      {loading && <div>Loading...</div>}
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            #{i.id} — {i.related_model} #{i.related_id}
            <button onClick={() => setActive(i.id)}>Open</button>
          </li>
        ))}
      </ul>

      {active && <WorkflowOverlay instanceId={active} onClose={() => { setActive(null); refresh(); }} onActionComplete={() => refresh()} />}
    </div>
  );
}
