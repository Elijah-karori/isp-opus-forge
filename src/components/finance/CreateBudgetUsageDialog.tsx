import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createBudgetUsage, type BudgetUsageCreate } from '@/api/finance';

interface CreateBudgetUsageDialogProps {
  open: boolean;
  onClose: () => void;
  subBudgetId: number | null;
}

export function CreateBudgetUsageDialog({ open, onClose, subBudgetId }: CreateBudgetUsageDialogProps) {
  const [formData, setFormData] = useState<BudgetUsageCreate>({
    sub_budget_id: 0,
    description: '',
    amount: 0,
    type: 'debit',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: BudgetUsageCreate) => createBudgetUsage(data),
    onSuccess: (response) => {
      const isOverBudget = response.data?.status === 'pending_approval';
      toast({ 
        title: isOverBudget ? 'Approval Required' : 'Success', 
        description: isOverBudget 
          ? 'Budget usage exceeds allocation and requires approval'
          : 'Budget usage recorded successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['budgetUsages'] });
      queryClient.invalidateQueries({ queryKey: ['finance-workflows'] });
      onClose();
      setFormData({ 
        sub_budget_id: 0, 
        description: '', 
        amount: 0, 
        type: 'debit', 
        transaction_date: new Date().toISOString().split('T')[0] 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create budget usage',
        variant: 'destructive' 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subBudgetId) {
      toast({ title: 'Error', description: 'Sub-budget not selected', variant: 'destructive' });
      return;
    }
    createMutation.mutate({ ...formData, sub_budget_id: subBudgetId });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Budget Usage</DialogTitle>
          <DialogDescription>
            Record a transaction against this sub-budget. If it exceeds the allocated amount, it will require approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Transaction Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'credit' | 'debit') => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debit">Expense (Debit)</SelectItem>
                <SelectItem value="credit">Refund (Credit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount ($)</Label>
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

          <div>
            <Label htmlFor="transaction_date">Transaction Date</Label>
            <Input
              id="transaction_date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the transaction..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Recording...' : 'Record Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
