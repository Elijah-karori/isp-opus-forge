
import React from "react";
import { useTasks } from "@/modules/tasks/hooks/useTasks";
import TaskCard from "@/modules/tasks/components/TaskCard";

export default function TaskListPage() {
  const { data: tasks, isLoading, isError } = useTasks();

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (isError) {
    return <div>Error fetching tasks.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Task List</h1>
      <div className="grid gap-4">
        {tasks && Array.isArray(tasks) && tasks.map((task: any) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
