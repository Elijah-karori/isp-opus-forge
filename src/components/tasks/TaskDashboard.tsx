import { useQuery } from '@tanstack/react-query';
import { dashboardsApi } from '@/api/dashboards';
import { getTasks } from '@/api/tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    ListTodo,
    Users,
    TrendingUp,
    Activity,
    Loader2,
} from 'lucide-react';

const COLORS = {
    pending: '#94a3b8',
    in_progress: '#3b82f6',
    awaiting_approval: '#f59e0b',
    completed: '#10b981',
    cancelled: '#ef4444',
};

const PRIORITY_COLORS = {
    low: '#94a3b8',
    medium: '#3b82f6',
    high: '#f59e0b',
    critical: '#ef4444',
};

export function TaskDashboard() {
    // Fetch task allocation data
    const { data: taskAllocation, isLoading: allocationLoading } = useQuery({
        queryKey: ['dashboard', 'task-allocation'],
        queryFn: () => dashboardsApi.getTaskAllocation(),
    });

    // Fetch team workload
    const { data: teamWorkload, isLoading: workloadLoading } = useQuery({
        queryKey: ['dashboard', 'team-workload'],
        queryFn: () => dashboardsApi.getTeamWorkload(),
    });

    // Fetch all tasks for statistics
    const { data: tasksData, isLoading: tasksLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => getTasks({ limit: 1000 }).then(res => res.data),
    });

    const isLoading = allocationLoading || workloadLoading || tasksLoading;

    // Calculate task statistics
    const tasks = tasksData || [];
    const taskStats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        awaiting_approval: tasks.filter(t => t.status === 'awaiting_approval').length,
        high_priority: tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length,
    };

    // Prepare status distribution data for pie chart
    const statusData = [
        { name: 'Pending', value: taskStats.pending, color: COLORS.pending },
        { name: 'In Progress', value: taskStats.in_progress, color: COLORS.in_progress },
        { name: 'Awaiting Approval', value: taskStats.awaiting_approval, color: COLORS.awaiting_approval },
        { name: 'Completed', value: taskStats.completed, color: COLORS.completed },
    ].filter(item => item.value > 0);

    // Prepare priority distribution data
    const priorityData = [
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: PRIORITY_COLORS.low },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: PRIORITY_COLORS.medium },
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: PRIORITY_COLORS.high },
        { name: 'Critical', value: tasks.filter(t => t.priority === 'critical').length, color: PRIORITY_COLORS.critical },
    ].filter(item => item.value > 0);

    // Prepare role allocation data for bar chart
    const roleData = taskAllocation?.by_role
        ? Object.entries(taskAllocation.by_role).map(([role, count]) => ({
            role: role.replace('_', ' '),
            tasks: count,
        }))
        : [];

    // Prepare team workload data
    const workloadData = teamWorkload?.team_members
        ?.sort((a, b) => b.active_tasks - a.active_tasks)
        .slice(0, 10) // Top 10 team members
        .map(member => ({
            name: member.full_name.split(' ')[0], // First name only
            active: member.active_tasks,
            completed: member.completed_tasks,
            workload: member.workload_percent,
        })) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{taskStats.total}</div>
                        <p className="text-xs text-muted-foreground">Across all projects</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{taskStats.in_progress}</div>
                        <p className="text-xs text-muted-foreground">
                            {taskStats.total > 0 ? Math.round((taskStats.in_progress / taskStats.total) * 100) : 0}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{taskStats.completed}</div>
                        <p className="text-xs text-muted-foreground">
                            {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% completion rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">{taskStats.high_priority}</div>
                        <p className="text-xs text-muted-foreground">Require immediate attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="status" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="status">Task Status</TabsTrigger>
                    <TabsTrigger value="priority">Priority Distribution</TabsTrigger>
                    <TabsTrigger value="roles">By Role</TabsTrigger>
                    <TabsTrigger value="workload">Team Workload</TabsTrigger>
                </TabsList>

                {/* Task Status Distribution */}
                <TabsContent value="status">
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Priority Distribution */}
                <TabsContent value="priority">
                    <Card>
                        <CardHeader>
                            <CardTitle>Priority Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tasks by Role */}
                <TabsContent value="roles">
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Allocation by Role</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={roleData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="role" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="tasks" fill="#3b82f6" name="Tasks Assigned" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Team Workload */}
                <TabsContent value="workload">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Workload (Top 10)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={workloadData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="active" fill="#3b82f6" name="Active Tasks" />
                                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Recent Tasks Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasks.slice(0, 5).map(task => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="space-y-1">
                                    <h4 className="font-medium">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {task.assignee && (
                                            <span className="text-xs text-muted-foreground">
                                                Assigned to: {task.assignee.full_name}
                                            </span>
                                        )}
                                        {task.assigned_role && (
                                            <Badge variant="outline" className="text-xs">
                                                {task.assigned_role.replace('_', ' ')}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className={
                                            task.status === 'completed'
                                                ? 'bg-green-500/10 text-green-500'
                                                : task.status === 'in_progress'
                                                    ? 'bg-blue-500/10 text-blue-500'
                                                    : task.status === 'awaiting_approval'
                                                        ? 'bg-orange-500/10 text-orange-500'
                                                        : 'bg-gray-500/10 text-gray-500'
                                        }
                                    >
                                        {task.status.replace('_', ' ')}
                                    </Badge>
                                    <Badge
                                        className={
                                            task.priority === 'critical'
                                                ? 'bg-red-500/10 text-red-500'
                                                : task.priority === 'high'
                                                    ? 'bg-orange-500/10 text-orange-500'
                                                    : task.priority === 'medium'
                                                        ? 'bg-blue-500/10 text-blue-500'
                                                        : 'bg-gray-500/10 text-gray-500'
                                        }
                                    >
                                        {task.priority}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
