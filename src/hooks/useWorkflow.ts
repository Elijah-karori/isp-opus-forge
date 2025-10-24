// src/hooks/useWorkflow.ts
import { useState, useEffect } from "react";
import { workflowsApi } from "@/api/workflows";

export function usePendingWorkflows(role?: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await workflowsApi.listPending(role);
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refresh(); }, [role]);
  return { items, loading, refresh };
}
