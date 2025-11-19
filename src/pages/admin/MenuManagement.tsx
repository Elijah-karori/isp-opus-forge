import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { MenuItemEditor } from '@/components/admin/MenuItemEditor';
import { RoleMenuAssignments } from '@/components/admin/RoleMenuAssignments';
import * as menusApi from '@/api/menus';

export default function MenuManagement() {
  const [editingItem, setEditingItem] = useState<menusApi.MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const response = await menusApi.getMenuItems();
      return response.data;
    },
  });

  const { data: roleMenus } = useQuery({
    queryKey: ['role-menus'],
    queryFn: async () => {
      const response = await menusApi.getAllRoleMenus();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: menusApi.deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['role-menus'] });
      toast({ title: 'Menu item deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete menu item', variant: 'destructive' });
    },
  });

  const handleEdit = (item: menusApi.MenuItem) => {
    setEditingItem(item);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsCreating(true);
  };

  const handleClose = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      deleteMutation.mutate(id);
    }
  };

  const buildMenuTree = (items: menusApi.MenuItem[] = []): menusApi.MenuItem[] => {
    const itemMap = new Map<number, menusApi.MenuItem>();
    const roots: menusApi.MenuItem[] = [];

    items.forEach((item) => {
      itemMap.set(item.id!, { ...item, children: [] });
    });

    items.forEach((item) => {
      const node = itemMap.get(item.id!);
      if (!node) return;

      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children!.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  };

  const renderMenuItem = (item: menusApi.MenuItem, depth = 0) => (
    <div key={item.id} className="space-y-2">
      <div
        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.label}</span>
            <Badge variant="outline" className="text-xs">
              {item.key}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {item.path} {item.icon && `• ${item.icon}`}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(item.id!)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {item.children?.map((child) => renderMenuItem(child, depth + 1))}
    </div>
  );

  if (isLoading) {
    return <div className="p-6">Loading menu management...</div>;
  }

  const menuTree = buildMenuTree(menuItems);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Configure role-based navigation menus</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Menu Item
        </Button>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="roles">Role Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>
                Manage navigation menu items and their hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {menuTree.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No menu items found. Create your first menu item to get started.
                </div>
              ) : (
                menuTree.map((item) => renderMenuItem(item))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <RoleMenuAssignments roleMenus={roleMenus || {}} />
        </TabsContent>
      </Tabs>

      {(isCreating || editingItem) && (
        <MenuItemEditor
          item={editingItem}
          onClose={handleClose}
          parentItems={menuItems || []}
        />
      )}
    </div>
  );
}
