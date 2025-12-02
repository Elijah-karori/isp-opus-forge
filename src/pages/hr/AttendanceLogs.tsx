import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import hrApi, { AttendanceRecord } from '@/api/hrServices';
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
import { Calendar, Clock, MapPin, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceLogs() {
    const queryClient = useQueryClient();
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30))
            .toISOString()
            .split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [newLog, setNewLog] = useState<Partial<AttendanceRecord>>({
        status: 'present',
        date: new Date().toISOString().split('T')[0],
    });

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: () => hrApi.listEmployees().then((res) => res.data),
    });

    const { data: attendance, isLoading } = useQuery({
        queryKey: ['attendance', selectedEmployee, dateRange],
        queryFn: () =>
            selectedEmployee
                ? hrApi
                    .getEmployeeAttendance(
                        parseInt(selectedEmployee),
                        dateRange.start,
                        dateRange.end
                    )
                    .then((res) => res.data)
                : Promise.resolve([]),
        enabled: !!selectedEmployee,
    });

    const logMutation = useMutation({
        mutationFn: (data: Partial<AttendanceRecord>) => hrApi.recordAttendance(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            setIsLogOpen(false);
            toast.success('Attendance logged successfully');
        },
    });

    const handleLog = () => {
        if (!selectedEmployee) {
            toast.error('Please select an employee');
            return;
        }
        logMutation.mutate({
            ...newLog,
            employee_id: parseInt(selectedEmployee),
        });
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance Logs</h1>
                    <p className="text-muted-foreground">
                        Monitor employee check-ins, leaves, and working hours
                    </p>
                </div>
                <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={!selectedEmployee}>
                            <Clock className="mr-2 h-4 w-4" /> Log Attendance
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manual Attendance Log</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    value={newLog.date}
                                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={newLog.status}
                                    onValueChange={(v: any) => setNewLog({ ...newLog, status: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="present">Present</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                        <SelectItem value="half_day">Half Day</SelectItem>
                                        <SelectItem value="leave">Leave</SelectItem>
                                        <SelectItem value="holiday">Holiday</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Check In</label>
                                    <Input
                                        type="time"
                                        value={newLog.check_in || ''}
                                        onChange={(e) =>
                                            setNewLog({ ...newLog, check_in: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Check Out</label>
                                    <Input
                                        type="time"
                                        value={newLog.check_out || ''}
                                        onChange={(e) =>
                                            setNewLog({ ...newLog, check_out: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input
                                    value={newLog.check_in_location || ''}
                                    onChange={(e) =>
                                        setNewLog({ ...newLog, check_in_location: e.target.value })
                                    }
                                    placeholder="Office, Site A, Remote..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsLogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleLog} disabled={logMutation.isPending}>
                                Save Record
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-[300px] space-y-2">
                    <label className="text-sm font-medium">Employee</label>
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
                <div className="flex gap-2 items-center">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">From</label>
                        <Input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) =>
                                setDateRange({ ...dateRange, start: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">To</label>
                        <Input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) =>
                                setDateRange({ ...dateRange, end: e.target.value })
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Days Present</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {attendance?.filter((a) => a.status === 'present').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {attendance
                                ?.reduce((sum, a) => sum + (a.hours_worked || 0), 0)
                                .toFixed(1) || '0.0'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Location</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!selectedEmployee ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Select an employee to view attendance records.
                                </TableCell>
                            </TableRow>
                        ) : isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Loading records...
                                </TableCell>
                            </TableRow>
                        ) : attendance?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No attendance records found for this period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            attendance?.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>
                                        {new Date(record.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                record.status === 'present'
                                                    ? 'default'
                                                    : record.status === 'absent'
                                                        ? 'destructive'
                                                        : 'secondary'
                                            }
                                            className="capitalize"
                                        >
                                            {record.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{record.check_in || '-'}</TableCell>
                                    <TableCell>{record.check_out || '-'}</TableCell>
                                    <TableCell>{record.hours_worked || '-'}</TableCell>
                                    <TableCell>
                                        {record.check_in_location && (
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {record.check_in_location}
                                            </div>
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
