import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Phone, Building2, Lock, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  position: z.string().optional(),
});

const passwordSchema = z.object({
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    position: '',
  });
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    new_password: '',
    confirm_password: '',
  });
  
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordData, string>>>({});

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        position: user.position || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name as keyof ProfileData]) {
      setProfileErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name as keyof PasswordData]) {
      setPasswordErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});

    const result = profileSchema.safeParse(profileData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProfileData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ProfileData] = err.message;
        }
      });
      setProfileErrors(fieldErrors);
      return;
    }

    if (!user) return;

    setIsLoadingProfile(true);
    try {
      const updatedUser = await apiClient.updateUser(user.id, profileData);
      setUser({ ...user, ...updatedUser });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const result = passwordSchema.safeParse(passwordData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof PasswordData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof PasswordData] = err.message;
        }
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    setIsLoadingPassword(true);
    try {
      await apiClient.setPassword({
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });
      
      setPasswordData({ new_password: '', confirm_password: '' });
      toast({
        title: 'Password updated',
        description: 'Your password has been set successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to set password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="full_name"
                          name="full_name"
                          value={profileData.full_name}
                          onChange={handleProfileChange}
                          className="pl-10"
                          disabled={isLoadingProfile}
                        />
                      </div>
                      {profileErrors.full_name && (
                        <p className="text-sm text-destructive">{profileErrors.full_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={user.email}
                          className="pl-10 bg-muted"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                          disabled={isLoadingProfile}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="position"
                          name="position"
                          value={profileData.position}
                          onChange={handleProfileChange}
                          placeholder="Software Engineer"
                          className="pl-10"
                          disabled={isLoadingProfile}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoadingProfile}>
                      {isLoadingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Organization Info */}
            {(user.company || user.division || user.department) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization
                  </CardTitle>
                  <CardDescription>Your organization details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {user.company && (
                      <div>
                        <Label className="text-muted-foreground">Company</Label>
                        <p className="font-medium">{user.company.name}</p>
                      </div>
                    )}
                    {user.division && (
                      <div>
                        <Label className="text-muted-foreground">Division</Label>
                        <p className="font-medium">{user.division.name}</p>
                      </div>
                    )}
                    {user.department && (
                      <div>
                        <Label className="text-muted-foreground">Department</Label>
                        <p className="font-medium">{user.department.name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Set Password
                </CardTitle>
                <CardDescription>
                  Set or update your password for login
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new_password"
                          name="new_password"
                          type="password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className="pl-10"
                          disabled={isLoadingPassword}
                        />
                      </div>
                      {passwordErrors.new_password && (
                        <p className="text-sm text-destructive">{passwordErrors.new_password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm_password"
                          name="confirm_password"
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className="pl-10"
                          disabled={isLoadingPassword}
                        />
                      </div>
                      {passwordErrors.confirm_password && (
                        <p className="text-sm text-destructive">{passwordErrors.confirm_password}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoadingPassword}>
                      {isLoadingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting Password...
                        </>
                      ) : (
                        'Set Password'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Roles
                </CardTitle>
                <CardDescription>Your assigned roles in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.roles_v2 && user.roles_v2.length > 0 ? (
                    user.roles_v2.map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-sm py-1 px-3">
                        {role.name}
                        {role.level && (
                          <span className="ml-1 text-xs text-muted-foreground">(Level {role.level})</span>
                        )}
                      </Badge>
                    ))
                  ) : user.role ? (
                    <Badge variant="secondary" className="text-sm py-1 px-3">
                      {user.role}
                    </Badge>
                  ) : (
                    <p className="text-muted-foreground">No roles assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            {user.permissions_v2 && user.permissions_v2.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>Your current permissions in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Group permissions by resource */}
                    {Object.entries(
                      user.permissions_v2.reduce((acc, perm) => {
                        if (!acc[perm.resource]) acc[perm.resource] = [];
                        acc[perm.resource].push(perm);
                        return acc;
                      }, {} as Record<string, typeof user.permissions_v2>)
                    ).map(([resource, perms]) => (
                      <div key={resource}>
                        <h4 className="font-medium mb-2 capitalize">{resource.replace(/_/g, ' ')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {perms.map((perm, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {perm.action}
                              {perm.scope !== 'all' && (
                                <span className="ml-1 text-muted-foreground">({perm.scope})</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                        <Separator className="mt-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
