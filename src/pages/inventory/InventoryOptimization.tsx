/**
 * Inventory Optimization Dashboard
 * AI-powered inventory management with reorder predictions
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryServicesApi } from '@/api/procurementServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Package, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InventoryOptimization() {
    const { data: lowStockProducts, isLoading: loadingLowStock } = useQuery({
        queryKey: ['inventory', 'low-stock'],
        queryFn: () => inventoryServicesApi.getLowStockProducts(1.0),
    });

    const { data: reorderPredictions, isLoading: loadingPredictions } = useQuery({
        queryKey: ['inventory', 'reorder-predictions'],
        queryFn: () => inventoryServicesApi.getReorderPredictions(),
    });

    const { data: deadStock, isLoading: loadingDeadStock } = useQuery({
        queryKey: ['inventory', 'dead-stock'],
        queryFn: () => inventoryServicesApi.identifyDeadStock(90),
    });

    const { data: turnoverAnalysis, isLoading: loadingTurnover } = useQuery({
        queryKey: ['inventory', 'turnover'],
        queryFn: () => inventoryServicesApi.getInventoryTurnover(90),
    });

    const { data: valuation } = useQuery({
        queryKey: ['inventory', 'valuation'],
        queryFn: () => inventoryServicesApi.getInventoryValuation(),
    });

    if (loadingLowStock || loadingPredictions || loadingDeadStock || loadingTurnover) {
        return (
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Inventory Optimization</h1>
                <div className="grid gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Inventory Optimization</h1>
                <div className="text-sm text-muted-foreground">
                    AI-Powered Analytics
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-warning">
                            {lowStockProducts?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Need immediate reorder</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dead Stock</CardTitle>
                        <TrendingDown className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {deadStock?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Items not used in 90+ days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            KES {valuation?.total_value?.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Current inventory value</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Turnover</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {turnoverAnalysis && turnoverAnalysis.length > 0
                                ? (turnoverAnalysis.reduce((sum: number, item: any) => sum + item.turnover_ratio, 0) / turnoverAnalysis.length).toFixed(1)
                                : '0'}x
                        </div>
                        <p className="text-xs text-muted-foreground">Last 90 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts && lowStockProducts.length > 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {lowStockProducts.length} products are below reorder threshold. Immediate action required.
                    </AlertDescription>
                </Alert>
            )}

            {/* Reorder Predictions */}
            <Card>
                <CardHeader>
                    <CardTitle>AI Reorder Predictions</CardTitle>
                    <CardDescription>Products predicted to need reordering soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Current Stock</TableHead>
                                <TableHead>Reorder Level</TableHead>
                                <TableHead>Usage Rate</TableHead>
                                <TableHead>Days Until Reorder</TableHead>
                                <TableHead>Recommended Qty</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reorderPredictions && reorderPredictions.length > 0 ? (
                                reorderPredictions.filter((pred: any) => pred.reorder_needed || pred.days_until_reorder < 30).map((prediction: any) => (
                                    <TableRow key={prediction.product_id}>
                                        <TableCell className="font-medium">{prediction.product_name}</TableCell>
                                        <TableCell>{prediction.current_stock}</TableCell>
                                        <TableCell>{prediction.reorder_level}</TableCell>
                                        <TableCell>{prediction.usage_rate_per_day.toFixed(2)}/day</TableCell>
                                        <TableCell>
                                            <Badge variant={prediction.days_until_reorder < 7 ? 'destructive' : 'secondary'}>
                                                {Math.round(prediction.days_until_reorder)} days
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{prediction.recommended_order_qty}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline">Auto-Order</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        All products are well-stocked
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dead Stock */}
            {deadStock && deadStock.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Dead Stock Analysis</CardTitle>
                        <CardDescription>Items with no recent usage - consider liquidation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Value</TableHead>
                                    <TableHead>Total Value</TableHead>
                                    <TableHead>Days Since Use</TableHead>
                                    <TableHead>Recommendation</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deadStock.map((item: any) => (
                                    <TableRow key={item.product_id}>
                                        <TableCell className="font-medium">{item.product_name}</TableCell>
                                        <TableCell>{item.supplier}</TableCell>
                                        <TableCell>{item.quantity_in_stock}</TableCell>
                                        <TableCell>KES {item.unit_value.toLocaleString()}</TableCell>
                                        <TableCell className="font-semibold">KES {item.total_value.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="destructive">{item.days_since_last_use}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.recommendation}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
