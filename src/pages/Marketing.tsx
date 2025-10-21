import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCampaigns } from "@/api/marketing";
import { WorkflowActionPanel } from "@/components/WorkflowActionPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

export default function Marketing() {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
      </div>

      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No campaigns found</p>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign: any) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </div>
                  <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Budget:</span> ${campaign.budget}
                  </div>
                  <div>
                    <span className="font-medium">Conversions:</span>{" "}
                    {campaign.actual_conversions} / {campaign.target_leads}
                  </div>
                </div>

                {campaign.workflow_instance_id && (
                  <WorkflowActionPanel instanceId={campaign.workflow_instance_id} />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
