import React, { useEffect, useState } from "react";
import { fetchPendingWorkflows, performWorkflowAction } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WorkflowInstanceRead {
    id: number;
    workflow_id: number;
    related_model: string;
    related_id: number;
    status: string;
    created_at: string;
    updated_at: string | null;
    current_stage_id: number | null;
    current_stage?: { name: string };
}


export default function WorkflowDashboard() {
  const [workflows, setWorkflows] = useState<WorkflowInstanceRead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const data = await fetchPendingWorkflows();
            setWorkflows(data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch pending workflows. Please check your network connection and try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    loadWorkflows();
  }, []);

  async function handleAction(id: number, action: "approve" | "reject") {
    try {
        await performWorkflowAction(id, action);
        setWorkflows(workflows.filter(w => w.id !== id));
    } catch (err) {
        setError(`Failed to ${action} workflow. Please try again.`);
        console.error(err);
    }
  }

  if (loading) {
    return <div className="p-6">Loading workflows...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Pending Approvals</h1>

      {error && (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && workflows.length === 0 && (
        <Card>
            <CardContent className="p-6">
                <p className="text-gray-500 text-center">No pending workflows 🎉</p>
            </CardContent>
        </Card>
      )}

      {workflows.map((w) => (
        <Card key={w.id}>
            <CardHeader>
                <CardTitle className="text-lg">{w.related_model} #{w.related_id}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Stage: {w.current_stage?.name || 'N/A'}</p>
                 <p className="text-sm text-gray-500">Status: {w.status}</p>
              </div>
              <div className="space-x-2">
                <Button onClick={() => handleAction(w.id, "approve")} className="bg-green-600 text-white">Approve</Button>
                <Button onClick={() => handleAction(w.id, "reject")} className="bg-red-500 text-white">Reject</Button>
              </div>
            </CardContent>
        </Card>
      ))}
    </div>
  );
}
