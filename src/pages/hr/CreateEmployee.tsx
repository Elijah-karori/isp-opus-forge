
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { EngagementType } from '@/api/hr';

interface User {
    id: number;
    full_name: string;
    email: string;
}

interface Role {
    id: number;
    name: string;
}

const fallbackRoles: Role[] = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'finance' },
    { id: 3, name: 'procurement' },
    { id: 4, name: 'technician' },
    { id: 5, name: 'marketing' },
    { id: 6, name: 'customer' },
    { id: 9, name: 'procurements' },
    { id: 12, name: 'sales_marketing' },
    { id: 19, name: 'hr' },
];

const CreateEmployeePage = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    role_id: '',
    employee_code: '',
    engagement_type: 'FULL_TIME',
    department: '',
    designation: '',
    hire_date: '',
    contract_end_date: '' as string | undefined,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    bank_name: '',
    bank_account: '',
    tax_id: '',
    notes: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await apiClient.getUsers();
        if (usersData && Array.isArray(usersData.users)) {
          setUsers(usersData.users);
        } else {
          setUsers([]);
          console.error("API did not return a valid user array:", usersData);
        }
        setRoles(fallbackRoles);
      } catch (error) {
        toast({ title: "Failed to fetch data", description: "Could not load users or roles.", variant: "destructive" });
        setUsers([]);
        setRoles(fallbackRoles);
      }
    };
    fetchData();
  }, [toast]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value ? new Date(value).toISOString().split('T')[0] : undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.user_id || !formData.role_id || !formData.hire_date) {
        toast({ title: "Missing Required Fields", description: "Please select a user, role, and hire date.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    const payload = {
        ...formData,
        user_id: Number(formData.user_id),
        role_id: Number(formData.role_id),
        hire_date: formData.hire_date, 
        contract_end_date: formData.contract_end_date || null,
    };

    try {
      await apiClient.createEmployee(payload);
      toast({ title: "Employee Created", description: "The new employee profile has been successfully created." });
      navigate('/hr');
    } catch (error: any) {
      toast({
        title: "Failed to Create Employee",
        description: error.response?.data?.detail || error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Employee Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="user_id">User *</Label>
                <Select onValueChange={(value) => handleChange('user_id', value)} value={formData.user_id} disabled={isLoading}>
                  <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                  <SelectContent>
                    {users.map(user => <SelectItem key={user.id} value={String(user.id)}>{user.full_name} ({user.email})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role_id">Role *</Label>
                <Select onValueChange={(value) => handleChange('role_id', value)} value={formData.role_id} disabled={isLoading}>
                  <SelectTrigger><SelectValue placeholder="Select a role..." /></SelectTrigger>
                  <SelectContent>
                    {roles.map(role => <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_code">Employee Code</Label>
                <Input id="employee_code" value={formData.employee_code} onChange={(e) => handleChange('employee_code', e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engagement_type">Engagement Type *</Label>
                <Select onValueChange={(value) => handleChange('engagement_type', value)} value={formData.engagement_type} disabled={isLoading}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    {Object.values(EngagementType).map(type => (
                      <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={formData.department} onChange={(e) => handleChange('department', e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" value={formData.designation} onChange={(e) => handleChange('designation', e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire_date">Hire Date *</Label>
                <Input id="hire_date" type="date" value={formData.hire_date} onChange={(e) => handleDateChange('hire_date', e.target.value)} disabled={isLoading} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_end_date">Contract End Date</Label>
                <Input id="contract_end_date" type="date" value={formData.contract_end_date || ''} onChange={(e) => handleDateChange('contract_end_date', e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                <Input id="emergency_contact_name" value={formData.emergency_contact_name} onChange={(e) => handleChange('emergency_contact_name', e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                <Input id="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={(e) => handleChange('emergency_contact_phone', e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input id="bank_name" value={formData.bank_name} onChange={(e) => handleChange('bank_name', e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account">Bank Account</Label>
                <Input id="bank_account" value={formData.bank_account} onChange={(e) => handleChange('bank_account', e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID</Label>
                <Input id="tax_id" value={formData.tax_id} onChange={(e) => handleChange('tax_id', e.target.value)} disabled={isLoading} />
              </div>
            </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Any additional notes about the employee..." disabled={isLoading} />
              </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : 'Create Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEmployeePage;
