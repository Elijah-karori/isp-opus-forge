// src/components/procurement/PurchaseOrders.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getPurchaseOrders, 
  approvePurchaseOrder,
  type PurchaseOrder 
} from '@/api/procurement';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  ShoppingCart, 
  CheckCircle, 
  XCircle,
  Eye,
  FileText,
  Building,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ApprovalOverlay } from '@/components/ApprovalOverlay';

export function PurchaseOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showApprovalOverlay, setShowApprovalOverlay] = useState(false);

  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => apiClient.getPurchases(),
  });

  const approveOrderMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: any }) =>
      approvePurchaseOrder(orderId, data),
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Purchase order action completed successfully",
      });
      setShowApprovalOverlay(false);
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to process purchase order",
        variant: "destructive",
      });
    },
  });

  const handleApproveAction = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowApprovalOverlay(true);
  };

  const handleApprovalSubmit = (action: 'approve' | 'reject', notes?: string) => {
    if (!selectedOrder || !user) return;

    const data = {
      approved: action === 'approve',
      notes: notes || '',
    };

    approveOrderMutation.mutate({ orderId: selectedOrder.id, data });
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const variants = {
      draft: { class: 'bg-gray-500/10 text-gray-500 border-gray-500/20', label: 'Draft' },
      submitted: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Submitted' },
      approved: { class: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Approved' },
      ordered: { class: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'Ordered' },
      received: { class: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Received' },
      cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
    };
    return variants[status];
  };

  const orderList = Array.isArray(purchaseOrders) ? purchaseOrders : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Orders
            <Badge variant="outline" className="ml-2">
              {orderList.length} total
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList.map((order: PurchaseOrder) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {order.supplier?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.items?.length || 0} items
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${order.total_amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(order.order_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.expected_delivery ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.expected_delivery).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge.class}>
                        {statusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* View details */}}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {(order.status === 'submitted' || order.status === 'draft') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveAction(order)}
                          >
                            {order.status === 'submitted' ? 'Review' : 'Edit'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {orderList.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No purchase orders found</p>
              <Button className="mt-4">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create First Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Overlay */}
      {showApprovalOverlay && selectedOrder && (
        <ApprovalOverlay
          title="Review Purchase Order"
          item={selectedOrder}
          onClose={() => {
            setShowApprovalOverlay(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleApprovalSubmit}
          isLoading={approveOrderMutation.isPending}
          type="purchase-order"
        />
      )}
    </div>
  );
}
