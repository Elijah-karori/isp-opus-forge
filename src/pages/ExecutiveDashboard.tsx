/**
 * Executive Dashboard Page
 * Provides company-wide overview with key metrics
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardsApi } from '@/api/dashboards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExecutiveDashboard() {
    const { data: projectsOverview, isLoading: loadingProjects } = useQuery({
        queryKey: ['dashboards', 'projects-overview'],
        queryFn: () => dashboardsApi.getProjectsOverview(),
    });

    const { data: taskAllocation, isLoading: loadingTasks } = useQuery({
        queryKey: ['dashboards', 'task-allocation'],
        queryFn: () => dashboardsApi.getTaskAllocation(),
    });

    const { data: budgetTracking, isLoading: loadingBudget } = useQuery({
        queryKey: ['dashboards', 'budget-tracking'],
        queryFn: () => dashboardsApi.getBudgetTracking(),
    });

    const { data: teamWorkload, isLoading: loadingTeam } = useQuery({
        queryKey: ['dashboards', 'team-workload'],
        queryFn: () => dashboardsApi.getTeamWorkload(),
    });

    if (loadingProjects || loadingTasks || loadingBudget || loadingTeam) {
        return (
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Executive Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Executive Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projectsOverview?.total_projects || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {projectsOverview?.active_projects || 0} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            KES {budgetTracking?.total_budget?.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {budgetTracking?.utilization_percent || 0}% utilized
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {taskAllocation?.total_tasks || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across {taskAllocation?.departments_count || 0} departments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {budgetTracking?.efficiency_score || 0}%
                        </div>
                        <p className="text-xs text-success">
                            +{budgetTracking?.efficiency_change || 0}% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Projects Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Projects by Status</CardTitle>
                    <CardDescription>Overview of all projects by their current status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {projectsOverview?.by_status && Object.entries(projectsOverview.by_status).map(([status, count]) => (
                            <div key={status} className="flex items-center">
                                <div className="w-32 font-medium capitalize">{status.replace('_', ' ')}</div>
                                <div className="flex-1">
                                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(count as number / (projectsOverview?.total_projects || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-12 text-right text-sm text-muted-foreground">{count as number}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Budget Tracking */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Budget vs Actual</CardTitle>
                        <CardDescription>Budget utilization across all projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Allocated</span>
                                    <span className="text-sm">KES {budgetTracking?.total_allocated?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Spent</span>
                                    <span className="text-sm">KES {budgetTracking?.total_spent?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Remaining</span>
                                    <span className="text-sm text-success">KES {budgetTracking?.remaining?.toLocaleString() || 0}</span>
                                </div>
                            </div>

                            {budgetTracking?.variance && budgetTracking.variance < 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Budget exceeded by KES {Math.abs(budgetTracking.variance).toLocaleString()}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Team Workload</CardTitle>
                        <CardDescription>Current task distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {teamWorkload && teamWorkload.slice(0, 5).map((member: any) => (
                                <div key={member.user_id} className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{member.user_name}</div>
                                        <div className="text-sm text-muted-foreground">{member.role}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{member.active_tasks} tasks</div>
                                        <div className="text-sm text-muted-foreground">{member.workload_percent}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
