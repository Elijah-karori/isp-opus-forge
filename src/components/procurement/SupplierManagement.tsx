// src/components/procurement/SupplierManagement.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getSuppliers, 
  createSupplier, 
  triggerSupplierScrape,
  type Supplier 
} from '@/api/procurement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Plus, 
  RefreshCw, 
  Building, 
  Globe,
  Mail,
  Phone,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddSupplierDialog } from './AddSupplierDialog';

export function SupplierManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => getSuppliers(),
  });

  const scrapeMutation = useMutation({
    mutationFn: triggerSupplierScrape,
    onSuccess: () => {
      toast({
        title: "Scraping Started",
        description: "Supplier prices are being updated",
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to start scraping",
        variant: "destructive",
      });
    },
  });

  const handleScrapeSupplier = (supplierId: number) => {
    scrapeMutation.mutate(supplierId);
  };

  const supplierList = suppliers?.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Supplier Directory
          </CardTitle>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
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
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierList.map((supplier: Supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="font-medium">{supplier.name}</div>
                      {supplier.scraper_class && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Auto-scraping
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.contact_email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {supplier.contact_email}
                          </div>
                        )}
                        {supplier.contact_phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {supplier.contact_phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.website ? (
                        <a 
                          href={supplier.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Globe className="h-3 w-3" />
                          Visit Site
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {supplier.product_count || 0} products
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {supplier.last_scraped ? (
                        new Date(supplier.last_scraped).toLocaleDateString()
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.is_active ? "default" : "secondary"}>
                        {supplier.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleScrapeSupplier(supplier.id)}
                          disabled={scrapeMutation.isPending}
                        >
                          {scrapeMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showAddDialog && (
        <AddSupplierDialog onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  );
}
