// src/pages/Profile.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateUser, changeUserPassword } from '@/api/users';
import type { User as UserType } from '@/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  User as UserIcon,
  Shield,
  Mail,
  Phone,
  Calendar,
  Building,
  Save,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/hooks/useOnboarding';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const { resetOnboarding } = useOnboarding();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    department: typeof user?.department === 'object' ? user.department.name : (user?.department || ''),
    position: user?.position || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => updateUser(user!.id, data),
    onSuccess: (updatedUser) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      setUser(updatedUser.data);
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => changeUserPassword(user!.id, data),
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully",
      });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      new_password: passwordData.new_password,
      confirm_password: passwordData.confirm_password,
    });
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChangeField = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-blue-600">
            {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{user.full_name}</h1>
        <p className="text-muted-foreground">{user.email}</p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
            {user.role}
          </Badge>
          <Badge variant={user.is_active ? "default" : "secondary"}>
            {user.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Profile Information
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => handleProfileChange('full_name', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Contact administrator to change email
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="pl-10"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) => handleProfileChange('department', e.target.value)}
                        className="pl-10"
                        placeholder="Your department"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={profileData.position}
                      onChange={(e) => handleProfileChange('position', e.target.value)}
                      placeholder="Your job position"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Update Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <div className="text-sm text-muted-foreground">
                    {user.last_login ? (
                      new Date(user.last_login).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      'Never logged in'
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>User ID</Label>
                  <div className="text-sm text-muted-foreground font-mono">
                    {user.id}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.current_password}
                        onChange={(e) => handlePasswordChangeField('current_password', e.target.value)}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) => handlePasswordChangeField('new_password', e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirm_password}
                        onChange={(e) => handlePasswordChangeField('confirm_password', e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Onboarding Reset */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Onboarding Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Reset Onboarding Progress</p>
                  <p className="text-sm text-muted-foreground">
                    This will reset your onboarding progress and show the welcome wizard again.
                  </p>
                </div>
                <Button variant="outline" onClick={resetOnboarding}>
                  Reset Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Use a strong, unique password that you don't use for other accounts</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Change your password regularly, at least every 90 days</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Never share your password with anyone, including colleagues</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Log out from shared computers and devices after use</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
