import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingWorkflows } from "@/hooks/useWorkflow";
import { WorkflowOverlay } from "@/components/WorkflowOverlay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const { items, loading, refresh } = usePendingWorkflows(user?.role, !!user);
  const [active, setActive] = useState<number | null>(null);

  const getTimeSince = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const groupedItems = items.reduce((acc: any, item: any) => {
    const type = item.related_model || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground mt-2">Review and approve workflow requests</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading approvals...</div>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No pending approvals</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All ({items.length})
            </TabsTrigger>
            {Object.keys(groupedItems).map((type) => (
              <TabsTrigger key={type} value={type}>
                {type} ({groupedItems[type].length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {items.map((item: any) => (
              <Card key={item.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">
                          {item.related_model} #{item.related_id}
                        </h4>
                        <Badge variant="outline">ID: {item.id}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeSince(item.updated_at)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      onClick={() => setActive(item.id)}
                    >
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {Object.entries(groupedItems).map(([type, typeItems]: [string, any]) => (
            <TabsContent key={type} value={type} className="space-y-3">
              {typeItems.map((item: any) => (
                <Card key={item.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">
                            {item.related_model} #{item.related_id}
                          </h4>
                          <Badge variant="outline">ID: {item.id}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeSince(item.updated_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        onClick={() => setActive(item.id)}
                      >
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {active && (
        <WorkflowOverlay
          instanceId={active}
          onClose={() => {
            setActive(null);
            refresh();
          }}
          onActionComplete={() => refresh()}
        />
      )}
    </div>
  );
}
