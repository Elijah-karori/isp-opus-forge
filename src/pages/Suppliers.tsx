import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSuppliers } from "@/api/suppliers";
import { triggerScraper, scrapeAllSuppliers } from "@/api/scrapers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building, RefreshCw, Plus } from "lucide-react";

export default function Suppliers() {
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scrapeMutation = useMutation({
    mutationFn: triggerScraper,
    onSuccess: () => {
      toast({ title: "Success", description: "Scraping started" });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start scraping", variant: "destructive" });
    },
  });

  const scrapeAllMutation = useMutation({
    mutationFn: scrapeAllSuppliers,
    onSuccess: () => {
      toast({ title: "Success", description: "Scraping all suppliers" });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start scraping", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading suppliers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Suppliers</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => scrapeAllMutation.mutate()}
            disabled={scrapeAllMutation.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Scrape All
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No suppliers found</p>
            </CardContent>
          </Card>
        ) : (
          suppliers.map((supplier: any) => (
            <Card key={supplier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{supplier.name}</CardTitle>
                  <Badge variant={supplier.is_active ? "default" : "secondary"}>
                    {supplier.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.website && (
                  <div className="text-sm">
                    <span className="font-medium">Website:</span>{" "}
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {supplier.website}
                    </a>
                  </div>
                )}
                {supplier.contact_email && (
                  <div className="text-sm">
                    <span className="font-medium">Email:</span> {supplier.contact_email}
                  </div>
                )}
                {supplier.scraper_config && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => scrapeMutation.mutate(supplier.id)}
                    disabled={scrapeMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Scrape Prices
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
