import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Mail, Phone, Lock, Building, Briefcase, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

const CreateTechnician = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    department: '',
    employee_id: '',
    engagement_type: 'full_time',
    hire_date: '',
    specialization: '',
    designation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Create the user
      const user = await apiClient.createUser({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role_ids: [3], // Assuming 3 is the technician role ID
      });

      // Step 2: Create the employee profile
      await apiClient.createEmployee({
        user_id: user.id,
        employee_code: formData.employee_id,
        engagement_type: formData.engagement_type,
        hire_date: formData.hire_date,
        department: formData.department,
        designation: formData.designation,
        specialization: formData.specialization,
      });

      toast({
        title: "Technician Created",
        description: "The new technician has been created successfully.",
      });
      navigate('/technicians');
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create technician",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Technician</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="full_name" value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="password" type="password" value={formData.password} onChange={e => handleChange('password', e.target.value)} className="pl-10" required />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Employment Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="department" value={formData.department} onChange={e => handleChange('department', e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input id="employee_id" value={formData.employee_id} onChange={e => handleChange('employee_id', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engagement_type">Engagement Type</Label>
                  <Select value={formData.engagement_type} onValueChange={value => handleChange('engagement_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engagement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="task_based">Task-based</SelectItem>
                      <SelectItem value="service_based">Service-based</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="hire_date" type="date" value={formData.hire_date} onChange={e => handleChange('hire_date', e.target.value)} className="pl-10" required />
                  </div>
                </div>
              </div>

              {/* Technician Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Technician Profile</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input id="specialization" value={formData.specialization} onChange={e => handleChange('specialization', e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Input id="designation" value={formData.designation} onChange={e => handleChange('designation', e.target.value)} />
                    </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Technician
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTechnician;
