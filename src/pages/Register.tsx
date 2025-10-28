
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Building,
  CheckCircle,
  XCircle,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Role {
    id: number;
    name: string;
    description: string;
}

// Fallback roles based on the provided database schema
const fallbackRoles: Role[] = [
    { id: 1, name: 'admin', description: 'Admin role with predefined permissions' },
    { id: 2, name: 'finance', description: 'Finance role with predefined permissions' },
    { id: 3, name: 'procurement', description: 'Procurement role with predefined permissions' },
    { id: 4, name: 'technician', description: 'Technician role with predefined permissions' },
    { id: 5, name: 'marketing', description: 'Marketing role with predefined permissions' },
    { id: 6, name: 'customer', description: 'Customer role with predefined permissions' },
    { id: 9, name: 'procurements', description: 'Procurement and purchasing department' },
    { id: 12, name: 'sales_marketing', description: 'Sales and Marketing department' },
    { id: 19, name: 'hr', description: 'Human Resources role with permissions' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role_ids: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
        try {
            // This is a placeholder for where you would fetch roles from your API
            // const fetchedRoles = await apiClient.getRoles(); 
            // setRoles(fetchedRoles);
            setRoles(fallbackRoles);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
            setRoles(fallbackRoles); // Use fallback if API fails
            toast({
                title: "Failed to load roles",
                description: "Using a default list of roles.",
                variant: "destructive"
            })
        }
    };
    fetchRoles();
  }, []);

  const passwordRequirements = [
    { id: 1, text: 'At least 8 characters', met: formData.password.length >= 8 },
    { id: 2, text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { id: 3, text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { id: 4, text: 'Contains number', met: /[0-9]/.test(formData.password) },
    { id: 5, text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirm_password) {
      toast({ title: "Password Mismatch", description: "Passwords do not match", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (!allRequirementsMet) {
      toast({ title: "Password Not Strong Enough", description: "Please ensure all password requirements are met", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (!formData.role_ids) {
        toast({ title: "Role Not Selected", description: "Please select a role for the new user.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    try {
        const { confirm_password, ...payload } = formData;
        const registrationPayload = {
            ...payload,
            role_ids: [parseInt(formData.role_ids, 10)],
        };
      
        await apiClient.registerUser(registrationPayload);

        toast({
            title: "Registration Successful",
            description: "The user has been created and an employee profile has been generated.",
        });
        navigate('/login');
    } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.message || "An unexpected error occurred.";
        toast({
            title: "Registration Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
           <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">ISP ERP</h1>
                <p className="text-sm text-gray-600">Enterprise Resource Planning</p>
              </div>
            </div>
          <h2 className="text-3xl font-bold text-gray-900">Create a New User Account</h2>
          <p className="mt-2 text-gray-600">Fill out the form to create a user and automatically enroll them as an employee.</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">New User Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input id="full_name" type="text" placeholder="Enter user's full name" value={formData.full_name} onChange={(e) => handleChange('full_name', e.target.value)} className="pl-10" required disabled={isLoading} />
                        </div>
                    </div>
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Work Email *</Label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input id="email" type="email" placeholder="user@company.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="pl-10" required disabled={isLoading} />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="pl-10" disabled={isLoading} />
                        </div>
                    </div>
                    {/* Role Selection */}
                    <div className="space-y-2">
                         <Label htmlFor="role_ids">Assign Role *</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                             <Select onValueChange={(value) => handleChange('role_ids', value)} value={formData.role_ids} disabled={isLoading}>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select a role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.length > 0 ? (
                                        roles.map(role => (
                                            <SelectItem key={role.id} value={String(role.id)}>{role.name.charAt(0).toUpperCase() + role.name.slice(1).replace(/_/g, ' ')}</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className="pl-10 pr-10" required disabled={isLoading} />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input id="confirm_password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirm_password} onChange={(e) => handleChange('confirm_password', e.target.value)} className="pl-10 pr-10" required disabled={isLoading} />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Password Requirements</Label>
                  <div className="space-y-2">
                    {passwordRequirements.map((req) => (
                      <div key={req.id} className="flex items-center gap-2 text-sm">
                        {req.met ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className={req.met ? 'text-green-600' : 'text-red-600'}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !allRequirementsMet}>
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating Account...</> : 'Create User and Employee'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

         <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-white font-bold">i</span>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                <p className="font-semibold">Automatic Enrollment</p>
                <p>Upon successful registration, a new user account will be created, and an associated employee profile will be automatically generated in the HR module.</p>
                <p>The user will be assigned the selected role, granting them the appropriate permissions and access rights across the ERP system.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
