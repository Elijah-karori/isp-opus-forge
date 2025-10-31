import React from "react";
import { Progress } from "@/components/ui/progress";

export function WorkflowStatusBar({ stageIndex, totalStages }: { stageIndex: number, totalStages: number}) {
  const percent = (stageIndex / totalStages) * 100;
  return (
    <div>
      <div className="flex justify-between mb-1 text-sm text-gray-600">
        <span>Stage {stageIndex} / {totalStages}</span>
        <span>{percent.toFixed(0)}%</span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
