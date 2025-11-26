// src/components/projects/CreateProjectDialog.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Loader2,
  Building,
  Home,
  Store,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface CreateProjectDialogProps {
  onClose: () => void;
  onCreate: (data: any) => void;
  isLoading?: boolean;
}

export function CreateProjectDialog({ onClose, onCreate, isLoading }: CreateProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    project_type: 'single_home' as 'apartment' | 'single_home' | 'commercial',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    division_id: '',
    department_id: '',
    project_manager_id: '',
    tech_lead_id: '',
    infrastructure_type: '' as '' | 'ppoe' | 'hotspot' | 'fiber' | 'wireless' | 'hybrid' | 'network_infrastructure',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    budget: '',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      name: formData.name,
      project_type: formData.project_type,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || undefined,
      customer_phone: formData.customer_phone || undefined,
      address: formData.address || undefined,
      division_id: formData.division_id ? parseInt(formData.division_id) : undefined,
      department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
      project_manager_id: formData.project_manager_id ? parseInt(formData.project_manager_id) : undefined,
      tech_lead_id: formData.tech_lead_id ? parseInt(formData.tech_lead_id) : undefined,
      infrastructure_type: formData.infrastructure_type || undefined,
      priority: formData.priority,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    };

    onCreate(projectData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const projectTypes = [
    { value: 'single_home', label: 'Single Home', icon: Home },
    { value: 'apartment', label: 'Apartment Complex', icon: Building },
    { value: 'commercial', label: 'Commercial Building', icon: Store },
  ];

  const infrastructureTypes = [
    { value: 'ppoe', label: 'PPPoE' },
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'fiber', label: 'Fiber' },
    { value: 'wireless', label: 'Wireless' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'network_infrastructure', label: 'Network Infrastructure' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Project Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name *</label>
                <Input
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project Type *</label>
                <Select value={formData.project_type} onValueChange={(value: any) => handleChange('project_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Infrastructure Type</label>
                <Select value={formData.infrastructure_type} onValueChange={(value: any) => handleChange('infrastructure_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select infrastructure" />
                  </SelectTrigger>
                  <SelectContent>
                    {infrastructureTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Division ID</label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.division_id}
                  onChange={(e) => handleChange('division_id', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department ID</label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.department_id}
                  onChange={(e) => handleChange('department_id', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Manager ID</label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.project_manager_id}
                  onChange={(e) => handleChange('project_manager_id', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tech Lead ID</label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.tech_lead_id}
                  onChange={(e) => handleChange('tech_lead_id', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Project description and scope..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={formData.priority} onValueChange={(value: any) => handleChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Information</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Enter customer name"
                  value={formData.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.customer_email}
                    onChange={(e) => handleChange('customer_email', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="+1 (555) 123-4567"
                    value={formData.customer_phone}
                    onChange={(e) => handleChange('customer_phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Enter project address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Project Timeline</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Building className="h-4 w-4" />
              )}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
