import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import * as menusApi from '@/api/menus';

interface RoleMenuAssignmentsProps {
  roleMenus: menusApi.MenusByRole;
}

export function RoleMenuAssignments({ roleMenus }: RoleMenuAssignmentsProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const { data: availableRoles } = useQuery({
    queryKey: ['available-roles'],
    queryFn: async () => {
      const response = await menusApi.getAvailableRoles();
      return response.data;
    },
  });

  const { data: allMenuItems } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const response = await menusApi.getMenuItems();
      return response.data;
    },
  });

  const bulkAssignMutation = useMutation({
    mutationFn: ({ role, menuIds }: { role: string; menuIds: number[] }) =>
      menusApi.bulkAssignMenusToRole(role, menuIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-menus'] });
      toast({ title: 'Menu assignments updated successfully' });
      setSelectedMenuIds([]);
    },
    onError: () => {
      toast({ title: 'Failed to update menu assignments', variant: 'destructive' });
    },
  });

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    const roleMenu = roleMenus[role] || [];
    const menuIds = roleMenu.map((item) => item.id!).filter(Boolean);
    setSelectedMenuIds(menuIds);
  };

  const toggleMenuItem = (menuId: number) => {
    setSelectedMenuIds((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleSave = () => {
    if (!selectedRole) {
      toast({ title: 'Please select a role', variant: 'destructive' });
      return;
    }
    bulkAssignMutation.mutate({ role: selectedRole, menuIds: selectedMenuIds });
  };

  const roles = availableRoles || Object.keys(roleMenus);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Role Menu Assignments</CardTitle>
          <CardDescription>
            Assign menu items to specific roles. Users with these roles will see the assigned menu items.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Role</label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role to configure" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRole && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Available Menu Items</label>
                  <Badge variant="secondary">
                    {selectedMenuIds.length} selected
                  </Badge>
                </div>

                <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                  {allMenuItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedMenuIds.includes(item.id!)}
                        onCheckedChange={() => toggleMenuItem(item.id!)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.path} {item.icon && `• ${item.icon}`}
                        </div>
                      </div>
                      {selectedMenuIds.includes(item.id!) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRole('');
                    setSelectedMenuIds([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={bulkAssignMutation.isPending}
                >
                  Save Assignments
                </Button>
              </div>
            </>
          )}

          {!selectedRole && (
            <div className="text-center py-8 text-muted-foreground">
              Select a role to view and configure its menu assignments
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Role Assignments Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(roleMenus).map(([role, menus]) => (
              <div key={role} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold capitalize">{role}</h4>
                  <Badge variant="outline">{menus.length} menus</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {menus.map((menu) => (
                    <Badge key={menu.id} variant="secondary">
                      {menu.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
