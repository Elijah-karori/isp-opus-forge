import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices';
import { getProjects } from '@/api/projects';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { validateRequired, validateCurrency, getRequiredError, getCurrencyError, validateDate } from '@/utils/validation';
import { formatCurrency, formatDateForAPI, formatPhoneForDisplay } from '@/utils/format';
import { handleAPIError } from '@/utils/errorHandler';

const InvoiceCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        project_id: '',
        milestone_name: '',
        amount: '',
        due_date: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch projects for dropdown
    const { data: projectsData } = useQuery({
        queryKey: ['projects'],
        queryFn: () => getProjects({})
    });

    const projects = projectsData?.data || [];

    // Create invoice mutation
    const createInvoiceMutation = useMutation({
        mutationFn: invoicesApi.generateInvoice,
        onSuccess: (response) => {
            toast.success('Invoice created successfully!');
            navigate(`/invoices/${response.id}`);
        },
        onError: (error: any) => {
            handleAPIError(error, 'Failed to create invoice');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const newErrors: Record<string, string> = {};

        const projectError = getRequiredError(formData.project_id, 'Project');
        if (projectError) newErrors.project_id = projectError;

        const milestoneError = getRequiredError(formData.milestone_name, 'Milestone');
        if (milestoneError) newErrors.milestone_name = milestoneError;

        const amountError = getCurrencyError(formData.amount, 'Amount');
        if (amountError) newErrors.amount = amountError;

        if (formData.due_date && !validateDate(formData.due_date)) {
            newErrors.due_date = 'Invalid date format';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the form errors');
            return;
        }

        createInvoiceMutation.mutate({
            project_id: parseInt(formData.project_id),
            milestone_name: formData.milestone_name,
            amount: parseFloat(formData.amount),
            due_date: formData.due_date ? formatDateForAPI(new Date(formData.due_date)) : undefined
        });
    };

    const selectedProject = projects.find((p: any) => p.id === parseInt(formData.project_id));

    return (
        <div className="container mx-auto py-6 max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create Invoice</h1>
                    <p className="text-muted-foreground mt-1">
                        Generate a new invoice for a project
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-6 space-y-6">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="project">Project *</Label>
                        <Select
                            value={formData.project_id}
                            onValueChange={(value) => {
                                setFormData({ ...formData, project_id: value });
                                if (errors.project_id) setErrors({ ...errors, project_id: '' });
                            }}
                        >
                            <SelectTrigger className={errors.project_id ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project: any) => (
                                    <SelectItem key={project.id} value={project.id.toString()}>
                                        {project.name} - {project.customer_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.project_id && <p className="text-sm text-destructive">{errors.project_id}</p>}
                    </div>

                    {/* Customer Info (Auto-populated) */}
                    {selectedProject && (
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <h3 className="font-semibold">Customer Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Name</p>
                                    <p className="font-medium">{selectedProject.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedProject.customer_email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Phone</p>
                                    <p className="font-medium">{selectedProject.customer_phone ? formatPhoneForDisplay(selectedProject.customer_phone) : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Project Type</p>
                                    <p className="font-medium capitalize">{selectedProject.project_type}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Milestone/Description */}
                    <div className="space-y-2">
                        <Label htmlFor="milestone">Milestone / Description *</Label>
                        <Textarea
                            id="milestone"
                            placeholder="e.g., Phase 1 Completion, Installation Services, etc."
                            value={formData.milestone_name}
                            onChange={(e) => {
                                setFormData({ ...formData, milestone_name: e.target.value });
                                if (errors.milestone_name) setErrors({ ...errors, milestone_name: '' });
                            }}
                            rows={3}
                            className={errors.milestone_name ? 'border-destructive' : ''}
                        />
                        {errors.milestone_name && <p className="text-sm text-destructive">{errors.milestone_name}</p>}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (KES) *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => {
                                setFormData({ ...formData, amount: e.target.value });
                                if (errors.amount) setErrors({ ...errors, amount: '' });
                            }}
                            className={errors.amount ? 'border-destructive' : ''}
                        />
                        {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                        {formData.amount && !errors.amount && (
                            <p className="text-sm text-muted-foreground">
                                {formatCurrency(parseFloat(formData.amount))}
                            </p>
                        )}
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                            id="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => {
                                setFormData({ ...formData, due_date: e.target.value });
                                if (errors.due_date) setErrors({ ...errors, due_date: '' });
                            }}
                            className={errors.due_date ? 'border-destructive' : ''}
                        />
                        {errors.due_date && <p className="text-sm text-destructive">{errors.due_date}</p>}
                        <p className="text-sm text-muted-foreground">
                            Leave empty for immediate payment
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/invoices')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createInvoiceMutation.isPending}>
                            <Save className="h-4 w-4 mr-2" />
                            {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default InvoiceCreate;
