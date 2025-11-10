// src/components/users/CreateUserDialog.tsx
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Loader2, 
  User,
  Mail,
  Phone,
  Shield,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createUser, getRoles, type Role } from '@/api/users';

interface CreateUserDialogProps {
  onClose: () => void;
  onCreate: () => void;
}

export function CreateUserDialog({ onClose, onCreate }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    confirm_password: '',
    department: '',
    position: '',
    employee_id: '',
    role_ids: [] as number[],
    is_active: true,
  });
  const { toast } = useToast();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles(),
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been created successfully",
      });
      onCreate();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      email: formData.email,
      full_name: formData.full_name,
      phone: formData.phone || undefined,
      password: formData.password,
      role_ids: formData.role_ids,
      department: formData.department || undefined,
      position: formData.position || undefined,
      employee_id: formData.employee_id || undefined,
      is_active: formData.is_active,
    };

    createUserMutation.mutate(userData);
  };

  const handleChange = (field: string, value: string | number[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    if (checked) {
      handleChange('role_ids', [...formData.role_ids, roleId]);
    } else {
      handleChange('role_ids', formData.role_ids.filter(id => id !== roleId));
    }
  };

  const roleList = roles?.data || [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create New User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="user@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Security</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password *</label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirm_password}
                  onChange={(e) => handleChange('confirm_password', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Department Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Department Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  placeholder="Job position"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Employee ID</label>
              <Input
                placeholder="Employee identifier"
                value={formData.employee_id}
                onChange={(e) => handleChange('employee_id', e.target.value)}
              />
            </div>
          </div>

          {/* Roles and Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles & Permissions
            </h3>
            
            {rolesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {roleList.map((role: Role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={formData.role_ids.includes(role.id)}
                      onCheckedChange={(checked) => 
                        handleRoleToggle(role.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {role.name}
                      {role.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {role.description}
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked as boolean)}
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Activate user immediately
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createUserMutation.isPending}
              className="flex items-center gap-2"
            >
              {createUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <User className="h-4 w-4" />
              )}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
