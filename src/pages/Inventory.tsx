// src/pages/Inventory.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  searchInventory, 
  getProducts, 
  triggerSupplierScrape, 
  getProductPriceHistory,
  getSuppliers,
  getInventoryStats,
  getLowStockAlerts,
  scrapeAllSuppliers,
  type Product,
  type Supplier
} from '@/api/inventory';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Package, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data with React Query
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(),
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiClient.getSuppliers(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => getInventoryStats(),
  });

  const { data: lowStockAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: () => getLowStockAlerts(),
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: searchInventory,
    onSuccess: (data) => {
      // Handle search results
      console.log('Search results:', data);
    },
  });

  // Scraper mutation
  const scrapeMutation = useMutation({
    mutationFn: scrapeAllSuppliers,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Price scraping completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger scraping",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const handleScrapeAll = () => {
    scrapeMutation.mutate();
  };

  const isLoading = productsLoading || suppliersLoading || statsLoading || alertsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const productList = Array.isArray(products) ? products : [];
  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const lowStockProducts = productList.filter((p: Product) => p.stock_quantity <= p.reorder_point);
  const outOfStockProducts = productList.filter((p: Product) => p.stock_quantity === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage products, stock levels, and supplier pricing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleScrapeAll} 
            disabled={scrapeMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            {scrapeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Update Prices
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={searchMutation.isPending}>
          {searchMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </Button>
      </form>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productList.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Needs reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Urgent attention needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierList.length}</div>
            <p className="text-xs text-muted-foreground">
              Price monitoring enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Products</CardTitle>
          <Badge variant="outline" className="ml-2">
            {productList.length} items
          </Badge>
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
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productList.map((product: Product) => {
                const isLowStock = product.stock_quantity <= product.reorder_point;
                const isOutOfStock = product.stock_quantity === 0;
                const supplier = supplierList.find((s: Supplier) => s.id === product.supplier_id);

                return (
                  <TableRow key={product.id} className={isOutOfStock ? 'bg-red-50' : ''}>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className={isLowStock ? 'text-destructive font-semibold' : ''}>
                      {product.stock_quantity} {product.unit}
                    </TableCell>
                    <TableCell>{product.reorder_point} {product.unit}</TableCell>
                    <TableCell>${product.unit_price}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {supplier?.name || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isOutOfStock ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Low Stock
                        </Badge>
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
          
          {productList.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Supplier Price Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Monitor supplier prices and trigger price updates
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleScrapeAll}
                disabled={scrapeMutation.isPending}
              >
                {scrapeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh All Prices
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierList.map((supplier: Supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {supplier.contact_email && <div>{supplier.contact_email}</div>}
                        {supplier.contact_phone && <div className="text-muted-foreground">{supplier.contact_phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.website ? (
                        <a 
                          href={supplier.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {supplier.website}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.is_active ? "default" : "secondary"}>
                        {supplier.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => triggerSupplierScrape(supplier.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Update Prices
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
