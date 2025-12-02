import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementServicesApi, SmartPurchaseOrderRequest } from '@/api/procurementServices';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, PackageCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SmartOrderWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId?: number;
    productName?: string;
}

export function SmartOrderWizard({
    open,
    onOpenChange,
    productId: initialProductId,
    productName: initialProductName,
}: SmartOrderWizardProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [productId, setProductId] = useState(initialProductId || 0);
    const [productName, setProductName] = useState(initialProductName || '');
    const [quantity, setQuantity] = useState(1);
    const [bestSupplier, setBestSupplier] = useState<any>(null);
    const [loadingSupplier, setLoadingSupplier] = useState(false);

    // Find best supplier when quantity changes
    const findBestSupplier = async () => {
        if (!productId || quantity < 1) return;

        setLoadingSupplier(true);
        try {
            const response = await procurementServicesApi.findBestSupplier(productId, quantity);
            setBestSupplier(response.data);
            setStep(2);
        } catch (error) {
            toast.error('Failed to find best supplier');
        } finally {
            setLoadingSupplier(false);
        }
    };

    const createOrderMutation = useMutation({
        mutationFn: (request: SmartPurchaseOrderRequest) =>
            procurementServicesApi.createSmartPurchaseOrder(request),
        onSuccess: () => {
            toast.success('Smart purchase order created successfully');
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            onOpenChange(false);
            resetWizard();
        },
        onError: () => {
            toast.error('Failed to create purchase order');
        },
    });

    const handleCreateOrder = () => {
        if (!user?.id || !productId || quantity < 1) return;

        createOrderMutation.mutate({
            product_id: productId,
            quantity,
            requester_id: user.id,
            prefer_supplier_id: bestSupplier?.supplier_id,
        });
    };

    const resetWizard = () => {
        setStep(1);
        setProductId(initialProductId || 0);
        setProductName(initialProductName || '');
        setQuantity(1);
        setBestSupplier(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Smart Purchase Order Wizard</DialogTitle>
                    <DialogDescription>
                        Automatically find the best supplier and create optimized purchase orders
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="product_name">Product</Label>
                            <Input
                                id="product_name"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Product name"
                                disabled={!!initialProductId}
                            />
                        </div>

                        <div>
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            />
                        </div>

                        <Button
                            onClick={findBestSupplier}
                            disabled={!productId || quantity < 1 || loadingSupplier}
                            className="w-full"
                        >
                            {loadingSupplier ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Finding Best Supplier...
                                </>
                            ) : (
                                <>
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Find Best Supplier
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {step === 2 && bestSupplier && (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Recommended Supplier</p>
                                        <p className="text-xl font-bold">{bestSupplier.supplier_name}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Unit Price</p>
                                            <p className="text-lg font-semibold">
                                                KES {bestSupplier.unit_price?.toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Cost</p>
                                            <p className="text-lg font-semibold">
                                                KES {bestSupplier.total_cost?.toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Stock Available</p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{bestSupplier.stock_available}</p>
                                                {bestSupplier.stock_available >= quantity ? (
                                                    <Badge className="bg-green-500">In Stock</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Low Stock</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Supplier Rating</p>
                                            <p className="font-medium">{bestSupplier.supplier_rating || 'N/A'} ⭐</p>
                                        </div>
                                    </div>

                                    {bestSupplier.price_comparison && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium mb-2">Price Comparison</p>
                                            <div className="flex items-center gap-2">
                                                {bestSupplier.is_best_price ? (
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <TrendingDown className="h-4 w-4" />
                                                        <span className="text-sm">
                                                            {bestSupplier.savings_percent}% cheaper than average
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-orange-600">
                                                        <TrendingUp className="h-4 w-4" />
                                                        <span className="text-sm">Not the cheapest option</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium mb-2">Order Summary</p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Product:</span>
                                                <span>{productName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Quantity:</span>
                                                <span>{quantity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Supplier:</span>
                                                <span>{bestSupplier.supplier_name}</span>
                                            </div>
                                            <div className="flex justify-between font-bold pt-2 border-t">
                                                <span>Total:</span>
                                                <span>KES {bestSupplier.total_cost?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <DialogFooter>
                    {step === 2 && (
                        <Button variant="outline" onClick={() => setStep(1)}>
                            Back
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    {step === 2 && (
                        <Button
                            onClick={handleCreateOrder}
                            disabled={createOrderMutation.isPending}
                        >
                            {createOrderMutation.isPending ? 'Creating Order...' : 'Create Purchase Order'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
