import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
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

interface ProjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: any;
}

const PROJECT_TYPES = [
    { value: 'installation', label: 'Installation' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'upgrade', label: 'Upgrade' },
    { value: 'consulting', label: 'Consulting' },
];

const INFRASTRUCTURE_TYPES = [
    { value: 'ppoe', label: 'PPPoE' },
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'fiber', label: 'Fiber' },
    { value: 'wireless', label: 'Wireless' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'network_infrastructure', label: 'Network Infrastructure' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

export function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
    const queryClient = useQueryClient();
    const isEdit = !!project;

    const [formData, setFormData] = useState({
        name: project?.name || '',
        project_type: project?.project_type || 'installation',
        customer_name: project?.customer_name || '',
        customer_email: project?.customer_email || '',
        customer_phone: project?.customer_phone || '',
        address: project?.address || '',
        infrastructure_type: project?.infrastructure_type || 'fiber',
        priority: project?.priority || 'medium',
        budget: project?.budget || '',
        start_date: project?.start_date?.split('T')[0] || '',
        end_date: project?.end_date?.split('T')[0] || '',
    });

    const mutation = useMutation({
        mutationFn: (data: any) =>
            isEdit
                ? projectsApi.updateProject(project.id, data)
                : projectsApi.createProject(data),
        onSuccess: () => {
            toast.success(isEdit ? 'Project updated successfully' : 'Project created successfully');
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            onOpenChange(false);
        },
        onError: () => {
            toast.error(isEdit ? 'Failed to update project' : 'Failed to create project');
        },
    });

    const handleSubmit = () => {
        const submitData = {
            ...formData,
            budget: formData.budget ? parseFloat(formData.budget) : null,
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
                    <DialogTitle>{isEdit ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update project details' : 'Enter project information to get started'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Project Name */}
                    <div>
                        <Label htmlFor="name">Project Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="Enter project name"
                        />
                    </div>

                    {/* Type and Infrastructure */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="project_type">Project Type *</Label>
                            <Select value={formData.project_type} onValueChange={(v) => updateField('project_type', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROJECT_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="infrastructure_type">Infrastructure Type *</Label>
                            <Select value={formData.infrastructure_type} onValueChange={(v) => updateField('infrastructure_type', v)}>
                                <SelectTrigger>
                                    <SelectValue />
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

                    {/* Customer Information */}
                    <div>
                        <Label htmlFor="customer_name">Customer Name *</Label>
                        <Input
                            id="customer_name"
                            value={formData.customer_name}
                            onChange={(e) => updateField('customer_name', e.target.value)}
                            placeholder="Enter customer name"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="customer_email">Customer Email</Label>
                            <Input
                                id="customer_email"
                                type="email"
                                value={formData.customer_email}
                                onChange={(e) => updateField('customer_email', e.target.value)}
                                placeholder="customer@example.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="customer_phone">Customer Phone</Label>
                            <Input
                                id="customer_phone"
                                value={formData.customer_phone}
                                onChange={(e) => updateField('customer_phone', e.target.value)}
                                placeholder="+254..."
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => updateField('address', e.target.value)}
                            placeholder="Project location address"
                            rows={2}
                        />
                    </div>

                    {/* Priority and Budget */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={formData.priority} onValueChange={(v) => updateField('priority', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITIES.map((priority) => (
                                        <SelectItem key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="budget">Budget (KES)</Label>
                            <Input
                                id="budget"
                                type="number"
                                min="0"
                                step="1000"
                                value={formData.budget}
                                onChange={(e) => updateField('budget', e.target.value)}
                                placeholder="Enter budget amount"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => updateField('start_date', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => updateField('end_date', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !formData.name || !formData.customer_name}
                    >
                        {mutation.isPending ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
