
import React, { useState } from "react";
import { Modal, Button, Input, Textarea } from "@/components/ui";
import { useTasks } from "../hooks/useTasks";

export default function TaskFormModal({ task }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(task);
  const { updateTask } = useTasks();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateTask.mutate(formData);
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Edit Task</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Task">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task Title"
            />
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task Description"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
