import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

const Tasks = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.getTasks(),
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status] || 'bg-muted';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">Manage and track all tasks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(tasks) && tasks.map((task: any) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">#{task.id}</TableCell>
                  <TableCell>{task.project_id}</TableCell>
                  <TableCell>{task.technician_id || 'Unassigned'}</TableCell>
                  <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{task.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    {task.scheduled_date ? new Date(task.scheduled_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;
