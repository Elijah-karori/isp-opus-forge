import { useEffect, useState } from "react";
import { getPendingWorkflows } from "@/api/workflow";
import { WorkflowActionPanel } from "@/components/WorkflowActionPanel";

export default function Workflows() {
  const [instances, setInstances] = useState([]);

  useEffect(() => {
    getPendingWorkflows().then(setInstances);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Pending Workflows</h1>
      <div className="space-y-4">
        {instances.map((inst) => (
          <div key={inst.id} className="p-4 border rounded-md shadow-sm">
            <p><b>Model:</b> {inst.related_model}</p>
            <p><b>Status:</b> {inst.status}</p>
            <WorkflowActionPanel instanceId={inst.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
