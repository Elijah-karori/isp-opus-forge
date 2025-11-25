import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowsApi } from '@/api/workflows';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowOverlay } from '@/components/WorkflowOverlay';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

interface WorkflowStats {
  pending_approvals: number;
  sla_breaches: number;
  approved_this_month: number;
  by_resource_type: Record<string, number>;
  approval_times: { name: string; hours: number }[];
  bottlenecks: { name: string; count: number }[];
  completion_rates: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function WorkflowDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedInstance, setSelectedInstance] = useState<number | null>(null);

  const { data: pendingItems = [] } = useQuery({
    queryKey: ['workflows', 'pending', user?.role],
    queryFn: () => workflowsApi.listPending(user?.role).then(res => res.data || []),
    enabled: !!user,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['workflows', 'stats'],
    queryFn: () => workflowsApi.getStats().then(res => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: (instanceId: number) => workflowsApi.approveInstance(instanceId),
    onSuccess: () => {
      toast.success('Approved successfully');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: (instanceId: number) => workflowsApi.rejectInstance(instanceId),
    onSuccess: () => {
      toast.success('Rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: () => toast.error('Failed to reject'),
  });

  const stats: WorkflowStats = {
    pending_approvals: pendingItems.length,
    sla_breaches: analyticsData?.sla_breaches || 0,
    approved_this_month: analyticsData?.approved_this_month || 0,
    by_resource_type: pendingItems.reduce((acc: Record<string, number>, item: any) => {
      const type = item.related_model || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
    approval_times: analyticsData?.approval_times || [
      { name: 'Finance', hours: 24 },
      { name: 'HR', hours: 12 },
      { name: 'Ops', hours: 48 },
    ],
    bottlenecks: analyticsData?.bottlenecks || [
      { name: 'Budget Approval', count: 15 },
      { name: 'Contract Review', count: 8 },
      { name: 'Final Sign-off', count: 5 },
    ],
    completion_rates: analyticsData?.completion_rates || [
      { name: 'Approved', value: 65 },
      { name: 'Rejected', value: 15 },
      { name: 'Pending', value: 20 },
    ],
  };

  const getTimeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage pending approvals and workflow activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.pending_approvals}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.sla_breaches}</div>
            <p className="text-xs text-muted-foreground mt-1">Overdue approvals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.approved_this_month}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed workflows</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Approval Times (Avg Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.approval_times}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Bottlenecks (Pending Count)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.bottlenecks} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Completion Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.completion_rates}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.completion_rates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Resource Type */}
      {Object.keys(stats.by_resource_type).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.by_resource_type).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-sm">
                  {type}: <strong className="ml-1">{count}</strong>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Approvals List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals ({pendingItems.length})</CardTitle>
          <CardDescription>Items requiring your review and approval</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingItems.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingItems.map((item: any) => (
                <Card key={item.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {item.related_model} #{item.related_id}
                          </h4>
                          <Badge variant="outline">ID: {item.id}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Updated: {item.updated_at ? getTimeSince(item.updated_at) : 'Unknown'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => approveMutation.mutate(item.id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(item.id)}
                          disabled={rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInstance(item.id)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInstance && (
        <WorkflowOverlay
          instanceId={selectedInstance}
          onClose={() => setSelectedInstance(null)}
          onActionComplete={() => {
            setSelectedInstance(null);
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
          }}
        />
      )}
    </div>
  );
}
