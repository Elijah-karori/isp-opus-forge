import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import hrApi, { RateCard, EmployeeProfile } from '@/api/hrServices';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function RateCardManager() {
    const queryClient = useQueryClient();
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newRateCard, setNewRateCard] = useState<Partial<RateCard>>({
        rate_type: 'hourly',
        currency: 'USD',
        is_active: true,
        effective_from: new Date().toISOString().split('T')[0],
    });

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: () => hrApi.listEmployees().then((res) => res.data),
    });

    const { data: rateCards, isLoading } = useQuery({
        queryKey: ['rate-cards', selectedEmployee],
        queryFn: () =>
            selectedEmployee
                ? hrApi.getEmployeeRateCards(parseInt(selectedEmployee), false).then((res) => res.data)
                : Promise.resolve([]),
        enabled: !!selectedEmployee,
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<RateCard>) => hrApi.createRateCard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate-cards'] });
            setIsCreateOpen(false);
            toast.success('Rate card created successfully');
        },
        onError: () => {
            toast.error('Failed to create rate card');
        },
    });

    const handleCreate = () => {
        if (!selectedEmployee) {
            toast.error('Please select an employee first');
            return;
        }
        createMutation.mutate({
            ...newRateCard,
            employee_id: parseInt(selectedEmployee),
        });
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rate Card Management</h1>
                    <p className="text-muted-foreground">
                        Configure pay rates and compensation structures
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={!selectedEmployee}>
                            <Plus className="mr-2 h-4 w-4" /> Add Rate Card
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Rate Card</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rate Type</label>
                                <Select
                                    value={newRateCard.rate_type}
                                    onValueChange={(v: any) =>
                                        setNewRateCard({ ...newRateCard, rate_type: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hourly">Hourly</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="project">Per Project</SelectItem>
                                        <SelectItem value="task">Per Task</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <Input
                                    type="number"
                                    value={newRateCard.rate_amount || ''}
                                    onChange={(e) =>
                                        setNewRateCard({
                                            ...newRateCard,
                                            rate_amount: parseFloat(e.target.value),
                                        })
                                    }
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Currency</label>
                                <Input
                                    value={newRateCard.currency || 'USD'}
                                    onChange={(e) =>
                                        setNewRateCard({ ...newRateCard, currency: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Effective From</label>
                                <Input
                                    type="date"
                                    value={newRateCard.effective_from || ''}
                                    onChange={(e) =>
                                        setNewRateCard({ ...newRateCard, effective_from: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Saving...' : 'Create Rate Card'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-4">
                <div className="w-[300px]">
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an employee..." />
                        </SelectTrigger>
                        <SelectContent>
                            {employees?.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                    {emp.employee_code} - {emp.designation}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rates</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {rateCards?.filter((r) => r.is_active).length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Effective From</TableHead>
                            <TableHead>Effective To</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!selectedEmployee ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Select an employee to view rate cards.
                                </TableCell>
                            </TableRow>
                        ) : isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Loading rates...
                                </TableCell>
                            </TableRow>
                        ) : rateCards?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No rate cards found for this employee.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rateCards?.map((rate) => (
                                <TableRow key={rate.id}>
                                    <TableCell className="capitalize">{rate.rate_type}</TableCell>
                                    <TableCell className="font-medium">
                                        {rate.rate_amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>{rate.currency}</TableCell>
                                    <TableCell>
                                        {new Date(rate.effective_from).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {rate.effective_to
                                            ? new Date(rate.effective_to).toLocaleDateString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={rate.is_active ? 'default' : 'secondary'}>
                                            {rate.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
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
