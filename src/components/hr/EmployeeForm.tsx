import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '@/api/hr';
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

interface EmployeeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee?: any;
}

const ENGAGEMENT_TYPES = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
];

export function EmployeeForm({ open, onOpenChange, employee }: EmployeeFormProps) {
    const queryClient = useQueryClient();
    const isEdit = !!employee;

    const [formData, setFormData] = useState({
        user_id: employee?.user_id || '',
        employee_code: employee?.employee_code || '',
        engagement_type: employee?.engagement_type || 'full_time',
        department: employee?.department || '',
        designation: employee?.designation || '',
        hire_date: employee?.hire_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        contract_end_date: employee?.contract_end_date?.split('T')[0] || '',
        emergency_contact_name: employee?.emergency_contact_name || '',
        emergency_contact_phone: employee?.emergency_contact_phone || '',
        address: employee?.address || '',
        bank_name: employee?.bank_name || '',
        bank_account: employee?.bank_account || '',
        tax_id: employee?.tax_id || '',
        certification_level: employee?.certification_level || '',
        notes: employee?.notes || '',
    });

    const mutation = useMutation({
        mutationFn: (data: any) => hrApi.createEmployee(data),
        onSuccess: () => {
            toast.success('Employee profile created successfully');
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });
            onOpenChange(false);
        },
        onError: () => {
            toast.error('Failed to create employee profile');
        },
    });

    const handleSubmit = () => {
        mutation.mutate(formData);
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Employee Profile</DialogTitle>
                    <DialogDescription>
                        Enter employee information to create a new profile
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Basic Information</h4>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="employee_code">Employee Code *</Label>
                                <Input
                                    id="employee_code"
                                    value={formData.employee_code}
                                    onChange={(e) => updateField('employee_code', e.target.value)}
                                    placeholder="EMP-001"
                                />
                            </div>

                            <div>
                                <Label htmlFor="engagement_type">Engagement Type *</Label>
                                <Select
                                    value={formData.engagement_type}
                                    onValueChange={(v) => updateField('engagement_type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ENGAGEMENT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => updateField('department', e.target.value)}
                                    placeholder="e.g., Engineering"
                                />
                            </div>

                            <div>
                                <Label htmlFor="designation">Designation</Label>
                                <Input
                                    id="designation"
                                    value={formData.designation}
                                    onChange={(e) => updateField('designation', e.target.value)}
                                    placeholder="e.g., Senior Technician"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Employment Dates */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Employment Dates</h4>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="hire_date">Hire Date *</Label>
                                <Input
                                    id="hire_date"
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={(e) => updateField('hire_date', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="contract_end_date">Contract End Date</Label>
                                <Input
                                    id="contract_end_date"
                                    type="date"
                                    value={formData.contract_end_date}
                                    onChange={(e) => updateField('contract_end_date', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Contact Information</h4>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => updateField('address', e.target.value)}
                                placeholder="Physical address"
                                rows={2}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                                <Input
                                    id="emergency_contact_name"
                                    value={formData.emergency_contact_name}
                                    onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                                    placeholder="Contact person name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                                <Input
                                    id="emergency_contact_phone"
                                    value={formData.emergency_contact_phone}
                                    onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                                    placeholder="+254..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Financial Information</h4>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="bank_name">Bank Name</Label>
                                <Input
                                    id="bank_name"
                                    value={formData.bank_name}
                                    onChange={(e) => updateField('bank_name', e.target.value)}
                                    placeholder="Bank name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="bank_account">Bank Account Number</Label>
                                <Input
                                    id="bank_account"
                                    value={formData.bank_account}
                                    onChange={(e) => updateField('bank_account', e.target.value)}
                                    placeholder="Account number"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tax_id">Tax ID / PIN</Label>
                            <Input
                                id="tax_id"
                                value={formData.tax_id}
                                onChange={(e) => updateField('tax_id', e.target.value)}
                                placeholder="Tax identification number"
                            />
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Additional Information</h4>

                        <div>
                            <Label htmlFor="certification_level">Certification Level</Label>
                            <Input
                                id="certification_level"
                                value={formData.certification_level}
                                onChange={(e) => updateField('certification_level', e.target.value)}
                                placeholder="e.g., Level 3 Certified"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                                placeholder="Additional notes about the employee"
                                rows={3}
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
                        disabled={mutation.isPending || !formData.employee_code || !formData.hire_date}
                    >
                        {mutation.isPending ? 'Creating...' : 'Create Employee'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
