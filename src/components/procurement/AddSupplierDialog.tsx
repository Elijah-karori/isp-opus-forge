// src/components/procurement/AddSupplierDialog.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Loader2, 
  Building, 
  Globe, 
  Mail, 
  Phone 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createSupplier } from '@/api/procurement';

interface AddSupplierDialogProps {
  onClose: () => void;
}

export function AddSupplierDialog({ onClose }: AddSupplierDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    scraper_class: '',
    notes: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      toast({
        title: "Supplier Created",
        description: "New supplier added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create supplier",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a supplier name",
        variant: "destructive",
      });
      return;
    }

    createSupplierMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Add New Supplier
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier Name *</label>
              <Input
                placeholder="Enter supplier name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Scraper Class (Optional)</label>
            <Input
              placeholder="e.g., NetworkGearScraper"
              value={formData.scraper_class}
              onChange={(e) => handleChange('scraper_class', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Custom scraper class name for automated price monitoring
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Additional notes about this supplier..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createSupplierMutation.isPending}
              className="flex items-center gap-2"
            >
              {createSupplierMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Building className="h-4 w-4" />
              )}
              Add Supplier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
