import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PaymentModal from '@/components/PaymentModal';
import { formatCurrency, calculateInvoiceStatus } from '@/lib/paymentUtils';
import { downloadInvoicePDF, previewInvoicePDF } from '@/lib/pdfGenerator';
import { ArrowLeft, Download, CreditCard, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [invoice, setInvoice] = useState<any>(null);

    // Mock invoice data (in real app, fetch from API)
    useEffect(() => {
        const mockInvoice = {
            id: parseInt(id || '1'),
            invoice_number: 'INV-2024-003',
            project_id: 3,
            project_name: 'Fiber Installation - Global Networks',
            customer_name: 'Global Networks',
            customer_email: 'contact@globalnetworks.com',
            customer_phone: '+254 712 345 678',
            customer_address: 'Westlands, Nairobi',
            milestone_name: 'Phase 1 Completion - Fiber Infrastructure Installation',
            amount: '180000.00',
            amount_paid: '0.00',
            status: 'pending',
            due_date: '2024-12-30',
            payment_date: null,
            created_at: '2024-11-20',
            payment_history: []
        };
        setInvoice(mockInvoice);

        // Check if we should open payment modal
        if (searchParams.get('action') === 'pay') {
            setShowPaymentModal(true);
        }
    }, [id, searchParams]);

    const processPaymentMutation = useMutation({
        mutationFn: invoicesApi.processPayment,
        onSuccess: () => {
            toast.success('Payment recorded successfully!');
            // Refresh invoice data
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to process payment');
        }
    });

    const handlePaymentSuccess = (transactionId: string, method: string) => {
        const paymentData = {
            invoice_id: invoice.id,
            amount_paid: parseFloat(invoice.amount) - parseFloat(invoice.amount_paid),
            payment_method: method,
            payment_reference: transactionId,
            payment_date: new Date().toISOString()
        };

        processPaymentMutation.mutate(paymentData);

        // Update local state
        setInvoice({
            ...invoice,
            amount_paid: invoice.amount,
            status: 'paid',
            payment_date: new Date().toISOString(),
            payment_history: [
                ...invoice.payment_history,
                {
                    date: new Date().toISOString(),
                    amount: paymentData.amount_paid,
                    method,
                    reference: transactionId
                }
            ]
        });
    };

    const handleDownloadPDF = () => {
        downloadInvoicePDF(invoice);
        toast.success('Invoice PDF downloaded');
    };

    const handlePreviewPDF = () => {
        previewInvoicePDF(invoice);
    };

    if (!invoice) {
        return <div>Loading...</div>;
    }

    const status = calculateInvoiceStatus(invoice);
    const balance = parseFloat(invoice.amount) - parseFloat(invoice.amount_paid);

    return (
        <div className="container mx-auto py-6 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
                        <p className="text-muted-foreground mt-1">{invoice.project_name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePreviewPDF}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </Button>
                    <Button variant="outline" onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                    {balance > 0 && (
                        <Button onClick={() => setShowPaymentModal(true)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Record Payment
                        </Button>
                    )}
                </div>
            </div>

            {/* Invoice Details */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Information */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{invoice.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{invoice.customer_email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{invoice.customer_phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium">{invoice.customer_address}</p>
                        </div>
                    </div>
                </Card>

                {/* Invoice Summary */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Invoice Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={status === 'paid' ? 'default' : status === 'overdue' ? 'destructive' : 'secondary'}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice Date</span>
                            <span className="font-medium">
                                {new Date(invoice.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Due Date</span>
                            <span className="font-medium">
                                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        {invoice.payment_date && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Date</span>
                                <span className="font-medium">
                                    {new Date(invoice.payment_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Line Items */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <div className="border rounded-lg p-4">
                    <p>{invoice.milestone_name}</p>
                </div>
            </Card>

            {/* Payment Summary */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
                <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                        <span>Subtotal</span>
                        <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                    </div>
                    {parseFloat(invoice.amount_paid) > 0 && (
                        <div className="flex justify-between text-lg text-green-600">
                            <span>Amount Paid</span>
                            <span className="font-semibold">-{formatCurrency(invoice.amount_paid)}</span>
                        </div>
                    )}
                    <div className="border-t pt-3 flex justify-between text-xl font-bold">
                        <span>{parseFloat(invoice.amount_paid) > 0 ? 'Balance Due' : 'Total'}</span>
                        <span className={balance > 0 ? 'text-orange-500' : 'text-green-600'}>
                            {formatCurrency(balance)}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Payment History */}
            {invoice.payment_history && invoice.payment_history.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Payment History</h2>
                    <div className="space-y-3">
                        {invoice.payment_history.map((payment: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.method} • {payment.reference}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(payment.date).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Payment Modal */}
            <PaymentModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                invoiceAmount={balance}
                invoiceNumber={invoice.invoice_number}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default InvoiceDetail;
