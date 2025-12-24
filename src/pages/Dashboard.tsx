import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { dashboardsApi } from '@/api/dashboards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    ClipboardList,
    FolderKanban,
    Users,
    Briefcase,
    Target,
    Loader2,
    ChevronRight,
    Plus,
    Bell,
    Clock,
    AlertTriangle,
    ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PermissionGate from '@/components/PermissionGate';
import { PERMISSIONS } from '@/constants/permissions';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Greeting Logic
    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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

    // Derived stats for unified view
    const stats = {
        outstanding: taskAllocation?.total_tasks ?? 0,
        delayed: projectsOverview?.by_status?.on_hold ?? 0,
        budgetUsed: budgetTracking?.total_spent
            ? Math.round((budgetTracking.total_spent / (budgetTracking.total_budget || 1)) * 100)
            : 0,
    };

    return (
        <div className="min-h-full -m-6 p-6 lg:p-10 bg-slate-50 dark:bg-[#0f172a] overflow-x-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Modern Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 dark:border-white/10 shadow-2xl shadow-blue-500/5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-xs">
                            <Clock className="h-4 w-4" />
                            {dateStr}
                        </div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            {greeting}, {user?.full_name?.split(' ')[0] || 'User'}
                            <span className="hidden sm:inline">👋</span>
                        </h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {user?.roles_v2?.map(role => (
                                <Badge key={role.id} variant="secondary" className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-none px-3">
                                    {role.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="h-12 border-white/20 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 rounded-2xl px-6">
                            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                            Reports
                        </Button>
                        <Button className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 px-8 font-semibold transition-all hover:scale-105 active:scale-95" onClick={() => navigate('/projects')}>
                            <Plus className="h-5 w-5 mr-2" />
                            New Project
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 relative">
                            <Bell className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Stats & Overview (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-none shadow-xl shadow-blue-500/20 text-white rounded-[2rem] overflow-hidden group">
                                <CardContent className="p-6 relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-125">
                                        <ClipboardList className="h-24 w-24" />
                                    </div>
                                    <p className="text-blue-100 font-medium mb-1 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Active Tasks
                                    </p>
                                    <div className="flex items-end justify-between mt-2">
                                        <h3 className="text-4xl font-black">{stats.outstanding}</h3>
                                        <TrendingUp className="h-6 w-6 text-blue-200" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl shadow-slate-500/5 rounded-[2rem] hover:border-amber-500/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium mb-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        Delayed Projects
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stats.delayed}</h3>
                                        <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-full">
                                            Priority High
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl shadow-slate-500/5 rounded-[2rem]">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        Budget Usage
                                    </div>
                                    <div className="space-y-3 mt-3">
                                        <div className="flex items-end justify-between">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.budgetUsed}%</h3>
                                            <span className="text-xs text-muted-foreground">{budgetTracking?.total_budget ? `KES ${Math.round(budgetTracking.total_budget / 1000)}k` : 'N/A'}</span>
                                        </div>
                                        <Progress value={stats.budgetUsed} className="h-2 bg-slate-100 dark:bg-white/5 overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" />
                                        </Progress>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Projects Overview - High Fidelity */}
                        <Card className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/5">
                            <CardHeader className="p-8 pb-0 border-none">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl font-black">Active Projects</CardTitle>
                                        <CardDescription className="text-base">Real-time status across departments</CardDescription>
                                    </div>
                                    <Button variant="ghost" className="rounded-2xl hover:bg-white/60 dark:hover:bg-white/5 text-blue-600 dark:text-blue-400" onClick={() => navigate('/projects')}>
                                        View All
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {projectsOverview?.by_status && Object.entries(projectsOverview.by_status).slice(0, 4).map(([status, count]) => (
                                        <div key={status} className="group p-5 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-[1.02] cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-blue-500 transition-colors">
                                                        {status.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-3xl font-black">{count}</p>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-all">
                                                    <FolderKanban className="h-6 w-6" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity / Tasks */}
                        <Card className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/5">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-2xl font-black">Performance Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className="space-y-4">
                                    <div className="p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">On-Time Delivery</p>
                                                <p className="text-sm text-muted-foreground">94.2% average across all projects</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-green-600 dark:text-green-400">+2.4%</p>
                                            <p className="text-xs text-muted-foreground">vs last month</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-500/10 flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-blue-500" />
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            You have <span className="font-bold">{stats.outstanding} active tasks</span> assigned to you this week.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebars & Alerts (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Priority Alerts */}
                        <Card className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-red-500/5">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-black flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Priority Alerts
                                    </CardTitle>
                                    <Badge className="bg-red-500 text-white border-none rounded-full px-2">3 New</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-4">
                                <div className="p-5 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 space-y-2 group cursor-pointer hover:bg-amber-500/15 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-400">Budget Warning</p>
                                        <span className="text-[10px] text-amber-600/70 font-semibold uppercase">2h ago</span>
                                    </div>
                                    <p className="text-sm text-amber-800/90 dark:text-amber-200/80 leading-relaxed">
                                        Fiber Installation - Westlands has exceeded 85% of allocated budget.
                                    </p>
                                </div>

                                <div className="p-5 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 space-y-2 group cursor-pointer hover:bg-red-500/15 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-red-900 dark:text-red-400">Delayed Task</p>
                                        <span className="text-[10px] text-red-600/70 font-semibold uppercase">4h ago</span>
                                    </div>
                                    <p className="text-sm text-red-800/90 dark:text-red-200/80 leading-relaxed">
                                        BOM approval pending for CBD Network project (Overdue 2 days).
                                    </p>
                                </div>

                                <Button variant="secondary" className="w-full rounded-[1.5rem] h-12 bg-slate-100 dark:bg-white/5 font-bold">
                                    Clear All Alerts
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Actions Panel */}
                        <Card className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white border-none rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/20">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-black">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 grid grid-cols-2 gap-3">
                                <Button className="h-20 flex-col gap-2 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/10" onClick={() => navigate('/tasks')}>
                                    <ClipboardList className="h-6 w-6" />
                                    <span className="text-xs font-bold">New Task</span>
                                </Button>
                                <Button className="h-20 flex-col gap-2 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/10" onClick={() => navigate('/invoices/create')}>
                                    <DollarSign className="h-6 w-6" />
                                    <span className="text-xs font-bold">Invoice</span>
                                </Button>
                                <Button className="h-20 flex-col gap-2 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/10" onClick={() => navigate('/inventory')}>
                                    <Target className="h-6 w-6" />
                                    <span className="text-xs font-bold">Stock</span>
                                </Button>
                                <Button className="h-20 flex-col gap-2 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/10" onClick={() => navigate('/hr')}>
                                    <Users className="h-6 w-6" />
                                    <span className="text-xs font-bold">Team</span>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Team Workload Summary */}
                        <Card className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl shadow-blue-500/5">
                            <CardHeader className="p-8 pb-4 border-none">
                                <CardTitle className="text-xl font-black flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Active Team
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-5">
                                {teamWorkload?.team_members?.slice(0, 3).map((member, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 border border-white/50 dark:border-white/5">
                                                {member.full_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold group-hover:text-blue-500 transition-colors">{member.full_name}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{member.role}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-none px-2 rounded-lg">
                                            {member.active_tasks} Tasks
                                        </Badge>
                                    </div>
                                ))}
                                <Button variant="link" className="w-full text-blue-600 dark:text-blue-400 font-bold" onClick={() => navigate('/hr')}>
                                    Management View
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
