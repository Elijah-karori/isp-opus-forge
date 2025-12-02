import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financialServicesApi, BudgetLineItem } from '@/api/financialServices';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart } from '@/components/charts';

interface BudgetAllocationFormProps {
    projectId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const BUDGET_CATEGORIES = [
    { value: 'labor', label: 'Labor' },
    { value: 'materials', label: 'Materials' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'overhead', label: 'Overhead' },
    { value: 'contingency', label: 'Contingency' },
    { value: 'other', label: 'Other' },
];

const CATEGORY_COLORS = {
    labor: '#3b82f6',
    materials: '#10b981',
    equipment: '#f59e0b',
    overhead: '#ef4444',
    contingency: '#8b5cf6',
    other: '#6b7280',
};

export function BudgetAllocationForm({
    projectId,
    open,
    onOpenChange,
}: BudgetAllocationFormProps) {
    const queryClient = useQueryClient();
    const [lineItems, setLineItems] = useState<BudgetLineItem[]>([
        { category: 'labor', description: '', quantity: 1, unit_cost: 0 },
    ]);
    const [notes, setNotes] = useState('');

    const mutation = useMutation({
        mutationFn: () =>
            financialServicesApi.allocateBudget({
                project_id: projectId,
                line_items: lineItems,
                notes,
            }),
        onSuccess: () => {
            toast.success('Budget allocated successfully');
            queryClient.invalidateQueries({ queryKey: ['project-budget', projectId] });
            queryClient.invalidateQueries({ queryKey: ['financial-snapshot'] });
            onOpenChange(false);
            resetForm();
        },
        onError: () => {
            toast.error('Failed to allocate budget');
        },
    });

    const resetForm = () => {
        setLineItems([{ category: 'labor', description: '', quantity: 1, unit_cost: 0 }]);
        setNotes('');
    };

    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            { category: 'labor', description: '', quantity: 1, unit_cost: 0 },
        ]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const updateLineItem = (index: number, field: keyof BudgetLineItem, value: any) => {
        const updated = [...lineItems];
        updated[index] = { ...updated[index], [field]: value };
        setLineItems(updated);
    };

    const calculateTotal = () => {
        return lineItems.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0);
    };

    const getCategoryBreakdown = () => {
        const breakdown: Record<string, number> = {};
        lineItems.forEach((item) => {
            const total = item.quantity * item.unit_cost;
            breakdown[item.category] = (breakdown[item.category] || 0) + total;
        });
        return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Allocate Project Budget</DialogTitle>
                    <DialogDescription>
                        Create detailed budget allocation with line items by category
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Line Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold">Budget Line Items</h4>
                            <Button type="button" size="sm" onClick={addLineItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>

                        {lineItems.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-12 gap-3 p-3 rounded-lg border bg-muted/30"
                            >
                                <div className="col-span-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={item.category}
                                        onValueChange={(value) =>
                                            updateLineItem(index, 'category', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BUDGET_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-4">
                                    <Label>Description</Label>
                                    <Input
                                        value={item.description}
                                        onChange={(e) =>
                                            updateLineItem(index, 'description', e.target.value)
                                        }
                                        placeholder="Item description"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)
                                        }
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label>Unit Cost</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unit_cost}
                                        onChange={(e) =>
                                            updateLineItem(index, 'unit_cost', parseFloat(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                <div className="col-span-2 flex items-end gap-2">
                                    <div className="flex-1">
                                        <Label>Total</Label>
                                        <Input
                                            value={(item.quantity * item.unit_cost).toFixed(2)}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                    {lineItems.length > 1 && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeLineItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Budget Summary */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold mb-3">Category Distribution</h4>
                            <PieChart
                                data={getCategoryBreakdown()}
                                colors={Object.values(CATEGORY_COLORS)}
                                height={250}
                            />
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-3">Budget Summary</h4>
                            <div className="space-y-3">
                                {BUDGET_CATEGORIES.map((cat) => {
                                    const categoryTotal = lineItems
                                        .filter((item) => item.category === cat.value)
                                        .reduce((sum, item) => sum + item.quantity * item.unit_cost, 0);
                                    if (categoryTotal === 0) return null;
                                    return (
                                        <div key={cat.value} className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">{cat.label}</span>
                                            <span className="font-medium">
                                                KES {categoryTotal.toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div className="border-t pt-3 flex justify-between items-center font-bold">
                                    <span>Total Budget</span>
                                    <span className="text-lg">KES {calculateTotal().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label>Notes (Optional)</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes about this budget allocation..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || lineItems.some((item) => !item.description)}
                    >
                        {mutation.isPending ? 'Allocating...' : 'Allocate Budget'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
