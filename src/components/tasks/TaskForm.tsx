import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import * as tasksApi from '@/api/tasks';
import * as projectsApi from '@/api/projects';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface TaskFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: any;
    projectId?: number;
}

const TASK_STATUS = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'cancelled', label: 'Cancelled' },
];

const TASK_PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const ASSIGNED_ROLES = [
    { value: 'tech_lead', label: 'Tech Lead' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'technician', label: 'Technician' },
    { value: 'customer_support', label: 'Customer Support' },
    { value: 'marketing', label: 'Marketing' },
];

const INFRASTRUCTURE_TYPES = [
    { value: 'pppoe', label: 'PPPoE' },
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'fiber', label: 'Fiber' },
    { value: 'wireless', label: 'Wireless' },
    { value: 'network_infrastructure', label: 'Network Infrastructure' },
    { value: 'other', label: 'Other' },
];

export function TaskForm({ open, onOpenChange, task, projectId }: TaskFormProps) {
    const queryClient = useQueryClient();
    const isEdit = !!task;

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        project_id: task?.project_id || projectId || '',
        assigned_role: task?.assigned_role || 'technician',
        status: task?.status || 'pending',
        priority: task?.priority || 'medium',
        estimated_hours: task?.estimated_hours || '',
        due_date: task?.due_date?.split('T')[0] || '',
        infrastructure_type: task?.infrastructure_type || '',
    });

    // Fetch projects for dropdown
    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getProjects(),
    });

    const mutation = useMutation({
        mutationFn: (data: any) =>
            isEdit
                ? tasksApi.updateTask(task.id, data)
                : tasksApi.createTask(data),
        onSuccess: () => {
            toast.success(isEdit ? 'Task updated successfully' : 'Task created successfully');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            onOpenChange(false);
        },
        onError: () => {
            toast.error(isEdit ? 'Failed to update task' : 'Failed to create task');
        },
    });

    const handleSubmit = () => {
        const submitData = {
            ...formData,
            project_id: parseInt(formData.project_id as string),
            estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours as string) : null,
        };
        mutation.mutate(submitData);
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update task details' : 'Add a new task to the project'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Task Title */}
                    <div>
                        <Label htmlFor="title">Task Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="Enter task title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Describe the task details..."
                            rows={3}
                        />
                    </div>

                    {/* Project Selection */}
                    {!projectId && (
                        <div>
                            <Label htmlFor="project_id">Project *</Label>
                            <Select
                                value={formData.project_id.toString()}
                                onValueChange={(v) => updateField('project_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects?.data?.map((project: any) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Role and Status */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="assigned_role">Assigned Role *</Label>
                            <Select
                                value={formData.assigned_role}
                                onValueChange={(v) => updateField('assigned_role', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ASSIGNED_ROLES.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TASK_STATUS.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Priority and Estimated Hours */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={formData.priority} onValueChange={(v) => updateField('priority', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TASK_PRIORITIES.map((priority) => (
                                        <SelectItem key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="estimated_hours">Estimated Hours</Label>
                            <Input
                                id="estimated_hours"
                                type="number"
                                min="0"
                                step="0.5"
                                value={formData.estimated_hours}
                                onChange={(e) => updateField('estimated_hours', e.target.value)}
                                placeholder="Enter estimated hours"
                            />
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                            id="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => updateField('due_date', e.target.value)}
                        />
                    </div>

                    {/* Infrastructure Type */}
                    <div>
                        <Label htmlFor="infrastructure_type">Infrastructure Type</Label>
                        <Select
                            value={formData.infrastructure_type}
                            onValueChange={(v) => updateField('infrastructure_type', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select infrastructure type (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {INFRASTRUCTURE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !formData.title || !formData.project_id}
                    >
                        {mutation.isPending ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
