// src/hooks/useWorkflow.ts
import { useState, useEffect } from "react";
import { workflowsApi } from "@/api/workflows";

export function usePendingWorkflows(role?: string, enabled: boolean = true) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await workflowsApi.listPending(role);
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (enabled) {
      refresh();
    }
  }, [role, enabled]);
  return { items, loading, refresh };
}

// Export alias for backward compatibility
export const useWorkflow = usePendingWorkflows;
