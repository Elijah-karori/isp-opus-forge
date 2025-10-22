// src/components/users/UserManagement.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit,
  Trash2,
  Power,
  PowerOff,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Users as UsersIcon
} from 'lucide-react';
import { type User } from '@/api/users';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserManagementProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeactivateUser: (userId: number) => void;
  onActivateUser: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  getRoleBadge: (role: string) => { class: string; label: string };
  currentUserId?: number;
}

export function UserManagement({ 
  users, 
  onEditUser, 
  onDeactivateUser, 
  onActivateUser, 
  onDeleteUser,
  getRoleBadge,
  currentUserId 
}: UserManagementProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Directory</CardTitle>
        <Badge variant="outline">
          {users.length} users
        </Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const primaryRole = user.roles?.[0] || user.role;
              const roleBadge = getRoleBadge(primaryRole);
              const isCurrentUser = user.id === currentUserId;

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        {user.employee_id && (
                          <div className="text-xs text-muted-foreground">
                            ID: {user.employee_id}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.department ? (
                      <Badge variant="outline">{user.department}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                    {user.position && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {user.position}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className={roleBadge.class}>
                        {roleBadge.label}
                      </Badge>
                      {user.roles && user.roles.length > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.roles.length - 1}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? (
                        <div className="flex items-center gap-1">
                          <Power className="h-3 w-3" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <PowerOff className="h-3 w-3" />
                          Inactive
                        </div>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_login ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.last_login).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        
                        {user.is_active ? (
                          <DropdownMenuItem 
                            onClick={() => onDeactivateUser(user.id)}
                            disabled={isCurrentUser}
                          >
                            <PowerOff className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onActivateUser(user.id)}>
                            <Power className="h-4 w-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem 
                          onClick={() => onDeleteUser(user.id)}
                          disabled={isCurrentUser}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
