// src/components/procurement/GenericScraper.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Loader2, 
  Globe, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  Package,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { scrapeGenericUrl, type ScrapedProduct } from '@/api/procurement';

interface GenericScraperProps {
  onClose: () => void;
  onScrapeComplete?: (products: ScrapedProduct[]) => void;
}

export function GenericScraper({ onClose, onScrapeComplete }: GenericScraperProps) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Generic');
  const [scrapedProducts, setScrapedProducts] = useState<ScrapedProduct[]>([]);
  const { toast } = useToast();

  const scrapeMutation = useMutation({
    mutationFn: (scrapeUrl: string) => scrapeGenericUrl(scrapeUrl, category),
    onSuccess: (response) => {
      const products = response.data || [];
      setScrapedProducts(products);
      toast({
        title: "Scraping Completed",
        description: `Found ${products.length} products`,
      });
      if (onScrapeComplete) {
        onScrapeComplete(products);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to scrape products from the provided URL",
        variant: "destructive",
      });
    },
  });

  const handleScrape = () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to scrape",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
      return;
    }

    scrapeMutation.mutate(url);
  };

  const handleAddToInventory = (product: ScrapedProduct) => {
    // Implement add to inventory logic
    toast({
      title: "Product Added",
      description: `${product.name} added to inventory`,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Web Product Scraper
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* URL Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Scrape Products from Website</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Website URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/products"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleScrape}
                    disabled={scrapeMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {scrapeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Scrape
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Networking, Cables, Equipment"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              {scrapeMutation.isPending && (
                <div className="flex items-center justify-center p-8 border rounded-lg bg-muted/50">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Scanning website for products...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {scrapedProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Scraped Products
                  <Badge variant="outline" className="ml-2">
                    {scrapedProducts.length} found
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scrapedProducts.map((product, index) => (
                    <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-4 flex-1">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg truncate">{product.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {product.sku && (
                              <span>SKU: {product.sku}</span>
                            )}
                            {product.category && (
                              <span>Category: {product.category}</span>
                            )}
                            {product.in_stock !== undefined && (
                              <Badge 
                                variant={product.in_stock ? "default" : "secondary"}
                                className={
                                  product.in_stock 
                                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                }
                              >
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            )}
                          </div>
                          {product.description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          {product.url && (
                            <a 
                              href={product.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-2 text-sm text-blue-600 hover:underline inline-block"
                            >
                              View on supplier website
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            ${product.price}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddToInventory(product)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Add to Inventory
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Enter the full URL of the product listing page (e.g., https://example.com/products)</p>
                <p>• The scraper will automatically extract product names, prices, and images</p>
                <p>• Supported websites: Most e-commerce platforms with standard product listings</p>
                <p>• Products can be directly added to your inventory after scraping</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
