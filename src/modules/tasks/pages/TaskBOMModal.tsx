
import React, { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { useTasks } from "../hooks/useTasks";

export default function TaskBOMModal({ taskId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [materialName, setMaterialName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addTaskMaterial } = useTasks();

  const handleSubmit = (e) => {
    e.preventDefault();
    addTaskMaterial.mutate({ taskId, materialName, quantity });
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Material</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Material">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Input
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="Material Name"
            />
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              placeholder="Quantity"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
