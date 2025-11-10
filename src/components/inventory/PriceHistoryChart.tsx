// src/components/inventory/PriceHistoryChart.tsx
import { useQuery } from '@tanstack/react-query';
import { getProductPriceHistory } from '@/api/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceHistoryChartProps {
  productId: number;
  productName: string;
}

export function PriceHistoryChart({ productId, productName }: PriceHistoryChartProps) {
  const { data: priceHistory, isLoading } = useQuery({
    queryKey: ['price-history', productId],
    queryFn: () => getProductPriceHistory(productId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const historyData = Array.isArray(priceHistory) ? priceHistory : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Price History - {productName}
          {historyData.length > 0 && (
            historyData[0].price_change >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {historyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="recorded_at" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
              />
              <Line 
                type="monotone" 
                dataKey="new_price" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No price history available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
