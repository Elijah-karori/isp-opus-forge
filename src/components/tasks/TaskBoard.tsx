// src/components/tasks/TaskBoard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  CheckCircle, 
  Package,
  MapPin,
  Building,
  MoreVertical
} from 'lucide-react';
import { type Task } from '@/api/tasks';

interface TaskBoardProps {
  tasks: Task[];
  onStatusUpdate: (taskId: number, status: Task['status']) => void;
  onEditBOM: (task: Task) => void;
  onViewDetails: (task: Task) => void;
}

export function TaskBoard({ tasks, onStatusUpdate, onEditBOM, onViewDetails }: TaskBoardProps) {
  const columns = [
    {
      id: 'pending',
      title: 'Pending',
      icon: Clock,
      color: 'text-orange-500',
      tasks: tasks.filter(task => task.status === 'pending')
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      icon: User,
      color: 'text-blue-500',
      tasks: tasks.filter(task => task.status === 'in_progress')
    },
    {
      id: 'awaiting_approval',
      title: 'Awaiting Approval',
      icon: Package,
      color: 'text-yellow-500',
      tasks: tasks.filter(task => task.status === 'awaiting_approval')
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle,
      color: 'text-green-500',
      tasks: tasks.filter(task => task.status === 'completed')
    }
  ];

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    onStatusUpdate(taskId, newStatus);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <Card key={column.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <column.icon className={`h-4 w-4 ${column.color}`} />
                {column.title}
                <Badge variant="secondary" className="ml-2">
                  {column.tasks.length}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent 
            className="flex-1 space-y-3 min-h-[400px] p-4 bg-muted/30 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id as Task['status'])}
          >
            {column.tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                className="bg-white p-4 rounded-lg border shadow-sm cursor-move hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Task Header */}
                  <div className="flex items-start justify-between">
                    <h3 
                      className="font-medium text-sm cursor-pointer hover:text-blue-600"
                      onClick={() => onViewDetails(task)}
                    >
                      {task.title}
                    </h3>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {task.project?.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.project?.customer_name}
                    </div>
                    {task.project?.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{task.project.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Technician */}
                  {task.technician && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-xs">
                      <User className="h-3 w-3 text-blue-600" />
                      <span className="font-medium">{task.technician.full_name}</span>
                    </div>
                  )}

                  {/* BOM Status */}
                  <div className="flex items-center justify-between">
                    <Badge variant={task.bom_approved ? "default" : "outline"} className="text-xs">
                      <Package className="h-3 w-3 mr-1" />
                      BOM {task.bom_approved ? 'Approved' : 'Pending'}
                    </Badge>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      {!task.bom_approved && column.id === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => onEditBOM(task)}
                        >
                          Update BOM
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Date */}
                  {task.scheduled_date && (
                    <div className="text-xs text-muted-foreground">
                      Scheduled: {new Date(task.scheduled_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {column.tasks.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No tasks in {column.title.toLowerCase()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
