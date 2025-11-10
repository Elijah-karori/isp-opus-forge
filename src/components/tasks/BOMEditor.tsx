// src/components/tasks/BOMEditor.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, 
  Package, 
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateTaskBOM, type Task, type TaskItem } from '@/api/tasks';

interface BOMEditorProps {
  task: Task;
  onClose: () => void;
  onSave: () => void;
}

export function BOMEditor({ task, onClose, onSave }: BOMEditorProps) {
  const [bomItems, setBomItems] = useState<TaskItem[]>(task.items || []);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateBOMMutation = useMutation({
    mutationFn: (data: any) => updateTaskBOM(task.id, data),
    onSuccess: () => {
      toast({
        title: "BOM Updated",
        description: "Bill of materials updated successfully",
      });
      onSave();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update BOM",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setBomItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity_used: quantity } : item
    ));
  };

  const handleNotesChange = (itemId: number, notes: string) => {
    setBomItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  const handleSave = () => {
    const items = bomItems.map(item => ({
      product_id: item.product_id,
      quantity_used: item.quantity_used,
      notes: item.notes
    }));

    updateBOMMutation.mutate({ items });
  };

  const calculateVariance = (item: TaskItem) => {
    return item.quantity_used - item.quantity_required;
  };

  const calculateCostImpact = (item: TaskItem) => {
    const variance = calculateVariance(item);
    return variance * (item.product?.unit_price || 0);
  };

  const totalCostImpact = bomItems.reduce((sum, item) => sum + calculateCostImpact(item), 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Bill of Materials - {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Information */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium">Project</label>
                  <div>{task.project?.name}</div>
                </div>
                <div>
                  <label className="font-medium">Customer</label>
                  <div>{task.project?.customer_name}</div>
                </div>
                <div>
                  <label className="font-medium">Technician</label>
                  <div>{task.technician?.full_name || 'Unassigned'}</div>
                </div>
                <div>
                  <label className="font-medium">Status</label>
                  <div>
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BOM Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Bill of Materials</span>
                {totalCostImpact !== 0 && (
                  <Badge variant={totalCostImpact > 0 ? "destructive" : "default"}>
                    Total Impact: ${Math.abs(totalCostImpact).toFixed(2)}
                    {totalCostImpact > 0 ? ' Over' : ' Under'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Cost Impact</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bomItems.map((item) => {
                    const variance = calculateVariance(item);
                    const costImpact = calculateCostImpact(item);
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product?.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.product?.sku}
                        </TableCell>
                        <TableCell>{item.quantity_required}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity_used}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${
                            variance > 0 ? 'text-red-600' : 
                            variance < 0 ? 'text-green-600' : 
                            'text-gray-600'
                          }`}>
                            {variance > 0 ? '+' : ''}{variance}
                            {variance !== 0 && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${
                            costImpact > 0 ? 'text-red-600' : 
                            costImpact < 0 ? 'text-green-600' : 
                            'text-gray-600'
                          }`}>
                            ${Math.abs(costImpact).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            {item.product?.unit_price}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Add notes..."
                            value={item.notes || ''}
                            onChange={(e) => handleNotesChange(item.id, e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {bomItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items in bill of materials</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          {totalCostImpact !== 0 && (
            <Card className={
              totalCostImpact > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
            }>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${
                      totalCostImpact > 0 ? 'text-red-600' : 'text-green-600'
                    }`} />
                    <div>
                      <div className="font-semibold">
                        {totalCostImpact > 0 ? 'Cost Overrun' : 'Cost Savings'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {totalCostImpact > 0 
                          ? 'Materials used exceed planned quantities' 
                          : 'Materials used are under planned quantities'
                        }
                      </div>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    totalCostImpact > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ${Math.abs(totalCostImpact).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateBOMMutation.isPending}
            className="flex items-center gap-2"
          >
            {updateBOMMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Update BOM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
