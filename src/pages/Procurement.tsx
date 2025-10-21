import { useQuery } from "@tanstack/react-query";
import { getPurchaseOrders } from "@/api/procurement";
import { WorkflowActionPanel } from "@/components/WorkflowActionPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export default function Procurement() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: getPurchaseOrders,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading purchase orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No pending purchase orders</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Order #{order.id}</CardTitle>
                    <CardDescription>Supplier ID: {order.supplier_id}</CardDescription>
                  </div>
                  <Badge variant={order.status === "pending" ? "secondary" : "default"}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <span className="font-medium">Total Amount:</span> ${order.total_amount}
                </div>

                {order.workflow_instance_id && (
                  <WorkflowActionPanel instanceId={order.workflow_instance_id} />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
