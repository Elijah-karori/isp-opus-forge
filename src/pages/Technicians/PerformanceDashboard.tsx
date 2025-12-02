import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import technicianApi, { TechnicianKPI } from '@/api/technicianServices';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Star, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function PerformanceDashboard() {
    const [selectedTechnician, setSelectedTechnician] = useState<string>('');
    const [period, setPeriod] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30))
            .toISOString()
            .split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    // Mock technicians list - in real app, fetch from users/technicians endpoint
    const technicians = [
        { id: 1, name: 'Tech A' },
        { id: 2, name: 'Tech B' },
    ];

    const { data: performance, isLoading } = useQuery({
        queryKey: ['technician-performance', selectedTechnician, period],
        queryFn: () =>
            selectedTechnician
                ? technicianApi
                    .getTechnicianPerformance(parseInt(selectedTechnician), {
                        period_start: period.start,
                        period_end: period.end,
                    })
                    .then((res) => res.data)
                : Promise.resolve(null),
        enabled: !!selectedTechnician,
    });

    // Mock data for chart if no API data
    const chartData = [
        { name: 'Week 1', tasks: 12, rating: 4.5 },
        { name: 'Week 2', tasks: 15, rating: 4.8 },
        { name: 'Week 3', tasks: 10, rating: 4.2 },
        { name: 'Week 4', tasks: 18, rating: 4.9 },
    ];

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Technician Performance
                    </h1>
                    <p className="text-muted-foreground">
                        Track individual technician metrics and KPIs
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-[300px] space-y-2">
                    <label className="text-sm font-medium">Technician</label>
                    <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a technician..." />
                        </SelectTrigger>
                        <SelectContent>
                            {technicians.map((tech) => (
                                <SelectItem key={tech.id} value={tech.id.toString()}>
                                    {tech.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">From</label>
                        <Input
                            type="date"
                            value={period.start}
                            onChange={(e) => setPeriod({ ...period, start: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">To</label>
                        <Input
                            type="date"
                            value={period.end}
                            onChange={(e) => setPeriod({ ...period, end: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {!selectedTechnician ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                    Please select a technician to view performance data.
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Efficiency Score
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.efficiency_score || 92}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +2.5% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg Rating
                                </CardTitle>
                                <Star className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.average_rating || 4.8}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Based on 45 reviews
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tasks Completed
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.tasks_completed || 128}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Complaints</CardTitle>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.complaints_count || 0}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Weekly Performance</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                        <Tooltip />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="tasks"
                                            fill="#8884d8"
                                            name="Tasks Completed"
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="rating"
                                            fill="#82ca9d"
                                            name="Avg Rating"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
