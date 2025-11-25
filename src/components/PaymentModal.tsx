import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { mockStripePayment, mockMPESAPayment, formatCurrency } from '@/lib/paymentUtils';
import { toast } from 'sonner';

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    invoiceAmount: number;
    invoiceNumber: string;
    onPaymentSuccess: (transactionId: string, method: string) => void;
}

const PaymentModal = ({
    open,
    onClose,
    invoiceAmount,
    invoiceNumber,
    onPaymentSuccess
}: PaymentModalProps) => {
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mpesa'>('stripe');
    const [processing, setProcessing] = useState(false);

    // Stripe form state
    const [stripeData, setStripeData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
    });

    // MPESA form state
    const [mpesaData, setMpesaData] = useState({
        phoneNumber: ''
    });

    const handleStripePayment = async () => {
        if (!stripeData.cardNumber || !stripeData.expiryDate || !stripeData.cvv) {
            toast.error('Please fill in all card details');
            return;
        }

        setProcessing(true);
        try {
            const result = await mockStripePayment(
                invoiceAmount,
                stripeData.cardNumber,
                stripeData.cvv,
                stripeData.expiryDate
            );

            toast.success(result.message || 'Payment successful!');
            onPaymentSuccess(result.transactionId, 'Stripe');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleMPESAPayment = async () => {
        if (!mpesaData.phoneNumber) {
            toast.error('Please enter your phone number');
            return;
        }

        setProcessing(true);
        try {
            const result = await mockMPESAPayment(invoiceAmount, mpesaData.phoneNumber);

            toast.success(result.message || 'Payment successful!');
            onPaymentSuccess(result.transactionId, 'MPESA');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Process Payment</DialogTitle>
                    <DialogDescription>
                        Invoice: {invoiceNumber} | Amount: {formatCurrency(invoiceAmount)}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="stripe">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Card
                        </TabsTrigger>
                        <TabsTrigger value="mpesa">
                            <Smartphone className="h-4 w-4 mr-2" />
                            MPESA
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="stripe" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                                id="cardNumber"
                                placeholder="4242 4242 4242 4242"
                                value={stripeData.cardNumber}
                                onChange={(e) => setStripeData({
                                    ...stripeData,
                                    cardNumber: formatCardNumber(e.target.value)
                                })}
                                maxLength={19}
                            />
                            <p className="text-xs text-muted-foreground">
                                Test: 4242424242424242 (Success) | 4000000000000002 (Declined)
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                    id="expiryDate"
                                    placeholder="MM/YY"
                                    value={stripeData.expiryDate}
                                    onChange={(e) => setStripeData({ ...stripeData, expiryDate: e.target.value })}
                                    maxLength={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                    id="cvv"
                                    placeholder="123"
                                    value={stripeData.cvv}
                                    onChange={(e) => setStripeData({ ...stripeData, cvv: e.target.value })}
                                    maxLength={4}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cardholderName">Cardholder Name</Label>
                            <Input
                                id="cardholderName"
                                placeholder="John Doe"
                                value={stripeData.cardholderName}
                                onChange={(e) => setStripeData({ ...stripeData, cardholderName: e.target.value })}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="mpesa" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                placeholder="254712345678"
                                value={mpesaData.phoneNumber}
                                onChange={(e) => setMpesaData({ phoneNumber: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: 254XXXXXXXXX | Test: 254712345678 (Success) | 254700000000 (Insufficient)
                            </p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
                            <p className="font-semibold">How it works:</p>
                            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                <li>Enter your MPESA phone number</li>
                                <li>You'll receive an STK push notification</li>
                                <li>Enter your MPESA PIN to complete payment</li>
                            </ol>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={paymentMethod === 'stripe' ? handleStripePayment : handleMPESAPayment}
                        disabled={processing}
                    >
                        {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {processing ? 'Processing...' : `Pay ${formatCurrency(invoiceAmount)}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
