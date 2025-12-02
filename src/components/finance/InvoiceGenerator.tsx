import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { financialServicesApi, InvoiceCreateRequest } from '@/api/financialServices';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

interface InvoiceGeneratorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: number;
}

export function InvoiceGenerator({ open, onOpenChange, projectId: initialProjectId }: InvoiceGeneratorProps) {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        project_id: initialProjectId || '',
        milestone_name: '',
        amount: '',
        due_date: '',
    });

    // Fetch projects for dropdown
    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getProjects(),
        enabled: !initialProjectId,
    });

    const mutation = useMutation({
        mutationFn: (request: InvoiceCreateRequest) =>
            financialServicesApi.generateInvoice(request),
        onSuccess: (response) => {
            toast.success('Invoice generated successfully');
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['financial-snapshot'] });
            queryClient.invalidateQueries({ queryKey: ['project-financials'] });
            onOpenChange(false);
            resetForm();
        },
        onError: () => {
            toast.error('Failed to generate invoice');
        },
    });

    const handleSubmit = () => {
        const request: InvoiceCreateRequest = {
            project_id: parseInt(formData.project_id as string),
            milestone_name: formData.milestone_name,
            amount: parseFloat(formData.amount),
            due_date: formData.due_date || undefined,
        };
        mutation.mutate(request);
    };

    const resetForm = () => {
        setFormData({
            project_id: initialProjectId || '',
            milestone_name: '',
            amount: '',
            due_date: '',
        });
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Generate Invoice
                    </DialogTitle>
                    <DialogDescription>
                        Create a new invoice for a project milestone
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Project Selection */}
                    {!initialProjectId && (
                        <div>
                            <Label htmlFor="project_id">Project *</Label>
                            <Select
                                value={formData.project_id?.toString()}
                                onValueChange={(v) => updateField('project_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects?.data?.map((project: any) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.name} - {project.customer_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Milestone Name */}
                    <div>
                        <Label htmlFor="milestone_name">Milestone / Description *</Label>
                        <Input
                            id="milestone_name"
                            value={formData.milestone_name}
                            onChange={(e) => updateField('milestone_name', e.target.value)}
                            placeholder="e.g., Phase 1 Completion, Initial Deployment"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <Label htmlFor="amount">Amount (KES) *</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => updateField('amount', e.target.value)}
                            placeholder="Enter invoice amount"
                        />
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
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            mutation.isPending ||
                            !formData.project_id ||
                            !formData.milestone_name ||
                            !formData.amount
                        }
                    >
                        {mutation.isPending ? 'Generating...' : 'Generate Invoice'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
