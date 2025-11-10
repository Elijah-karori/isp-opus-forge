// src/pages/Users.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getUsers, 
  createUser, 
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getRoles,
  getUserStats,
  type User,
  type Role
} from '@/api/users';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Plus, 
  Search, 
  Users as UsersIcon, 
  UserPlus,
  Shield,
  Activity,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  Download,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserManagement } from '@/components/users/UserManagement';
// import { RolesManagement } from '@/components/users/RolesManagement';
// import { UserActivity } from '@/components/users/UserActivity';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
// import { EditUserDialog } from '@/components/users/EditUserDialog';

const Users = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch users data
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => getUserStats(),
  });

  // User mutations
  const deactivateUserMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      toast({
        title: "User Deactivated",
        description: "User has been deactivated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deactivation Failed",
        description: error.message || "Failed to deactivate user",
        variant: "destructive",
      });
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      toast({
        title: "User Activated",
        description: "User has been activated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to activate user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleDeactivateUser = (userId: number) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Cannot Deactivate",
        description: "You cannot deactivate your own account",
        variant: "destructive",
      });
      return;
    }
    deactivateUserMutation.mutate(userId);
  };

  const handleActivateUser = (userId: number) => {
    activateUserMutation.mutate(userId);
  };

  const handleDeleteUser = (userId: number) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { class: string; label: string }> = {
      admin: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Admin' },
      finance: { class: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Finance' },
      hr: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'HR' },
      technician: { class: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'Technician' },
      procurement: { class: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Procurement' },
      marketing: { class: 'bg-pink-500/10 text-pink-500 border-pink-500/20', label: 'Marketing' },
    };
    return variants[role] || { class: 'bg-gray-500/10 text-gray-500 border-gray-500/20', label: role };
  };

  const isLoading = usersLoading || rolesLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userList = Array.isArray(users) ? users : [];
  const roleList = roles?.data || [];
  const statsData = stats?.data || {};

  // Filter users based on search and status
  const filteredUsers = userList.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const activeUsers = userList.filter(u => u.is_active);
  const inactiveUsers = userList.filter(u => !u.is_active);
  const adminUsers = userList.filter(u => u.roles?.includes('admin') || u.role === 'admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userList.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{adminUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              With admin privileges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleList.length}</div>
            <p className="text-xs text-muted-foreground">
              Defined roles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Users
            <Badge variant="outline" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {userList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles & Permissions
            <Badge variant="outline" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {roleList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            User Activity
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserManagement 
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeactivateUser={handleDeactivateUser}
            onActivateUser={handleActivateUser}
            onDeleteUser={handleDeleteUser}
            getRoleBadge={getRoleBadge}
            currentUserId={currentUser?.id}
          />
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          {/* <RolesManagement /> */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">Roles management coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          {/* <UserActivity /> */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">Activity logs coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      {showCreateDialog && (
        <CreateUserDialog 
          onClose={() => setShowCreateDialog(false)}
          onCreate={() => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowCreateDialog(false);
          }}
        />
      )}

      {/* Edit User Dialog */}
      {/* {showEditDialog && selectedUser && (
        <EditUserDialog 
          user={selectedUser}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedUser(null);
          }}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowEditDialog(false);
            setSelectedUser(null);
          }}
        />
      )} */}
    </div>
  );
};

export default Users;
