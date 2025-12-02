/**
 * Smart Product Search Page
 * Advanced product search with price comparison across suppliers
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { procurementServicesApi } from '@/api/procurementServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingDown, TrendingUp, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SmartProductSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [useScrapers, setUseScrapers] = useState(false);
    const [searchTriggered, setSearchTriggered] = useState(false);

    const { data: searchResults, isLoading, refetch } = useQuery({
        queryKey: ['products', 'search', searchQuery, useScrapers],
        queryFn: () => procurementServicesApi.searchProducts({
            q: searchQuery,
            use_scrapers: useScrapers,
            max_results: 50,
        }),
        enabled: searchTriggered && searchQuery.length > 0,
    });

    const handleSearch = () => {
        if (searchQuery.trim()) {
            setSearchTriggered(true);
            refetch();
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Smart Product Search</h1>
                <Button variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart (0)
                </Button>
            </div>

            {/* Search Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Products</CardTitle>
                    <CardDescription>Find products across all suppliers with real-time pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="search">Product Name or SKU</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search for products..."
                                    className="flex-1"
                                />
                                <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
                                    <Search className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Searching...' : 'Search'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="scrapers"
                            checked={useScrapers}
                            onCheckedChange={setUseScrapers}
                        />
                        <Label htmlFor="scrapers" className="cursor-pointer">
                            Use real-time web scrapers (may take longer)
                        </Label>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {isLoading ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : searchResults && searchResults.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                        <CardDescription>{searchResults.length} products found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {searchResults.map((product: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{product.product_name}</TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>{product.supplier_name}</TableCell>
                                        <TableCell className="font-semibold">
                                            {product.currency} {product.price.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.quantity_in_stock > 0 ? 'default' : 'destructive'}>
                                                {product.stock_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.source === 'scraper' ? 'secondary' : 'outline'}>
                                                {product.source}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline">
                                                Add to Cart
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : searchTriggered ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No products found. Try a different search term.
                    </CardContent>
                </Card>
            ) : null}

            {/* Quick Stats */}
            {searchResults && searchResults.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lowest Price</CardTitle>
                            <TrendingDown className="h-4 w-4 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                KES {Math.min(...searchResults.map((p: any) => p.price)).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Best deal available</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                KES {(searchResults.reduce((sum: number, p: any) => sum + p.price, 0) / searchResults.length).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Market average</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(searchResults.map((p: any) => p.supplier_name)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">Offering this product</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
