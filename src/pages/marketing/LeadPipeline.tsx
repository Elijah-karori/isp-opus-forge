import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import marketingApi, { Lead } from '@/api/marketingServices';
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
import { Plus, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadPipeline() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newLead, setNewLead] = useState<Partial<Lead>>({
        status: 'new',
        source: 'website',
    });

    // Mock data
    const leads: Lead[] = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-0123',
            source: 'website',
            status: 'new',
            created_at: '2024-06-01',
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@company.com',
            phone: '555-0456',
            source: 'referral',
            status: 'contacted',
            created_at: '2024-06-02',
        },
    ];

    const createMutation = useMutation({
        mutationFn: (data: Partial<Lead>) => marketingApi.recordLead(data),
        onSuccess: () => {
            setIsCreateOpen(false);
            toast.success('Lead added successfully');
        },
    });

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lead Pipeline</h1>
                    <p className="text-muted-foreground">
                        Track and convert potential customers
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Lead
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Lead</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={newLead.name || ''}
                                    onChange={(e) =>
                                        setNewLead({ ...newLead, name: e.target.value })
                                    }
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={newLead.email || ''}
                                        onChange={(e) =>
                                            setNewLead({ ...newLead, email: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input
                                        value={newLead.phone || ''}
                                        onChange={(e) =>
                                            setNewLead({ ...newLead, phone: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Source</label>
                                <Select
                                    value={newLead.source}
                                    onValueChange={(v: any) =>
                                        setNewLead({ ...newLead, source: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="website">Website</SelectItem>
                                        <SelectItem value="referral">Referral</SelectItem>
                                        <SelectItem value="social_media">Social Media</SelectItem>
                                        <SelectItem value="cold_call">Cold Call</SelectItem>
                                        <SelectItem value="walk_in">Walk In</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => createMutation.mutate(newLead)}
                                disabled={createMutation.isPending}
                            >
                                Add Lead
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Added</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">{lead.name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-sm">
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" /> {lead.email}
                                        </span>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Phone className="h-3 w-3" /> {lead.phone}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">
                                    {lead.source.replace('_', ' ')}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="capitalize">
                                        {lead.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        Convert
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
