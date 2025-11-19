import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import * as menusApi from '@/api/menus';

interface MenuItemEditorProps {
  item: menusApi.MenuItem | null;
  onClose: () => void;
  parentItems: menusApi.MenuItem[];
}

const LUCIDE_ICONS = [
  'Home', 'Users', 'Settings', 'Briefcase', 'CheckSquare', 'Archive', 
  'ShoppingCart', 'DollarSign', 'Mail', 'GitMerge', 'BarChart2', 'Calendar',
  'AlertTriangle', 'Truck', 'Target', 'FileText', 'CreditCard', 'Package'
];

export function MenuItemEditor({ item, onClose, parentItems }: MenuItemEditorProps) {
  const queryClient = useQueryClient();
  const isEditing = !!item;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      key: item?.key || '',
      label: item?.label || '',
      path: item?.path || '',
      icon: item?.icon || '',
      parent_id: item?.parent_id || null,
      order_index: item?.order_index || 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: menusApi.createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['role-menus'] });
      toast({ title: 'Menu item created successfully' });
      onClose();
    },
    onError: () => {
      toast({ title: 'Failed to create menu item', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<menusApi.MenuItem> }) =>
      menusApi.updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['role-menus'] });
      toast({ title: 'Menu item updated successfully' });
      onClose();
    },
    onError: () => {
      toast({ title: 'Failed to update menu item', variant: 'destructive' });
    },
  });

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      parent_id: data.parent_id === 'null' ? null : Number(data.parent_id),
      order_index: Number(data.order_index),
    };

    if (isEditing && item.id) {
      updateMutation.mutate({ id: item.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const selectedIcon = watch('icon');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Menu Item' : 'Create Menu Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key *</Label>
              <Input
                id="key"
                {...register('key', { required: 'Key is required' })}
                placeholder="dashboard"
              />
              {errors.key && (
                <p className="text-sm text-destructive">{errors.key.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                {...register('label', { required: 'Label is required' })}
                placeholder="Dashboard"
              />
              {errors.label && (
                <p className="text-sm text-destructive">{errors.label.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Path *</Label>
            <Input
              id="path"
              {...register('path', { required: 'Path is required' })}
              placeholder="/dashboard"
            />
            {errors.path && (
              <p className="text-sm text-destructive">{errors.path.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Lucide)</Label>
              <Select
                value={selectedIcon}
                onValueChange={(value) => setValue('icon', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No icon</SelectItem>
                  {LUCIDE_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Menu</Label>
              <Select
                value={watch('parent_id')?.toString() || 'null'}
                onValueChange={(value) => setValue('parent_id', value === 'null' ? null : Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">No parent (top level)</SelectItem>
                  {parentItems
                    .filter((p) => p.id !== item?.id)
                    .map((parent) => (
                      <SelectItem key={parent.id} value={parent.id!.toString()}>
                        {parent.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_index">Order Index</Label>
            <Input
              id="order_index"
              type="number"
              {...register('order_index')}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in the menu
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Update' : 'Create'} Menu Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
