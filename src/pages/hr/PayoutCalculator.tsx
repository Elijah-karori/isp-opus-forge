import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import hrApi, { Payout } from '@/api/hrServices';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PayoutCalculator() {
    const queryClient = useQueryClient();
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [paymentDetails, setPaymentDetails] = useState({ method: '', reference: '' });

    const { data: pendingPayouts, isLoading } = useQuery({
        queryKey: ['pending-payouts'],
        queryFn: () => hrApi.getPendingPayouts().then((res) => res.data),
    });

    const approveMutation = useMutation({
        mutationFn: (id: number) => hrApi.approvePayout(id, { approved: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
            toast.success('Payout approved');
        },
    });

    const payMutation = useMutation({
        mutationFn: (id: number) =>
            hrApi.markPayoutPaid(id, paymentDetails.method, paymentDetails.reference),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
            setSelectedPayout(null);
            toast.success('Payout marked as paid');
        },
    });

    const handlePay = () => {
        if (selectedPayout) {
            payMutation.mutate(selectedPayout.id);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payout Management</h1>
                    <p className="text-muted-foreground">
                        Calculate, approve, and process employee payouts
                    </p>
                </div>
                <div className="flex gap-2">
                    <Input
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                        className="w-[150px]"
                    />
                    <Input
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                        className="w-[150px]"
                    />
                    <Button variant="outline">Calculate Period</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pendingPayouts?.filter((p) => p.status === 'PENDING').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ready for Payment</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pendingPayouts?.filter((p) => p.status === 'APPROVED').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            $
                            {pendingPayouts
                                ?.reduce((sum, p) => sum + p.net_amount, 0)
                                .toLocaleString() || '0.00'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Gross Amount</TableHead>
                            <TableHead>Net Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Loading payouts...
                                </TableCell>
                            </TableRow>
                        ) : pendingPayouts?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No pending payouts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pendingPayouts?.map((payout) => (
                                <TableRow key={payout.id}>
                                    <TableCell>EMP-{payout.employee_id}</TableCell>
                                    <TableCell>
                                        {new Date(payout.period_start).toLocaleDateString()} -{' '}
                                        {new Date(payout.period_end).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>${payout.gross_amount.toFixed(2)}</TableCell>
                                    <TableCell className="font-bold">
                                        ${payout.net_amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                payout.status === 'APPROVED'
                                                    ? 'default'
                                                    : payout.status === 'PAID'
                                                        ? 'outline'
                                                        : 'secondary'
                                            }
                                        >
                                            {payout.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {payout.status === 'PENDING' && (
                                            <Button
                                                size="sm"
                                                onClick={() => approveMutation.mutate(payout.id)}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        {payout.status === 'APPROVED' && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedPayout(payout)}
                                                    >
                                                        Pay Now
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Process Payment</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">
                                                                Payment Method
                                                            </label>
                                                            <Input
                                                                value={paymentDetails.method}
                                                                onChange={(e) =>
                                                                    setPaymentDetails({
                                                                        ...paymentDetails,
                                                                        method: e.target.value,
                                                                    })
                                                                }
                                                                placeholder="Bank Transfer, Check, etc."
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">
                                                                Reference Number
                                                            </label>
                                                            <Input
                                                                value={paymentDetails.reference}
                                                                onChange={(e) =>
                                                                    setPaymentDetails({
                                                                        ...paymentDetails,
                                                                        reference: e.target.value,
                                                                    })
                                                                }
                                                                placeholder="Transaction ID"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handlePay}>Confirm Payment</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
