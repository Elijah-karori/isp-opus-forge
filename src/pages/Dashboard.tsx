import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { dashboardsApi } from '@/api/dashboards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    ClipboardList,
    FolderKanban,
    Users,
    Briefcase,
    Target,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PermissionGate from '@/components/PermissionGate';
import { PERMISSIONS } from '@/constants/permissions';

export default function Dashboard() {
    const { user } = useAuth();

    // Projects Overview
    const { data: projectsOverview, isLoading: projectsLoading } = useQuery({
        queryKey: ['dashboard', 'projects-overview'],
        queryFn: () => dashboardsApi.getProjectsOverview(),
    });

    // Task Allocation
    const { data: taskAllocation, isLoading: tasksLoading } = useQuery({
        queryKey: ['dashboard', 'task-allocation'],
        queryFn: () => dashboardsApi.getTaskAllocation(),
    });

    // Budget Tracking
    const { data: budgetTracking, isLoading: budgetLoading } = useQuery({
        queryKey: ['dashboard', 'budget-tracking'],
        queryFn: () => dashboardsApi.getBudgetTracking(),
        enabled: !!user?.permissions_v2?.some(p =>
            p.name === PERMISSIONS.FINANCE.READ_ALL ||
            p.name === PERMISSIONS.DASHBOARD.VIEW_ALL
        ),
    });

    // Team Workload
    const { data: teamWorkload, isLoading: workloadLoading } = useQuery({
        queryKey: ['dashboard', 'team-workload'],
        queryFn: () => dashboardsApi.getTeamWorkload(),
        enabled: !!user?.permissions_v2?.some(p =>
            p.name === PERMISSIONS.HR.READ_ALL ||
            p.name === PERMISSIONS.DASHBOARD.VIEW_ALL
        ),
    });

    const isLoading = projectsLoading || tasksLoading || budgetLoading || workloadLoading;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {user?.full_name || 'User'}
                </p>
                <div className="flex gap-2 mt-2">
                    {user?.roles_v2?.map(role => (
                        <Badge key={role.id} variant="secondary">
                            {role.name}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* Projects Overview */}
            {projectsOverview && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderKanban className="h-5 w-5" />
                            Projects Overview
                        </CardTitle>
                        <CardDescription>
                            Status breakdown of all projects
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="p-4 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Projects</p>
                                        <p className="text-2xl font-bold">{projectsOverview?.total_projects ?? 0}</p>
                                    </div>
                                    <Briefcase className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">In Progress</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {projectsOverview?.by_status?.in_progress ?? 0}
                                        </p>
                                    </div>
                                    <Target className="h-8 w-8 text-green-600" />
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Completed</p>
                                        <p className="text-2xl font-bold text-green-700">
                                            {projectsOverview?.by_status?.completed ?? 0}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-green-700" />
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Planning</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {projectsOverview?.by_status?.planning ?? 0}
                                        </p>
                                    </div>
                                    <BarChart className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">On Hold</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {projectsOverview?.by_status?.on_hold ?? 0}
                                        </p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-orange-600" />
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-red-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cancelled</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {projectsOverview?.by_status?.cancelled ?? 0}
                                        </p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <PermissionGate anyPermission={['project:read:all', 'project:read:own']}>
                                <Link to="/projects">
                                    <Button size="sm">
                                        View All Projects
                                    </Button>
                                </Link>
                            </PermissionGate>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Task Allocation */}
            {taskAllocation && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            Task Allocation
                        </CardTitle>
                        <CardDescription>
                            Task distribution across roles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground">Total Tasks</p>
                                <p className="text-2xl font-bold">{taskAllocation?.total_tasks ?? 0}</p>
                            </div>

                            <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground">Tech Lead</p>
                                <p className="text-xl font-bold">{taskAllocation?.by_role?.tech_lead ?? 0}</p>
                            </div>

                            <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground">Project Manager</p>
                                <p className="text-xl font-bold">{taskAllocation?.by_role?.project_manager ?? 0}</p>
                            </div>

                            <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground">Technician</p>
                                <p className="text-xl font-bold">{taskAllocation?.by_role?.technician ?? 0}</p>
                            </div>

                            <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground">Marketing</p>
                                <p className="text-xl font-bold">{taskAllocation?.by_role?.marketing ?? 0}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <PermissionGate anyPermission={['task:read:all', 'task:read:assigned']}>
                                <Link to="/tasks">
                                    <Button size="sm">
                                        View All Tasks
                                    </Button>
                                </Link>
                            </PermissionGate>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Budget Tracking */}
            <PermissionGate anyPermission={[PERMISSIONS.FINANCE.READ_ALL, PERMISSIONS.DASHBOARD.VIEW_ALL]}>
                {budgetTracking && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Budget Tracking
                            </CardTitle>
                            <CardDescription>
                                Financial overview across projects
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="p-4 rounded-lg border">
                                    <p className="text-sm text-muted-foreground">Total Allocated</p>
                                    <p className="text-2xl font-bold">
                                        KES {budgetTracking.total_allocated.toLocaleString()}
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border">
                                    <p className="text-sm text-muted-foreground">Total Spent</p>
                                    <p className="text-2xl font-bold">
                                        KES {budgetTracking.total_spent.toLocaleString()}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg border ${budgetTracking.variance >= 0
                                    ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                                    : 'border-red-200 bg-red-50 dark:bg-red-950/20'
                                    }`}>
                                    <p className="text-sm text-muted-foreground">Variance</p>
                                    <p className={`text-2xl font-bold ${budgetTracking.variance >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        KES {Math.abs(budgetTracking.variance).toLocaleString()}
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border">
                                    <p className="text-sm text-muted-foreground">Variance %</p>
                                    <p className={`text-2xl font-bold ${budgetTracking.variance_percent >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {budgetTracking.variance_percent.toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            {budgetTracking.by_project && budgetTracking.by_project.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold mb-3">Top Variances</h4>
                                    <div className="space-y-2">
                                        {budgetTracking.by_project.slice(0, 5).map(project => (
                                            <div key={project.project_id} className="flex items-center justify-between p-2 rounded border">
                                                <span className="text-sm">{project.project_name}</span>
                                                <div className="flex gap-4 text-sm">
                                                    <span className="text-muted-foreground">
                                                        Allocated: KES {project.allocated.toLocaleString()}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        Spent: KES {project.spent.toLocaleString()}
                                                    </span>
                                                    <span className={project.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        Variance: KES {Math.abs(project.variance).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </PermissionGate>

            {/* Team Workload */}
            <PermissionGate anyPermission={[PERMISSIONS.HR.READ_ALL, PERMISSIONS.DASHBOARD.VIEW_ALL]}>
                {teamWorkload && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Team Workload
                            </CardTitle>
                            <CardDescription>
                                Current team member assignments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {teamWorkload.team_members.slice(0, 10).map(member => (
                                    <div key={member.user_id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex-1">
                                            <p className="font-medium">{member.full_name}</p>
                                            <p className="text-sm text-muted-foreground">{member.role}</p>
                                        </div>
                                        <div className="flex gap-6 items-center">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Active</p>
                                                <p className="text-lg font-bold">{member.active_tasks}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Completed</p>
                                                <p className="text-lg font-bold text-green-600">{member.completed_tasks}</p>
                                            </div>
                                            <div className="w-24">
                                                <p className="text-sm text-muted-foreground mb-1">Workload</p>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${member.workload_percent > 80 ? 'bg-red-500' :
                                                            member.workload_percent > 60 ? 'bg-orange-500' :
                                                                'bg-green-500'
                                                            }`}
                                                        style={{ width: `${Math.min(member.workload_percent, 100)}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {member.workload_percent}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </PermissionGate>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and navigation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <PermissionGate permission={PERMISSIONS.PROJECT.CREATE_ALL}>
                            <Link to="/projects">
                                <Button variant="outline" className="w-full">
                                    <FolderKanban className="mr-2 h-4 w-4" />
                                    New Project
                                </Button>
                            </Link>
                        </PermissionGate>

                        <PermissionGate permission={PERMISSIONS.TASK.CREATE_ALL}>
                            <Link to="/tasks">
                                <Button variant="outline" className="w-full">
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    New Task
                                </Button>
                            </Link>
                        </PermissionGate>

                        <PermissionGate permission={PERMISSIONS.INVOICE.CREATE_ALL}>
                            <Link to="/invoices/create">
                                <Button variant="outline" className="w-full">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    New Invoice
                                </Button>
                            </Link>
                        </PermissionGate>

                        <PermissionGate anyPermission={[PERMISSIONS.FINANCE.READ_ALL, PERMISSIONS.DASHBOARD.VIEW_ALL]}>
                            <Link to="/projects">
                                <Button variant="outline" className="w-full">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    View Reports
                                </Button>
                            </Link>
                        </PermissionGate>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
