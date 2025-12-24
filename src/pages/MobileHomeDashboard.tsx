// src/pages/MobileHomeDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { dashboardsApi } from '@/api/dashboards';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    ScanLine,
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Home,
    FolderKanban,
    Package,
    DollarSign,
    Users,
    ChevronRight,
    Bell,
    User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function MobileHomeDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Get current date/time in friendly format
    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Fetch dashboard data
    const { data: projectsOverview } = useQuery({
        queryKey: ['dashboard', 'projects-overview'],
        queryFn: () => dashboardsApi.getProjectsOverview(),
    });

    const { data: budgetTracking } = useQuery({
        queryKey: ['dashboard', 'budget-tracking'],
        queryFn: () => dashboardsApi.getBudgetTracking(),
    });

    // Mock stats for the design
    const stats = {
        outstanding: 12,
        outstandingChange: 8,
        delayed: 3,
        delayedChange: -25,
        budgetUsed: 65,
        budgetTotal: 100000,
    };

    // Mock active projects
    const activeProjects = [
        { name: 'Fiber Installation - Westlands', progress: 75, status: 'on-track' },
        { name: 'Network Upgrade - CBD', progress: 45, status: 'delayed' },
        { name: 'PPOE Setup - Kilimani', progress: 90, status: 'on-track' },
    ];

    // Mock alerts
    const alerts = [
        { id: 1, message: 'Budget threshold reached on Project A', type: 'warning', time: '2h ago' },
        { id: 2, message: 'New task assigned: Router Installation', type: 'info', time: '4h ago' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
            {/* Header */}
            <div className="px-5 pt-12 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-blue-200 text-sm">{dateStr}</p>
                        <h1 className="text-2xl font-bold text-white">{greeting}</h1>
                        <p className="text-white font-medium">{user?.full_name || 'User'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-blue-200 hover:text-white hover:bg-white/10"
                            onClick={() => navigate('/approvals')}
                        >
                            <Bell className="h-6 w-6" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
                                3
                            </span>
                        </Button>
                        <Link to="/profile">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 mt-6">
                    <Button
                        className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        onClick={() => navigate('/tasks/new')}
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Task
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-12 border-white/20 text-white hover:bg-white/10"
                        onClick={() => navigate('/inventory')}
                    >
                        <ScanLine className="h-5 w-5 mr-2" />
                        Scan Inventory
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-5 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    {/* Outstanding */}
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-amber-400" />
                            <span className="text-blue-200 text-sm">Outstanding</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.outstanding}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span className="text-green-400 text-xs">+{stats.outstandingChange}%</span>
                            <span className="text-blue-300 text-xs ml-1">vs last week</span>
                        </div>
                    </div>

                    {/* Delayed */}
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <span className="text-blue-200 text-sm">Delayed</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.delayed}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingDown className="h-3 w-3 text-red-400" />
                            <span className="text-red-400 text-xs">{stats.delayedChange}%</span>
                            <span className="text-blue-300 text-xs ml-1">vs last week</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Usage Card */}
            <div className="px-5 mb-6">
                <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-blue-200 text-sm">Project Budget Usage</p>
                            <p className="text-2xl font-bold text-white">{stats.budgetUsed}%</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>
                    <Progress value={stats.budgetUsed} className="h-3 bg-white/20" />
                    <p className="text-blue-300 text-xs mt-2">
                        KES {((stats.budgetTotal * stats.budgetUsed) / 100).toLocaleString()} of KES {stats.budgetTotal.toLocaleString()} used
                    </p>
                </div>
            </div>

            {/* Active Projects */}
            <div className="px-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Active Projects</h2>
                    <Link to="/projects" className="text-blue-400 text-sm hover:text-blue-300 flex items-center">
                        View All <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="space-y-3">
                    {activeProjects.map((project, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-white font-medium text-sm">{project.name}</p>
                                <Badge
                                    className={
                                        project.status === 'on-track'
                                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    }
                                >
                                    {project.status === 'on-track' ? 'On Track' : 'Delayed'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                                <Progress value={project.progress} className="flex-1 h-2 bg-white/20" />
                                <span className="text-white text-sm font-medium">{project.progress}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Priority Alerts */}
            <div className="px-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Priority Alerts</h2>
                    <span className="text-blue-400 text-sm">{alerts.length} new</span>
                </div>

                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-2xl backdrop-blur-lg border ${alert.type === 'warning'
                                    ? 'bg-amber-500/10 border-amber-500/20'
                                    : 'bg-blue-500/10 border-blue-500/20'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                                    }`} />
                                <div className="flex-1">
                                    <p className="text-white text-sm">{alert.message}</p>
                                    <p className="text-blue-300 text-xs mt-1">{alert.time}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 px-6 py-3">
                <div className="flex items-center justify-around">
                    <Link to="/dashboard" className="flex flex-col items-center gap-1 text-blue-400">
                        <Home className="h-6 w-6" />
                        <span className="text-xs font-medium">Home</span>
                    </Link>
                    <Link to="/projects" className="flex flex-col items-center gap-1 text-blue-300 hover:text-blue-400">
                        <FolderKanban className="h-6 w-6" />
                        <span className="text-xs">Projects</span>
                    </Link>
                    <Link to="/inventory" className="flex flex-col items-center gap-1 text-blue-300 hover:text-blue-400">
                        <Package className="h-6 w-6" />
                        <span className="text-xs">Inventory</span>
                    </Link>
                    <Link to="/finance" className="flex flex-col items-center gap-1 text-blue-300 hover:text-blue-400">
                        <DollarSign className="h-6 w-6" />
                        <span className="text-xs">Finance</span>
                    </Link>
                    <Link to="/hr" className="flex flex-col items-center gap-1 text-blue-300 hover:text-blue-400">
                        <Users className="h-6 w-6" />
                        <span className="text-xs">HR</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
