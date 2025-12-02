/**
 * Invoice Management Page
 * Generate, process, and track customer invoices
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialServicesApi } from '@/api/financialServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { FileText, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function InvoiceManagement() {
    const queryClient = useQueryClient();
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [invoiceForm, setInvoiceForm] = useState({
        milestone_name: '',
        amount: '',
        due_date: '',
    });

    const { data: overdueInvoices } = useQuery({
        queryKey: ['invoices', 'overdue'],
        queryFn: () => financialServicesApi.getOverdueInvoices(0),
    });

    const generateInvoiceMutation = useMutation({
        mutationFn: financialServicesApi.generateInvoice,
        onSuccess: () => {
            toast({ title: 'Invoice generated successfully' });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setInvoiceForm({ milestone_name: '', amount: '', due_date: '' });
            setSelectedProject(null);
        },
        onError: (error: Error) => {
            toast({ title: 'Error generating invoice', description: error.message, variant: 'destructive' });
        },
    });

    const processPaymentMutation = useMutation({
        mutationFn: financialServicesApi.processPayment,
        onSuccess: () => {
            toast({ title: 'Payment processed successfully' });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: (error: Error) => {
            toast({ title: 'Error processing payment', description: error.message, variant: 'destructive' });
        },
    });

    const handleGenerateInvoice = () => {
        if (!selectedProject || !invoiceForm.milestone_name || !invoiceForm.amount) {
            toast({ title: 'Please fill all required fields', variant: 'destructive' });
            return;
        }

        generateInvoiceMutation.mutate({
            project_id: selectedProject,
            milestone_name: invoiceForm.milestone_name,
            amount: parseFloat(invoiceForm.amount),
            due_date: invoiceForm.due_date || undefined,
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Invoice Management</h1>
                <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Export Report
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Generate Invoice */}
                <Card>
                    <CardHeader>
                        <CardTitle>Generate New Invoice</CardTitle>
                        <CardDescription>Create invoice for project milestone</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="project">Project</Label>
                            <Select
                                value={selectedProject?.toString()}
                                onValueChange={(value) => setSelectedProject(parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Project Alpha</SelectItem>
                                    <SelectItem value="2">Project Beta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="milestone">Milestone Name</Label>
                            <Input
                                id="milestone"
                                value={invoiceForm.milestone_name}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, milestone_name: e.target.value })}
                                placeholder="e.g., Phase 1 Completion"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (KES)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={invoiceForm.amount}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={invoiceForm.due_date}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                            />
                        </div>

                        <Button
                            onClick={handleGenerateInvoice}
                            disabled={generateInvoiceMutation.isPending}
                            className="w-full"
                        >
                            {generateInvoiceMutation.isPending ? 'Generating...' : 'Generate Invoice'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overdueInvoices?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                KES {overdueInvoices?.reduce((sum: number, inv: any) => sum + (inv.amount - inv.amount_paid), 0).toLocaleString() || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Pending payments</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Overdue Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Overdue Invoices</CardTitle>
                    <CardDescription>Invoices past their due date</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overdueInvoices && overdueInvoices.length > 0 ? (
                                overdueInvoices.map((invoice: any) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                        <TableCell>{invoice.customer_name}</TableCell>
                                        <TableCell>KES {invoice.amount.toLocaleString()}</TableCell>
                                        <TableCell>KES {invoice.amount_paid.toLocaleString()}</TableCell>
                                        <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    // Open payment dialog
                                                }}
                                            >
                                                Record Payment
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        <CheckCircle className="mx-auto h-8 w-8 mb-2 text-success" />
                                        No overdue invoices
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
