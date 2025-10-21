// src/pages/Tasks.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getTasks, 
  updateTask, 
  updateTaskBOM,
  approveTaskBOM,
  completeTask,
  getTechnicians,
  getTaskStats,
  type Task,
  type Technician,
  type TaskItem
} from '@/api/tasks';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Building,
  Package,
  BarChart3,
  ClipboardList,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TechnicianPerformance } from '@/components/tasks/TechnicianPerformance';
import { BOMEditor } from '@/components/tasks/BOMEditor';
import { TaskDetails } from '@/components/tasks/TaskDetails';

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showBOMEditor, setShowBOMEditor] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  // Fetch tasks data
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.getTasks(),
  });

  const { data: technicians, isLoading: techLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => getTechnicians(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['task-stats'],
    queryFn: () => getTaskStats(),
  });

  // Task mutations
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: Partial<Task> }) =>
      updateTask(taskId, data),
    onSuccess: () => {
      toast({
        title: "Task Updated",
        description: "Task status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: any }) =>
      completeTask(taskId, data),
    onSuccess: () => {
      toast({
        title: "Task Completed",
        description: "Task marked as completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
    },
  });

  const handleStatusUpdate = (taskId: number, newStatus: Task['status']) => {
    updateTaskMutation.mutate({ taskId, data: { status: newStatus } });
  };

  const handleCompleteTask = (taskId: number, notes?: string, hours?: number) => {
    completeTaskMutation.mutate({ 
      taskId, 
      data: { completion_notes: notes, actual_hours: hours } 
    });
  };

  const handleEditBOM = (task: Task) => {
    setSelectedTask(task);
    setShowBOMEditor(true);
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const isLoading = tasksLoading || techLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const taskList = Array.isArray(tasks) ? tasks : [];
  const technicianList = technicians?.data || [];
  const statsData = stats?.data || {};

  // Filter tasks based on search
  const filteredTasks = taskList.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.project?.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.technician?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingTasks = taskList.filter(task => task.status === 'pending');
  const inProgressTasks = taskList.filter(task => task.status === 'in_progress');
  const completedTasks = taskList.filter(task => task.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Assign, track, and manage field technician tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tasks by title, customer, or technician..."
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
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.total_tasks || taskList.length}</div>
            <p className="text-xs text-muted-foreground">
              All assigned tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {statsData.completion_rate ? `${statsData.completion_rate}% rate` : 'Finished tasks'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="board" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Task Board
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="technicians" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Technicians
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Task Board Tab */}
        <TabsContent value="board" className="space-y-6">
          <TaskBoard 
            tasks={filteredTasks}
            onStatusUpdate={handleStatusUpdate}
            onEditBOM={handleEditBOM}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        {/* List View Tab */}
        <TabsContent value="list" className="space-y-6">
          <TasksListView 
            tasks={filteredTasks}
            onStatusUpdate={handleStatusUpdate}
            onEditBOM={handleEditBOM}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        {/* Technicians Tab */}
        <TabsContent value="technicians" className="space-y-6">
          <TechniciansManagement technicians={technicianList} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <TechnicianPerformance />
        </TabsContent>
      </Tabs>

      {/* BOM Editor Modal */}
      {showBOMEditor && selectedTask && (
        <BOMEditor 
          task={selectedTask}
          onClose={() => {
            setShowBOMEditor(false);
            setSelectedTask(null);
          }}
          onSave={() => {
            setShowBOMEditor(false);
            setSelectedTask(null);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
          }}
        />
      )}

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <TaskDetails 
          task={selectedTask}
          onClose={() => {
            setShowTaskDetails(false);
            setSelectedTask(null);
          }}
          onStatusUpdate={handleStatusUpdate}
          onComplete={handleCompleteTask}
        />
      )}
    </div>
  );
};

// List View Component
const TasksListView = ({ 
  tasks, 
  onStatusUpdate, 
  onEditBOM, 
  onViewDetails 
}: { 
  tasks: Task[];
  onStatusUpdate: (taskId: number, status: Task['status']) => void;
  onEditBOM: (task: Task) => void;
  onViewDetails: (task: Task) => void;
}) => {
  const getStatusBadge = (status: Task['status']) => {
    const variants = {
      pending: { class: 'bg-gray-500/10 text-gray-500 border-gray-500/20', label: 'Pending' },
      in_progress: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'In Progress' },
      awaiting_approval: { class: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'Awaiting Approval' },
      completed: { class: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Completed' },
      cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
    };
    return variants[status];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>BOM Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const statusBadge = getStatusBadge(task.status);
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium cursor-pointer hover:text-blue-600" 
                         onClick={() => onViewDetails(task)}>
                      {task.title}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {task.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{task.project?.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.project?.customer_name}
                    </div>
                    {task.project?.address && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.project.address}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.technician ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.technician.full_name}
                      </div>
                    ) : (
                      <Badge variant="outline">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.scheduled_date ? (
                      new Date(task.scheduled_date).toLocaleDateString()
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.bom_approved ? "default" : "outline"}>
                      {task.bom_approved ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {task.bom_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadge.class}>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails(task)}
                      >
                        View
                      </Button>
                      {!task.bom_approved && task.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditBOM(task)}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          BOM
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {tasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Technicians Management Component
const TechniciansManagement = ({ technicians }: { technicians: Technician[] }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Technician Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {technicians.map((tech) => (
              <Card key={tech.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    <div>
                      <h3 className="font-semibold">{tech.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{tech.email}</p>
                    </div>
                    </div>
                    {tech.certification_level && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        {tech.certification_level}
                      </Badge>
                    )}
                    {tech.skills && tech.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tech.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {tech.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tech.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{tech.tasks_assigned}</div>
                    <div className="text-muted-foreground">Assigned</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{tech.tasks_completed}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion Rate</span>
                    <span>{tech.completion_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${tech.completion_rate}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;
