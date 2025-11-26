import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    getProjectBudget,
    getBudgetSummary,
    type BudgetCategory,
} from '@/api/projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface BudgetManagerProps {
    projectId: number;
}

export function BudgetManager({ projectId }: BudgetManagerProps) {
    // Fetch budget summary
    const { data: summary, isLoading: summaryLoading } = useQuery({
        queryKey: ['budget-summary', projectId],
        queryFn: () => getBudgetSummary(projectId).then(res => res.data),
    });

    // Fetch detailed budget
    const { data: budget, isLoading: budgetLoading } = useQuery({
        queryKey: ['budget', projectId],
        queryFn: () => getProjectBudget(projectId).then(res => res.data),
    });

    const isLoading = summaryLoading || budgetLoading;

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!budget || !summary) {
        return (
            <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                    No budget allocated for this project yet.
                </CardContent>
            </Card>
        );
    }

    const percentUsed = summary.percent_used;
    const isOverBudget = percentUsed > 100;
    const isNearLimit = percentUsed > 80 && percentUsed <= 100;

    const getCategoryIcon = (category: BudgetCategory) => {
        return <div className="h-2 w-2 rounded-full bg-primary" />;
    };

    const getVarianceColor = (variance: number) => {
        if (variance > 0) return 'text-red-500';
        if (variance < 0) return 'text-green-500';
        return 'text-gray-500';
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.total_allocated)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        {isOverBudget ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.total_spent)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {percentUsed.toFixed(1)}% of budget
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                        {isOverBudget && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : ''}`}>
                            {formatCurrency(summary.remaining)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Progress */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Budget Utilization</CardTitle>
                        {isOverBudget && (
                            <Badge variant="destructive">Over Budget</Badge>
                        )}
                        {isNearLimit && !isOverBudget && (
                            <Badge variant="outline" className="border-orange-500 text-orange-500">
                                Near Limit
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Progress
                        value={Math.min(percentUsed, 100)}
                        className={isOverBudget ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : ''}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(summary.total_spent)} spent</span>
                        <span>{formatCurrency(summary.total_allocated)} allocated</span>
                    </div>
                </CardContent>
            </Card>

            {/* Budget by Category */}
            <Card>
                <CardHeader>
                    <CardTitle>Budget Breakdown by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Allocated</TableHead>
                                <TableHead className="text-right">Spent</TableHead>
                                <TableHead className="text-right">Variance</TableHead>
                                <TableHead className="text-right">%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(summary.by_category).map(([category, data]) => {
                                const variancePercent = data.allocated > 0
                                    ? ((data.spent - data.allocated) / data.allocated * 100)
                                    : 0;
                                const spentPercent = data.allocated > 0
                                    ? (data.spent / data.allocated * 100)
                                    : 0;

                                return (
                                    <TableRow key={category}>
                                        <TableCell className="font-medium capitalize">
                                            <div className="flex items-center gap-2">
                                                {getCategoryIcon(category as BudgetCategory)}
                                                {category.replace('_', ' ')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(data.allocated)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(data.spent)}
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${getVarianceColor(data.variance)}`}>
                                            {data.variance > 0 ? '+' : ''}
                                            {formatCurrency(data.variance)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={spentPercent > 100 ? 'text-red-500' : ''}>
                                                {spentPercent.toFixed(1)}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Line Items */}
            {budget.line_items && budget.line_items.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Budget Line Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Unit Cost</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Actual</TableHead>
                                    <TableHead className="text-right">Variance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {budget.line_items.map((item, index) => {
                                    const variance = item.actual_cost - item.total_cost;
                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {item.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.unit_cost)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.total_cost)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.actual_cost)}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${getVarianceColor(variance)}`}>
                                                {variance > 0 ? '+' : ''}
                                                {formatCurrency(variance)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
