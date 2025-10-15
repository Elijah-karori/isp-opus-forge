import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, AlertTriangle } from 'lucide-react';

const Inventory = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(),
  });

  const lowStockProducts = Array.isArray(products) ? products.filter((p: any) => p.stock_quantity <= p.reorder_point) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Manage products and stock levels</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(products) ? products.length : 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Reorder Point</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(products) && products.map((product: any) => {
                const isLowStock = product.stock_quantity <= product.reorder_point;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className={isLowStock ? 'text-destructive font-semibold' : ''}>
                      {product.stock_quantity} {product.unit}
                    </TableCell>
                    <TableCell>{product.reorder_point} {product.unit}</TableCell>
                    <TableCell>${product.unit_price}</TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
