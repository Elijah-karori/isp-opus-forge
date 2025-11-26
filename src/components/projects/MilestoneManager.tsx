import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getProjectMilestones,
    createMilestone,
    updateMilestone,
    type Milestone,
    type MilestoneCreate,
    type MilestoneUpdate,
} from '@/api/projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, CheckCircle, Circle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface MilestoneManagerProps {
    projectId: number;
}

export function MilestoneManager({ projectId }: MilestoneManagerProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newMilestone, setNewMilestone] = useState<Partial<MilestoneCreate>>({
        project_id: projectId,
        order_index: 0,
    });

    // Fetch milestones
    const { data: milestones, isLoading } = useQuery({
        queryKey: ['milestones', projectId],
        queryFn: () => getProjectMilestones(projectId).then(res => res.data),
    });

    // Create milestone mutation
    const createMutation = useMutation({
        mutationFn: (data: MilestoneCreate) => createMilestone(projectId, data),
        onSuccess: () => {
            toast({ title: 'Milestone created successfully' });
            setIsCreateOpen(false);
            setNewMilestone({ project_id: projectId, order_index: 0 });
            queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
        },
        onError: (error: any) => {
            toast({
                title: 'Failed to create milestone',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Update milestone mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: MilestoneUpdate }) =>
            updateMilestone(id, data),
        onSuccess: () => {
            toast({ title: 'Milestone updated successfully' });
            queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
        },
        onError: (error: any) => {
            toast({
                title: 'Failed to update milestone',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const getStatusIcon = (status: Milestone['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'in_progress':
                return <Clock className="h-5 w-5 text-blue-500" />;
            case 'delayed':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            default:
                return <Circle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: Milestone['status']) => {
        const variants = {
            pending: 'bg-gray-500/10 text-gray-500',
            in_progress: 'bg-blue-500/10 text-blue-500',
            completed: 'bg-green-500/10 text-green-500',
            delayed: 'bg-red-500/10 text-red-500',
        };
        return variants[status];
    };

    const handleCreateMilestone = () => {
        if (!newMilestone.name) {
            toast({ title: 'Name is required', variant: 'destructive' });
            return;
        }
        createMutation.mutate(newMilestone as MilestoneCreate);
    };

    const handleStatusChange = (milestone: Milestone, newStatus: Milestone['status']) => {
        const updateData: MilestoneUpdate = { status: newStatus };
        if (newStatus === 'completed') {
            updateData.completed_date = new Date().toISOString();
        }
        updateMutation.mutate({ id: milestone.id, data: updateData });
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    const sortedMilestones = milestones?.sort((a, b) => a.order_index - b.order_index) || [];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Project Milestones</CardTitle>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Milestone
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Milestone</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newMilestone.name || ''}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                                    placeholder="E.g., Phase 1 Complete"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    value={newMilestone.description || ''}
                                    onChange={(e) =>
                                        setNewMilestone({ ...newMilestone, description: e.target.value })
                                    }
                                    placeholder="Milestone description"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due Date (Optional)</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={newMilestone.due_date?.split('T')[0] || ''}
                                    onChange={(e) =>
                                        setNewMilestone({
                                            ...newMilestone,
                                            due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={newMilestone.order_index || 0}
                                    onChange={(e) =>
                                        setNewMilestone({ ...newMilestone, order_index: parseInt(e.target.value) })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateMilestone} disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {sortedMilestones.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No milestones yet. Add one to get started.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Timeline visualization */}
                        <div className="relative">
                            {sortedMilestones.map((milestone, index) => (
                                <div key={milestone.id} className="relative flex gap-4 pb-8">
                                    {/* Timeline line */}
                                    {index < sortedMilestones.length - 1 && (
                                        <div className="absolute left-[10px] top-8 bottom-0 w-0.5 bg-border" />
                                    )}

                                    {/* Status icon */}
                                    <div className="relative z-10 mt-1">{getStatusIcon(milestone.status)}</div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <h4 className="font-semibold">{milestone.name}</h4>
                                                {milestone.description && (
                                                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                                )}
                                            </div>
                                            <Badge className={getStatusBadge(milestone.status)}>
                                                {milestone.status.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            {milestone.due_date && (
                                                <span>Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}</span>
                                            )}
                                            {milestone.completed_date && (
                                                <span>
                                                    Completed: {format(new Date(milestone.completed_date), 'MMM d, yyyy')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Status selector */}
                                        <Select
                                            value={milestone.status}
                                            onValueChange={(value) =>
                                                handleStatusChange(milestone, value as Milestone['status'])
                                            }
                                            disabled={updateMutation.isPending}
                                        >
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="delayed">Delayed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
