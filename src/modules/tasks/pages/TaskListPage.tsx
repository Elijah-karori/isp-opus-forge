import React from "react";
import { useTasks } from "../hooks/useTasks";
import { Card, Button, Badge } from "@/components/ui";

export default function TaskListPage() {
  const { tasks } = useTasks();

  if (tasks.isLoading) return <p>Loading...</p>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {tasks.data?.data.map((task: any) => (
        <Card key={task.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
            </div>
            <Badge variant="outline">{task.status}</Badge>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button size="sm" variant="outline">View</Button>
            <Button size="sm" variant="secondary">Update BOM</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
