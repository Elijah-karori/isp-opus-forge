import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices';
import { formatCurrency, calculateInvoiceStatus } from '@/lib/paymentUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    FileText,
    DollarSign,
    AlertCircle,
    Clock,
    Plus,
    Download,
    Eye,
    CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PermissionGate from '@/components/PermissionGate';
import { PERMISSIONS } from '@/constants/permissions';

interface Invoice {
    id: number;
    invoice_number: string;
    project_id: number;
    customer_name: string | null;
    amount: string;
    amount_paid: string;
    status: string;
    due_date: string | null;
    payment_date: string | null;
}

const Invoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Fetch overdue invoices
    const { data: overdueData } = useQuery({
        queryKey: ['invoices', 'overdue'],
        queryFn: () => invoicesApi.getOverdueInvoices(0)
    });

    // Mock invoice data (since we don't have a list endpoint)
    useEffect(() => {
        // In a real app, this would fetch from an API
        const mockInvoices: Invoice[] = [
            {
                id: 1,
                invoice_number: 'INV-2024-001',
                project_id: 1,
                customer_name: 'Acme Corporation',
                amount: '150000.00',
                amount_paid: '150000.00',
                status: 'paid',
                due_date: '2024-01-15',
                payment_date: '2024-01-10'
            },
            {
                id: 2,
                invoice_number: 'INV-2024-002',
                project_id: 2,
                customer_name: 'Tech Solutions Ltd',
                amount: '250000.00',
                amount_paid: '100000.00',
                status: 'partial',
                due_date: '2024-02-01',
                payment_date: null
            },
            {
                id: 3,
                invoice_number: 'INV-2024-003',
                project_id: 3,
                customer_name: 'Global Networks',
                amount: '180000.00',
                amount_paid: '0.00',
                status: 'pending',
                due_date: '2025-12-30',
                payment_date: null
            },
            {
                id: 4,
                invoice_number: 'INV-2024-004',
                project_id: 4,
                customer_name: 'Smart Homes Inc',
                amount: '95000.00',
                amount_paid: '0.00',
                status: 'overdue',
                due_date: '2024-11-15',
                payment_date: null
            },
        ];
        setInvoices(mockInvoices);
    }, []);

    const getStatusBadge = (invoice: Invoice) => {
        const status = calculateInvoiceStatus(invoice);

        const variants: Record<string, any> = {
            paid: { variant: 'default', className: 'bg-green-500' },
            partial: { variant: 'secondary', className: 'bg-yellow-500' },
            overdue: { variant: 'destructive', className: '' },
            pending: { variant: 'outline', className: '' }
        };

        return (
            <Badge {...variants[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const filteredInvoices = invoices.filter(inv => {
        if (statusFilter === 'all') return true;
        return calculateInvoiceStatus(inv) === statusFilter;
    });

    const stats = {
        total: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
        outstanding: invoices.reduce((sum, inv) => {
            const remaining = parseFloat(inv.amount) - parseFloat(inv.amount_paid);
            return sum + remaining;
        }, 0),
        overdue: invoices.filter(inv => calculateInvoiceStatus(inv) === 'overdue').length
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Invoices</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage customer invoices and payments
                    </p>
                </div>
                <PermissionGate permission={PERMISSIONS.INVOICE.CREATE_ALL}>
                    <Button onClick={() => navigate('/invoices/create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Invoice
                    </Button>
                </PermissionGate>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Invoices</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Outstanding</p>
                            <p className="text-2xl font-bold text-orange-500">
                                {formatCurrency(stats.outstanding)}
                            </p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Overdue</p>
                            <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('all')}
                    >
                        All
                    </Button>
                    <Button
                        variant={statusFilter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('pending')}
                    >
                        Pending
                    </Button>
                    <Button
                        variant={statusFilter === 'partial' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('partial')}
                    >
                        Partial
                    </Button>
                    <Button
                        variant={statusFilter === 'paid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('paid')}
                    >
                        Paid
                    </Button>
                    <Button
                        variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('overdue')}
                    >
                        Overdue
                    </Button>
                </div>
            </Card>

            {/* Invoice Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                    No invoices found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices.map((invoice) => {
                                const balance = parseFloat(invoice.amount) - parseFloat(invoice.amount_paid);
                                return (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                        <TableCell>{invoice.customer_name}</TableCell>
                                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                        <TableCell>{formatCurrency(invoice.amount_paid)}</TableCell>
                                        <TableCell className={balance > 0 ? 'text-orange-500 font-medium' : ''}>
                                            {formatCurrency(balance)}
                                        </TableCell>
                                        <TableCell>
                                            {invoice.due_date
                                                ? new Date(invoice.due_date).toLocaleDateString()
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(invoice)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <PermissionGate permission={PERMISSIONS.INVOICE.PROCESS_PAYMENT}>
                                                    {balance > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/invoices/${invoice.id}?action=pay`)}
                                                        >
                                                            <CreditCard className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </PermissionGate>
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default Invoices;
