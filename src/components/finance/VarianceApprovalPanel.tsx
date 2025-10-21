// src/components/finance/VarianceApprovalPanel.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';
import { type BOMVariance } from '@/api/finance';

interface VarianceApprovalPanelProps {
  variance: BOMVariance;
  onApprove: (approved: boolean, notes?: string) => void;
  isLoading?: boolean;
}

export function VarianceApprovalPanel({ variance, onApprove, isLoading }: VarianceApprovalPanelProps) {
  const [notes, setNotes] = useState('');

  const costImpact = parseFloat(variance.variance_cost);
  const isOverBudget = costImpact > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Variance Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Task</label>
              <div className="font-medium">{variance.task?.title || `Task #${variance.task_id}`}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project</label>
              <div className="font-medium">{variance.task?.project_name}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Product</label>
              <div className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                {variance.product?.name}
              </div>
              <div className="text-sm text-muted-foreground">SKU: {variance.product?.sku}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
              <div className="font-medium">${variance.product?.unit_price}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">Expected</div>
              <div className="text-xl font-bold text-green-600">{variance.expected_qty}</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">Actual</div>
              <div className="text-xl font-bold text-red-600">{variance.actual_qty}</div>
            </div>
            <div className="text-center p-3 border rounded-lg bg-orange-50">
              <div className="text-sm text-muted-foreground">Variance</div>
              <div className="text-xl font-bold text-orange-600">
                {variance.variance_qty > 0 ? '+' : ''}{variance.variance_qty}
              </div>
              <div className="text-sm text-orange-600">{variance.variance_percent}%</div>
            </div>
          </div>

          <div className="p-3 border rounded-lg bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-red-800">Cost Impact</div>
                <div className="text-2xl font-bold text-red-600">
                  ${Math.abs(costImpact).toFixed(2)}
                </div>
              </div>
              <Badge variant={isOverBudget ? "destructive" : "default"}>
                {isOverBudget ? "Over Budget" : "Under Budget"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approval Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add approval notes or reason for rejection..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-3">
            <Button
              onClick={() => onApprove(true, notes)}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Variance
            </Button>
            <Button
              onClick={() => onApprove(false, notes)}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Variance
