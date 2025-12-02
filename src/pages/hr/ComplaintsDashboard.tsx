import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import hrApi, { Complaint } from '@/api/hrServices';
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
import { Textarea } from '@/components/ui/textarea';
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
import { AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ComplaintsDashboard() {
    const queryClient = useQueryClient();
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [newComplaint, setNewComplaint] = useState<Partial<Complaint>>({
        severity: 'medium',
        complaint_type: 'customer_service',
    });
    const [investigation, setInvestigation] = useState({
        isValid: true,
        notes: '',
        resolution: '',
    });
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

    const { data: complaints, isLoading } = useQuery({
        queryKey: ['complaints'],
        queryFn: () => hrApi.listComplaints().then((res) => res.data),
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<Complaint>) => hrApi.recordComplaint(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            setIsReportOpen(false);
            toast.success('Complaint recorded successfully');
        },
    });

    const investigateMutation = useMutation({
        mutationFn: (id: number) =>
            hrApi.investigateComplaint(
                id,
                investigation.isValid,
                investigation.notes,
                investigation.resolution
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            setSelectedComplaint(null);
            toast.success('Investigation recorded');
        },
    });

    const handleInvestigate = () => {
        if (selectedComplaint) {
            investigateMutation.mutate(selectedComplaint.id);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Complaints & Issues</h1>
                    <p className="text-muted-foreground">
                        Track and resolve employee and customer complaints
                    </p>
                </div>
                <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Report New Issue</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Employee ID</label>
                                <Input
                                    type="number"
                                    value={newComplaint.employee_id || ''}
                                    onChange={(e) =>
                                        setNewComplaint({
                                            ...newComplaint,
                                            employee_id: parseInt(e.target.value),
                                        })
                                    }
                                    placeholder="ID of involved employee"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select
                                    value={newComplaint.complaint_type}
                                    onValueChange={(v) =>
                                        setNewComplaint({ ...newComplaint, complaint_type: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer_service">Customer Service</SelectItem>
                                        <SelectItem value="technical_error">Technical Error</SelectItem>
                                        <SelectItem value="behavioral">Behavioral</SelectItem>
                                        <SelectItem value="attendance">Attendance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Severity</label>
                                <Select
                                    value={newComplaint.severity}
                                    onValueChange={(v: any) =>
                                        setNewComplaint({ ...newComplaint, severity: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={newComplaint.description || ''}
                                    onChange={(e) =>
                                        setNewComplaint({ ...newComplaint, description: e.target.value })
                                    }
                                    placeholder="Detailed description of the incident..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsReportOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => createMutation.mutate(newComplaint)}
                            >
                                Submit Report
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {complaints?.filter((c) => !c.resolution).length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved This Month</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {complaints?.filter((c) => c.resolution).length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Loading complaints...
                                </TableCell>
                            </TableRow>
                        ) : complaints?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No complaints found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            complaints?.map((complaint) => (
                                <TableRow key={complaint.id}>
                                    <TableCell>
                                        {new Date(complaint.reported_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>EMP-{complaint.employee_id}</TableCell>
                                    <TableCell className="capitalize">
                                        {complaint.complaint_type.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                complaint.severity === 'critical'
                                                    ? 'destructive'
                                                    : complaint.severity === 'high'
                                                        ? 'destructive'
                                                        : 'secondary'
                                            }
                                        >
                                            {complaint.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={complaint.resolution ? 'outline' : 'default'}>
                                            {complaint.resolution ? 'Resolved' : 'Open'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!complaint.resolution && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedComplaint(complaint)}
                                                    >
                                                        Investigate
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Investigate Complaint</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={investigation.isValid}
                                                                onChange={(e) =>
                                                                    setInvestigation({
                                                                        ...investigation,
                                                                        isValid: e.target.checked,
                                                                    })
                                                                }
                                                                className="h-4 w-4"
                                                            />
                                                            <label>Complaint is Valid</label>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">
                                                                Investigation Notes
                                                            </label>
                                                            <Textarea
                                                                value={investigation.notes}
                                                                onChange={(e) =>
                                                                    setInvestigation({
                                                                        ...investigation,
                                                                        notes: e.target.value,
                                                                    })
                                                                }
                                                                placeholder="Findings..."
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">
                                                                Resolution / Action Taken
                                                            </label>
                                                            <Input
                                                                value={investigation.resolution}
                                                                onChange={(e) =>
                                                                    setInvestigation({
                                                                        ...investigation,
                                                                        resolution: e.target.value,
                                                                    })
                                                                }
                                                                placeholder="Warning issued, deduction applied, etc."
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handleInvestigate}>
                                                            Close Case
                                                        </Button>
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
