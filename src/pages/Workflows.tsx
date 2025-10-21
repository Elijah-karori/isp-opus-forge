import { useQuery } from "@tanstack/react-query";
import { getPendingWorkflows } from "@/api/workflow";
import { WorkflowActionPanel } from "@/components/WorkflowActionPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch } from "lucide-react";

export default function Workflows() {
  const { data: instances = [], isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: getPendingWorkflows,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading workflows...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <GitBranch className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Pending Workflows</h1>
      </div>

      <div className="grid gap-4">
        {instances.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No pending workflows</p>
            </CardContent>
          </Card>
        ) : (
          instances.map((inst: any) => (
            <Card key={inst.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      {inst.related_model} #{inst.related_id}
                    </CardTitle>
                    <CardDescription>Instance ID: {inst.id}</CardDescription>
                  </div>
                  <Badge variant={inst.status === "pending" ? "secondary" : "default"}>
                    {inst.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <WorkflowActionPanel instanceId={inst.id} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
