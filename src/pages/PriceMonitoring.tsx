import { useQuery } from "@tanstack/react-query";
import { getRecentPriceDrops } from "@/api/scrapers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, DollarSign } from "lucide-react";

export default function PriceMonitoring() {
  const { data: priceDrops = [], isLoading } = useQuery({
    queryKey: ["priceDrops"],
    queryFn: getRecentPriceDrops,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading price data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingDown className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Price Monitoring</h1>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Price Drops
            </CardTitle>
          </CardHeader>
          <CardContent>
            {priceDrops.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent price drops</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Old Price</TableHead>
                    <TableHead>New Price</TableHead>
                    <TableHead>Drop</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceDrops.map((drop: any, index: number) => {
                    const priceDrop = drop.old_price - drop.new_price;
                    const dropPercent = ((priceDrop / drop.old_price) * 100).toFixed(1);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{drop.product_name}</TableCell>
                        <TableCell>{drop.supplier_name}</TableCell>
                        <TableCell>${drop.old_price.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ${drop.new_price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-600">
                            -{dropPercent}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(drop.scraped_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
