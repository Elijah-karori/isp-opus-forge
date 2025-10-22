// src/pages/Procurement.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getSuppliers, 
  getPurchaseOrders, 
  createSupplier,
  triggerSupplierScrape,
  scrapeGenericUrl,
  getProcurementStats,
  type Supplier,
  type PurchaseOrder,
  type ScrapedProduct
} from '@/api/procurement';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Search, 
  Plus, 
  RefreshCw, 
  ShoppingCart, 
  Building, 
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GenericScraper } from '@/components/procurement/GenericScraper';
import { SupplierManagement } from '@/components/procurement/SupplierManagement';
import { PurchaseOrders } from '@/components/procurement/PurchaseOrders';

const Procurement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showScraper, setShowScraper] = useState(false);

  // Fetch procurement data
  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => getSuppliers(),
  });

  const { data: purchaseOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => apiClient.getPurchases(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['procurement-stats'],
    queryFn: () => getProcurementStats(),
  });

  // Scraper mutations
  const scrapeMutation = useMutation({
    mutationFn: scrapeGenericUrl,
    onSuccess: (data) => {
      toast({
        title: "Scraping Completed",
        description: `Found ${data.data?.length || 0} products`,
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to scrape products",
        variant: "destructive",
      });
    },
  });

  const scrapeAllMutation = useMutation({
    mutationFn: () => apiClient.scrapeAllSuppliers(),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All supplier prices updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update prices",
        variant: "destructive",
      });
    },
  });

  const handleScrapeAll = () => {
    scrapeAllMutation.mutate();
  };

  const isLoading = suppliersLoading || ordersLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const supplierList = suppliers?.data || [];
  const orderList = Array.isArray(purchaseOrders) ? purchaseOrders : [];
  const statsData = stats?.data || {};

  const pendingOrders = orderList.filter((order: PurchaseOrder) => 
    ['draft', 'submitted'].includes(order.status)
  );
  const activeSuppliers = supplierList.filter((supplier: Supplier) => supplier.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement</h1>
          <p className="text-muted-foreground">
            Manage suppliers, purchase orders, and price monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowScraper(true)}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Web Scraper
          </Button>
          <Button 
            onClick={handleScrapeAll}
            disabled={scrapeAllMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            {scrapeAllMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Update All Prices
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statsData.monthly_spend?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              -5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${statsData.cost_savings?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              From price monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Suppliers
            <Badge variant="outline" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeSuppliers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
            {pendingOrders.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {pendingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Intel
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <ProcurementDashboard />
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <SupplierManagement />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <PurchaseOrders />
        </TabsContent>

        {/* Pricing Intelligence Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <PricingIntelligence />
        </TabsContent>
      </Tabs>

      {/* Generic Scraper Modal */}
      {showScraper && (
        <GenericScraper 
          onClose={() => setShowScraper(false)}
          onScrapeComplete={(products) => {
            console.log('Scraped products:', products);
            setShowScraper(false);
          }}
        />
      )}
    </div>
  );
};

// Additional components for the Procurement page
const ProcurementDashboard = () => {
  const { data: recentOrders, isLoading } = useQuery({
    queryKey: ['recent-purchase-orders'],
    queryFn: () => apiClient.getPurchases({ limit: 5 }),
  });

  const { data: supplierPerformance } = useQuery({
    queryKey: ['supplier-performance'],
    queryFn: () => apiClient.getSupplierPerformance(),
  });

  const orderList = Array.isArray(recentOrders) ? recentOrders : [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderList.slice(0, 5).map((order: PurchaseOrder) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    order.status === 'approved' ? 'bg-green-100 text-green-600' :
                    order.status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'received' ? 'bg-gray-100 text-gray-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Order #{order.order_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.supplier?.name} • ${order.total_amount?.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    order.status === 'approved' ? 'default' :
                    order.status === 'submitted' ? 'secondary' :
                    'outline'
                  }>
                    {order.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.order_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {orderList.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Suppliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Tech Supplies Co.', rating: 4.8, orders: 45, reliability: '98%' },
              { name: 'Network Gear Pro', rating: 4.6, orders: 32, reliability: '95%' },
              { name: 'Cable Masters', rating: 4.5, orders: 28, reliability: '96%' },
              { name: 'Electro Components', rating: 4.3, orders: 22, reliability: '92%' },
            ].map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {supplier.orders} orders • {supplier.reliability} reliable
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <span className="font-semibold">{supplier.rating}</span>
                    <span>★</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PricingIntelligence = () => {
  const { data: priceDrops, isLoading } = useQuery({
    queryKey: ['recent-price-drops'],
    queryFn: () => apiClient.getRecentPriceDrops(),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Recent Price Drops
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Old Price</TableHead>
                  <TableHead>New Price</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead>Drop %</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Array.isArray(priceDrops) ? priceDrops : (Array.isArray((priceDrops as any)?.data) ? (priceDrops as any).data : [])).slice(0, 10).map((drop: any) => (
                  <TableRow key={drop.id}>
                    <TableCell className="font-medium">{drop.product_name}</TableCell>
                    <TableCell>{drop.supplier_name}</TableCell>
                    <TableCell>${drop.old_price}</TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      ${drop.new_price}
                    </TableCell>
                    <TableCell className="text-green-600">
                      ${(drop.old_price - drop.new_price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        -{drop.price_change_percent}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(drop.recorded_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Procurement;
