import React from "react";
import { Card, Progress } from "@/components/ui";

export default function KPIProgressCard({ kpi }: { kpi: any }) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Technician KPI</h3>
      <p>Tasks Completed: {kpi.tasks_completed}</p>
      <p>On-Time Rate: {kpi.on_time_rate}%</p>
      <p>CSAT Score: {kpi.csat_score}%</p>
      <Progress value={Number(kpi.total_score)} />
    </Card>
  );
}
