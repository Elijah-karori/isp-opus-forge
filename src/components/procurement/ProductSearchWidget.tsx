import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { procurementServicesApi } from '@/api/procurementServices';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, TrendingDown, PackageCheck, ExternalLink } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface ProductSearchResult {
    product_id?: number;
    supplier_id?: number;
    supplier_name?: string;
    product_name: string;
    sku?: string;
    price: number;
    currency: string;
    stock_status?: string;
    quantity_in_stock?: number;
    image_url?: string;
    product_url?: string;
    source: string;
}

export function ProductSearchWidget() {
    const [searchQuery, setSearchQuery] = useState('');
    const [useScrapers, setUseScrapers] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const { data: searchResults, isLoading, refetch } = useQuery({
        queryKey: ['product-search', searchQuery, useScrapers],
        queryFn: () =>
            procurementServicesApi.searchProducts({
                q: searchQuery,
                use_scrapers: useScrapers,
                max_results: 50,
            }),
        enabled: false, // Manual trigger
    });

    const handleSearch = () => {
        if (searchQuery.trim()) {
            setHasSearched(true);
            refetch();
        }
    };

    const columns: ColumnDef<ProductSearchResult>[] = [
        {
            accessorKey: 'product_name',
            header: 'Product',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.image_url && (
                        <img
                            src={row.original.image_url}
                            alt={row.original.product_name}
                            className="h-10 w-10 rounded object-cover"
                        />
                    )}
                    <div>
                        <p className="font-medium">{row.original.product_name}</p>
                        {row.original.sku && (
                            <p className="text-xs text-muted-foreground">SKU: {row.original.sku}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'supplier_name',
            header: 'Supplier',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.supplier_name || 'Unknown'}</p>
                    <Badge variant="outline" className="text-xs">
                        {row.original.source}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ row }) => (
                <p className="font-bold">
                    {row.original.currency} {row.original.price.toLocaleString()}
                </p>
            ),
        },
        {
            accessorKey: 'stock_status',
            header: 'Stock',
            cell: ({ row }) => {
                const inStock = row.original.stock_status?.toLowerCase().includes('in stock');
                const qty = row.original.quantity_in_stock;

                return (
                    <div>
                        <Badge variant={inStock ? 'default' : 'destructive'}>
                            {row.original.stock_status || 'Unknown'}
                        </Badge>
                        {qty !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">Qty: {qty}</p>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {row.original.product_url && (
                        <Button size="sm" variant="outline" asChild>
                            <a href={row.original.product_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                            </a>
                        </Button>
                    )}
                    {row.original.product_id && (
                        <Button size="sm">
                            Order
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const results = searchResults?.data || [];

    return (
        <div className="space-y-4">
            {/* Search Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search for products across all suppliers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={useScrapers ? 'default' : 'outline'}
                                onClick={() => setUseScrapers(!useScrapers)}
                            >
                                <PackageCheck className="h-4 w-4 mr-2" />
                                {useScrapers ? 'Real-time Search' : 'Database Only'}
                            </Button>
                            <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4 mr-2" />
                                )}
                                Search
                            </Button>
                        </div>
                    </div>
                    {useScrapers && (
                        <p className="text-xs text-muted-foreground mt-2">
                            💡 Real-time search enabled - fetching live prices from suppliers
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {useScrapers ? 'Searching across suppliers...' : 'Searching database...'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {hasSearched && !isLoading && results.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Search Results</h3>
                                <p className="text-sm text-muted-foreground">
                                    Found {results.length} products
                                </p>
                            </div>
                            {results.some((r: ProductSearchResult) => r.source === 'scraper') && (
                                <Badge variant="outline" className="gap-2">
                                    <TrendingDown className="h-3 w-3" />
                                    Live prices included
                                </Badge>
                            )}
                        </div>
                        <DataTable
                            columns={columns}
                            data={results}
                            searchKey="product_name"
                            searchPlaceholder="Filter results..."
                        />
                    </CardContent>
                </Card>
            )}

            {/* No Results */}
            {hasSearched && !isLoading && results.length === 0 && (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="font-medium">No products found</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Try a different search term or enable real-time search
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
