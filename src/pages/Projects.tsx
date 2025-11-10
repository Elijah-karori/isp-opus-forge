// src/pages/Projects.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getProjects, 
  getProjectStats,
  createProject,
  updateProject,
  type Project,
  type ProjectFinancials
} from '@/api/projects';
import { apiClient } from '@/lib/api';
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
  Building, 
  Home, 
  Store,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProjectDashboard } from '@/components/projects/ProjectDashboard';
// import { ProjectDetails } from '@/components/projects/ProjectDetails';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';

const Projects = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects data
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['project-stats'],
    queryFn: () => getProjectStats(),
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "New project created successfully",
      });
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const getProjectTypeIcon = (type: Project['project_type']) => {
    switch (type) {
      case 'apartment': return Building;
      case 'single_home': return Home;
      case 'commercial': return Store;
      default: return Building;
    }
  };

  const getStatusBadge = (status: Project['status']) => {
    const variants = {
      planning: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Planning' },
      in_progress: { class: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'In Progress' },
      completed: { class: 'bg-gray-500/10 text-gray-500 border-gray-500/20', label: 'Completed' },
      on_hold: { class: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'On Hold' },
      cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
    };
    return variants[status];
  };

  const getPriorityBadge = (priority: Project['priority']) => {
    const variants = {
      low: { class: 'bg-gray-500/10 text-gray-500 border-gray-500/20', label: 'Low' },
      medium: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Medium' },
      high: { class: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'High' },
      urgent: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Urgent' },
    };
    return variants[priority];
  };

  const isLoading = projectsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const projectList = Array.isArray(projects) ? projects : [];
  const statsData = stats?.data || {};

  // Filter projects based on search and status
  const filteredProjects = projectList.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeProjects = projectList.filter(p => p.status === 'in_progress');
  const completedProjects = projectList.filter(p => p.status === 'completed');
  const planningProjects = projectList.filter(p => p.status === 'planning');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground">
            Track and manage all customer projects and installations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects by name, customer, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectList.length}</div>
            <p className="text-xs text-muted-foreground">
              All projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.budget_utilization || '0'}%</div>
            <p className="text-xs text-muted-foreground">
              Of total budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            All Projects
            <Badge variant="outline" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {projectList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Active
            {activeProjects.length > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeProjects.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Planning
            {planningProjects.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {planningProjects.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <ProjectDashboard />
        </TabsContent>

        {/* All Projects Tab */}
        <TabsContent value="all" className="space-y-6">
          <ProjectsListView 
            projects={filteredProjects}
            onProjectSelect={setSelectedProject}
            getProjectTypeIcon={getProjectTypeIcon}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        {/* Active Projects Tab */}
        <TabsContent value="active" className="space-y-6">
          <ProjectsListView 
            projects={activeProjects}
            onProjectSelect={setSelectedProject}
            getProjectTypeIcon={getProjectTypeIcon}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        {/* Planning Projects Tab */}
        <TabsContent value="planning" className="space-y-6">
          <ProjectsListView 
            projects={planningProjects}
            onProjectSelect={setSelectedProject}
            getProjectTypeIcon={getProjectTypeIcon}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      {showCreateDialog && (
        <CreateProjectDialog 
          onClose={() => setShowCreateDialog(false)}
          onCreate={createProjectMutation.mutate}
          isLoading={createProjectMutation.isPending}
        />
      )}

      {/* Project Details Modal - Coming Soon */}
      {selectedProject && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4"
            >
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedProject.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedProject.customer_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm">{selectedProject.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <p className="text-sm">{selectedProject.priority}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Projects List View Component
const ProjectsListView = ({ 
  projects, 
  onProjectSelect,
  getProjectTypeIcon,
  getStatusBadge,
  getPriorityBadge
}: { 
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  getProjectTypeIcon: (type: Project['project_type']) => any;
  getStatusBadge: (status: Project['status']) => any;
  getPriorityBadge: (priority: Project['priority']) => any;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <Badge variant="outline">
          {projects.length} projects
        </Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Actual Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const ProjectTypeIcon = getProjectTypeIcon(project.project_type);
              const statusBadge = getStatusBadge(project.status);
              const priorityBadge = getPriorityBadge(project.priority);
              const isOverBudget = project.budget && project.actual_cost > project.budget;

              return (
                <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell 
                    className="font-medium"
                    onClick={() => onProjectSelect(project)}
                  >
                    <div className="flex items-center gap-2">
                      <ProjectTypeIcon className="h-4 w-4 text-muted-foreground" />
                      {project.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {project.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{project.customer_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.customer_phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {project.project_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.budget ? (
                      <div className="font-medium">${project.budget.toLocaleString()}</div>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${
                      isOverBudget ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${project.actual_cost.toLocaleString()}
                      {isOverBudget && (
                        <AlertTriangle className="h-3 w-3 inline ml-1" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadge.class}>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityBadge.class}>
                      {priorityBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {project.start_date && (
                        <div>Start: {new Date(project.start_date).toLocaleDateString()}</div>
                      )}
                      {project.estimated_end_date && (
                        <div>Est. End: {new Date(project.estimated_end_date).toLocaleDateString()}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onProjectSelect(project)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {projects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects found</p>
            <p className="text-sm">Create your first project to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Projects;
