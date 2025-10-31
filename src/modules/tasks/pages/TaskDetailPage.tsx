
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { taskApi } from "@/modules/tasks/services/taskApi";
import TaskFormModal from "./TaskFormModal";
import TaskBOMModal from "./TaskBOMModal";

export default function TaskDetailPage() {
  const { id } = useParams();
  const { data: task, isLoading, isError } = useQuery(
    ["task", id],
    () => taskApi.getTask(id)
  );

  if (isLoading) {
    return <div>Loading task details...</div>;
  }

  if (isError) {
    return <div>Error fetching task details.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{task.title}</h1>
      <p>{task.description}</p>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Bill of Materials</h2>
        {/* BOM table goes here */}
      </div>

      <div className="mt-8">
        <TaskFormModal task={task} />
        <TaskBOMModal taskId={task.id} />
      </div>
    </div>
  );
}
