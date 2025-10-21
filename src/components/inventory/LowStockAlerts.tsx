// src/components/inventory/LowStockAlerts.tsx
import { useQuery } from '@tanstack/react-query';
import { getLowStockAlerts } from '@/api/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, ShoppingCart } from 'lucide-react';

export function LowStockAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: getLowStockAlerts,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const alertList = Array.isArray(alerts) ? alerts : [];

  if (isLoading || alertList.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800 text-lg">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alerts
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            {alertList.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alertList.slice(0, 5).map((alert: any) => (
            <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="font-medium">{alert.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Stock: {alert.stock_quantity} • Reorder at: {alert.reorder_point}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                Urgent
              </Badge>
            </div>
          ))}
          {alertList.length > 5 && (
            <div className="text-center text-sm text-orange-700 pt-2">
              +{alertList.length - 5} more items need attention
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
