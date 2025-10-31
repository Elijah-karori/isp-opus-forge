
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TaskActionButtons from "./TaskActionButtons";
import WorkflowStatusBar from "./WorkflowStatusBar";

export default function TaskCard({ task }) {
  return (
    <Card className="p-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">{task.title}</h2>
        <Badge>{task.status}</Badge>
      </div>
      <p className="text-gray-600">{task.description}</p>
      <WorkflowStatusBar status={task.status} />
      <div className="mt-4 flex justify-end">
        <TaskActionButtons task={task} />
      </div>
    </Card>
  );
}
