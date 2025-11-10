import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createSubBudget, type SubBudgetCreate } from '@/api/finance';

interface CreateSubBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  masterBudgetId: number | null;
}

export function CreateSubBudgetDialog({ open, onClose, masterBudgetId }: CreateSubBudgetDialogProps) {
  const [formData, setFormData] = useState<SubBudgetCreate>({
    name: '',
    amount: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: SubBudgetCreate) => {
      if (!masterBudgetId) throw new Error('Master budget ID is required');
      return createSubBudget(masterBudgetId, data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Sub-budget created successfully' });
      queryClient.invalidateQueries({ queryKey: ['subBudgets'] });
      onClose();
      setFormData({ name: '', amount: 0 });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create sub-budget',
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
          <DialogTitle>Create Sub-Budget</DialogTitle>
          <DialogDescription>
            Add a sub-budget category to track specific spending areas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Sub-Budget Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Marketing, Operations, R&D"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Allocated Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Sub-Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
