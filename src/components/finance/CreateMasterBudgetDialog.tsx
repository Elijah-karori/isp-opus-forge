import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createMasterBudget, type MasterBudgetCreate } from '@/api/finance';

interface CreateMasterBudgetDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateMasterBudgetDialog({ open, onClose }: CreateMasterBudgetDialogProps) {
  const [formData, setFormData] = useState<MasterBudgetCreate>({
    name: '',
    start_date: '',
    end_date: '',
    total_amount: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: MasterBudgetCreate) => createMasterBudget(data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Master budget created successfully' });
      queryClient.invalidateQueries({ queryKey: ['masterBudgets'] });
      onClose();
      setFormData({ name: '', start_date: '', end_date: '', total_amount: 0 });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create master budget',
        variant: 'destructive' 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Master Budget</DialogTitle>
          <DialogDescription>
            Create a new master budget to organize your financial planning
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., FY 2025 Budget"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="total_amount">Total Amount ($)</Label>
            <Input
              id="total_amount"
              type="number"
              step="0.01"
              value={formData.total_amount || ''}
              onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
