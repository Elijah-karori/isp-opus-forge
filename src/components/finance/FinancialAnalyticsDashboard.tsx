import { useQuery } from '@tanstack/react-query';
import { financialServicesApi } from '@/api/financialServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, PieChart } from '@/components/charts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertCircle,
    FileText,
    Calendar,
    Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { DateRangePicker } from '@/components/forms/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { addMonths } from 'date-fns';

export function FinancialAnalyticsDashboard() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addMonths(new Date(), -3),
        to: new Date(),
    });

    // Financial Snapshot
    const { data: snapshot, isLoading: snapshotLoading } = useQuery({
        queryKey: ['financial-snapshot'],
        queryFn: () => financialServicesApi.getFinancialSnapshot(),
    });

    // Infrastructure Profitability
    const { data: infraProfitability, isLoading: infraLoading } = useQuery({
        queryKey: ['infrastructure-profitability', dateRange],
        queryFn: () =>
            financialServicesApi.getInfrastructureProfitability(
                dateRange?.from?.toISOString(),
                dateRange?.to?.toISOString()
            ),
        enabled: !!dateRange?.from && !!dateRange?.to,
    });

    // Overdue Invoices
    const { data: overdueInvoices, isLoading: overdueLoading } = useQuery({
        queryKey: ['overdue-invoices'],
        queryFn: () => financialServicesApi.getOverdueInvoices(0),
    });

    const isLoading = snapshotLoading || infraLoading || overdueLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const snapshotData = snapshot?.data || {};
    const infraData = infraProfitability?.data || {};
    const overdueData = overdueInvoices?.data || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Analytics</h2>
                    <p className="text-muted-foreground">
                        Comprehensive financial insights and profitability analysis
                    </p>
                </div>
                <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-[300px]"
                />
            </div>

            {/* Financial Snapshot Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            KES {snapshotData.monthly_performance?.total_revenue?.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From {snapshotData.active_projects?.total || 0} active projects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            KES {snapshotData.monthly_performance?.total_costs?.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all active projects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            KES {snapshotData.monthly_performance?.net_profit?.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {snapshotData.monthly_performance?.profit_margin || 0}% margin
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receivables</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            KES {snapshotData.receivables?.total?.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {snapshotData.receivables?.overdue_count || 0} overdue invoices
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Infrastructure Profitability */}
            {infraData.infrastructure_profitability && (
                <Card>
                    <CardHeader>
                        <CardTitle>Profitability by Infrastructure Type</CardTitle>
                        <CardDescription>
                            Best performing: {infraData.most_profitable || 'N/A'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={Object.entries(infraData.infrastructure_profitability).map(
                                ([type, data]: any) => ({
                                    type,
                                    revenue: data.total_revenue,
                                    costs: data.total_costs,
                                    profit: data.net_profit,
                                })
                            )}
                            xKey="type"
                            yKeys={[
                                { key: 'revenue', label: 'Revenue', color: 'hsl(var(--chart-1))' },
                                { key: 'costs', label: 'Costs', color: 'hsl(var(--chart-2))' },
                                { key: 'profit', label: 'Profit', color: 'hsl(var(--chart-3))' },
                            ]}
                            height={350}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Overdue Invoices */}
            {overdueData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            Overdue Invoices ({overdueData.length})
                        </CardTitle>
                        <CardDescription>Invoices requiring immediate attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {overdueData.slice(0, 5).map((invoice: any) => (
                                <div
                                    key={invoice.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                                >
                                    <div>
                                        <p className="font-medium">{invoice.invoice_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {invoice.customer_name} - {invoice.project_name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">KES {invoice.amount?.toLocaleString()}</p>
                                        <p className="text-xs text-orange-600">
                                            {invoice.days_overdue} days overdue
                                        </p>
                                    </div>
                                    <Link to={`/invoices/${invoice.id}`}>
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Link to="/invoices?filter=overdue">
                                <Button variant="outline">View All Overdue</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Link to="/invoices/create">
                            <Button variant="outline" className="w-full">
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Invoice
                            </Button>
                        </Link>
                        <Link to="/finance/reports">
                            <Button variant="outline" className="w-full">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                View Reports
                            </Button>
                        </Link>
                        <Link to="/finance/budgets">
                            <Button variant="outline" className="w-full">
                                <DollarSign className="mr-2 h-4 w-4" />
                                Manage Budgets
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
