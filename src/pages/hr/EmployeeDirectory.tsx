import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import hrApi, { EmployeeProfile } from '@/api/hrServices';
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
import { Plus, Search, User, FileText, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeDirectory() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState<Partial<EmployeeProfile>>({
        engagement_type: 'full_time',
        is_active: true,
    });

    const { data: employees, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await hrApi.listEmployees();
            return res.data; // axios response has .data
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<EmployeeProfile>) => hrApi.createEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setIsCreateOpen(false);
            toast.success('Employee created successfully');
            setNewEmployee({ engagement_type: 'full_time', is_active: true });
        },
        onError: () => {
            toast.error('Failed to create employee');
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id: number) => hrApi.toggleEmployeeStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee status updated');
        },
    });

    const filteredEmployees = employees?.filter(
        (emp) =>
            emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        createMutation.mutate(newEmployee);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
                    <p className="text-muted-foreground">
                        Manage your workforce, contracts, and profiles
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Employee</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Employee Code</label>
                                <Input
                                    value={newEmployee.employee_code || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, employee_code: e.target.value })
                                    }
                                    placeholder="EMP-001"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Designation</label>
                                <Input
                                    value={newEmployee.designation || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, designation: e.target.value })
                                    }
                                    placeholder="Senior Technician"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Input
                                    value={newEmployee.department || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, department: e.target.value })
                                    }
                                    placeholder="Field Operations"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Engagement Type</label>
                                <Select
                                    value={newEmployee.engagement_type}
                                    onValueChange={(v: any) =>
                                        setNewEmployee({ ...newEmployee, engagement_type: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_time">Full Time</SelectItem>
                                        <SelectItem value="part_time">Part Time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="temporary">Temporary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hire Date</label>
                                <Input
                                    type="date"
                                    value={newEmployee.hire_date || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, hire_date: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">User ID (System)</label>
                                <Input
                                    type="number"
                                    value={newEmployee.user_id || ''}
                                    onChange={(e) =>
                                        setNewEmployee({
                                            ...newEmployee,
                                            user_id: parseInt(e.target.value),
                                        })
                                    }
                                    placeholder="Linked User ID"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Employee'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employees?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {employees?.filter((e) => e.is_active).length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Set(employees?.map((e) => e.department)).size || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Tenure</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.2 Years</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employees..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    Loading employees...
                                </TableCell>
                            </TableRow>
                        ) : filteredEmployees?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees?.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">
                                        {employee.employee_code}
                                    </TableCell>
                                    <TableCell>{employee.designation}</TableCell>
                                    <TableCell>{employee.department}</TableCell>
                                    <TableCell className="capitalize">
                                        {employee.engagement_type.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={employee.is_active ? 'default' : 'secondary'}
                                            className="cursor-pointer"
                                            onClick={() => toggleStatusMutation.mutate(employee.user_id)}
                                        >
                                            {employee.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(employee.hire_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            View Profile
                                        </Button>
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
