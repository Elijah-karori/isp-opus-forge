import { useQuery } from '@tanstack/react-query';
import { inventoryServicesApi } from '@/api/procurementServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart } from '@/components/charts';
import {
    Package,
    AlertTriangle,
    TrendingDown,
    DollarSign,
    Calendar,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function InventoryAnalyticsDashboard() {
    // Low Stock Products
    const { data: lowStock, isLoading: lowStockLoading } = useQuery({
        queryKey: ['low-stock-products'],
        queryFn: () => inventoryServicesApi.getLowStockProducts(1.0),
    });

    // Reorder Predictions
    const { data: reorderPredictions, isLoading: predictionsLoading } = useQuery({
        queryKey: ['reorder-predictions'],
        queryFn: () => inventoryServicesApi.getReorderPredictions(),
    });

    // Inventory Turnover
    const { data: turnover, isLoading: turnoverLoading } = useQuery({
        queryKey: ['inventory-turnover'],
        queryFn: () => inventoryServicesApi.getInventoryTurnover(90),
    });

    // Dead Stock
    const { data: deadStock, isLoading: deadStockLoading } = useQuery({
        queryKey: ['dead-stock'],
        queryFn: () => inventoryServicesApi.identifyDeadStock(90),
    });

    // Inventory Valuation
    const { data: valuation, isLoading: valuationLoading } = useQuery({
        queryKey: ['inventory-valuation'],
        queryFn: () => inventoryServicesApi.getInventoryValuation(),
    });

    const isLoading =
        lowStockLoading ||
        predictionsLoading ||
        turnoverLoading ||
        deadStockLoading ||
        valuationLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const lowStockData = lowStock?.data || [];
    const predictionData = reorderPredictions?.data || [];
    const turnoverData = turnover?.data || [];
    const deadStockData = deadStock?.data || [];
    const valuationData = valuation?.data || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Inventory Analytics</h2>
                <p className="text-muted-foreground">
                    Real-time inventory insights and optimization recommendations
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            KES {valuationData.total_value?.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {valuationData.total_items || 0} unique products
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{lowStockData.length}</div>
                        <p className="text-xs text-muted-foreground">Require reordering</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dead Stock</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{deadStockData.length}</div>
                        <p className="text-xs text-muted-foreground">
                            KES {deadStockData.reduce((sum, item) => sum + (item.total_value || 0), 0).toLocaleString()} value
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reorder Soon</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {predictionData.filter((p) => p.reorder_needed).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Within next 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alert */}
            {lowStockData.length > 0 && (
                <Card className="border-orange-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                            <AlertTriangle className="h-5 w-5" />
                            Low Stock Alert ({lowStockData.length} items)
                        </CardTitle>
                        <CardDescription>Products below reorder level</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {lowStockData.slice(0, 5).map((product: any) => (
                                <div
                                    key={product.product_id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/20"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{product.product_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {product.supplier || 'No supplier'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Current Stock</p>
                                            <p className="font-bold text-orange-600">
                                                {product.quantity_in_stock} / {product.reorder_level}
                                            </p>
                                        </div>
                                        <Button size="sm">
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Reorder
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {lowStockData.length > 5 && (
                            <div className="mt-4 flex justify-end">
                                <Link to="/inventory?filter=low-stock">
                                    <Button variant="outline">View All Low Stock Items</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Inventory Turnover */}
            {turnoverData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Turnover Analysis</CardTitle>
                        <CardDescription>Product velocity and performance (Last 90 days)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={turnoverData.slice(0, 10).map((item: any) => ({
                                product: item.product_name,
                                turnover: item.turnover_ratio,
                                stock: item.current_stock,
                            }))}
                            xKey="product"
                            yKeys={[
                                { key: 'turnover', label: 'Turnover Ratio', color: 'hsl(var(--chart-1))' },
                            ]}
                            height={300}
                        />
                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Fast Moving</p>
                                <p className="font-bold">
                                    {turnoverData.filter((item) => item.velocity === 'fast').length} items
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Medium Moving</p>
                                <p className="font-bold">
                                    {turnoverData.filter((item) => item.velocity === 'medium').length} items
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Slow Moving</p>
                                <p className="font-bold">
                                    {turnoverData.filter((item) => item.velocity === 'slow').length} items
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Dead Stock */}
            {deadStockData.length > 0 && (
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <TrendingDown className="h-5 w-5" />
                            Dead Stock ({deadStockData.length} items)
                        </CardTitle>
                        <CardDescription>
                            Products with no usage in last 90 days - Consider liquidation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {deadStockData.slice(0, 5).map((item: any) => (
                                <div
                                    key={item.product_id}
                                    className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                    <div>
                                        <p className="font-medium">{item.product_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.days_since_last_use} days unused
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">Qty: {item.quantity_in_stock}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Value: KES {item.total_value?.toLocaleString()}
                                        </p>
                                        <Badge variant="outline" className="mt-1">
                                            {item.recommendation}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
