import React from 'react';
import { useQuery } from '@tanstack/react-query';
import technicianApi from '@/api/technicianServices';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star } from 'lucide-react';

export default function TechnicianLeaderboard() {
    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['technician-leaderboard'],
        queryFn: () => technicianApi.getLeaderboard().then((res) => res.data),
    });

    // Mock data for visualization if API is empty
    const mockLeaderboard = [
        {
            technician_id: 1,
            name: 'Sarah Connor',
            tasks_completed: 145,
            average_rating: 4.9,
            efficiency_score: 98,
            points: 2500,
        },
        {
            technician_id: 2,
            name: 'Kyle Reese',
            tasks_completed: 132,
            average_rating: 4.8,
            efficiency_score: 95,
            points: 2350,
        },
        {
            technician_id: 3,
            name: 'T-800',
            tasks_completed: 200,
            average_rating: 4.5,
            efficiency_score: 99,
            points: 2200,
        },
    ];

    const displayData = leaderboard?.length ? leaderboard : mockLeaderboard;

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 1:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 2:
                return <Medal className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="font-bold text-muted-foreground">#{index + 1}</span>;
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                    Technician Hall of Fame
                </h1>
                <p className="text-muted-foreground">
                    Top performers for the current month
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 pt-8">
                {/* 2nd Place */}
                <div className="mt-8 order-2 md:order-1">
                    <Card className="border-gray-200 shadow-lg transform hover:-translate-y-1 transition-transform">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-gray-100 rounded-full p-3 w-fit mb-2">
                                <Medal className="h-8 w-8 text-gray-400" />
                            </div>
                            <CardTitle className="text-xl">{displayData[1]?.name}</CardTitle>
                            <Badge variant="secondary">Silver Tier</Badge>
                        </CardHeader>
                        <CardContent className="text-center space-y-2">
                            <div className="text-3xl font-bold">{displayData[1]?.points}</div>
                            <p className="text-sm text-muted-foreground">Total Points</p>
                            <div className="flex justify-center gap-4 text-sm pt-2">
                                <div>
                                    <div className="font-semibold">{displayData[1]?.tasks_completed}</div>
                                    <div className="text-muted-foreground">Tasks</div>
                                </div>
                                <div>
                                    <div className="font-semibold">{displayData[1]?.average_rating}</div>
                                    <div className="text-muted-foreground">Rating</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2 z-10">
                    <Card className="border-yellow-200 shadow-xl transform hover:-translate-y-2 transition-transform bg-gradient-to-b from-yellow-50/50 to-white">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-yellow-100 rounded-full p-4 w-fit mb-2">
                                <Trophy className="h-10 w-10 text-yellow-500" />
                            </div>
                            <CardTitle className="text-2xl">{displayData[0]?.name}</CardTitle>
                            <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                Gold Tier
                            </Badge>
                        </CardHeader>
                        <CardContent className="text-center space-y-2">
                            <div className="text-4xl font-bold text-yellow-600">
                                {displayData[0]?.points}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Points</p>
                            <div className="flex justify-center gap-6 text-sm pt-2">
                                <div>
                                    <div className="font-bold text-lg">
                                        {displayData[0]?.tasks_completed}
                                    </div>
                                    <div className="text-muted-foreground">Tasks</div>
                                </div>
                                <div>
                                    <div className="font-bold text-lg">
                                        {displayData[0]?.average_rating}
                                    </div>
                                    <div className="text-muted-foreground">Rating</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3rd Place */}
                <div className="mt-12 order-3">
                    <Card className="border-amber-200 shadow-lg transform hover:-translate-y-1 transition-transform">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-amber-50 rounded-full p-3 w-fit mb-2">
                                <Medal className="h-8 w-8 text-amber-600" />
                            </div>
                            <CardTitle className="text-xl">{displayData[2]?.name}</CardTitle>
                            <Badge variant="outline" className="border-amber-600 text-amber-600">
                                Bronze Tier
                            </Badge>
                        </CardHeader>
                        <CardContent className="text-center space-y-2">
                            <div className="text-3xl font-bold">{displayData[2]?.points}</div>
                            <p className="text-sm text-muted-foreground">Total Points</p>
                            <div className="flex justify-center gap-4 text-sm pt-2">
                                <div>
                                    <div className="font-semibold">{displayData[2]?.tasks_completed}</div>
                                    <div className="text-muted-foreground">Tasks</div>
                                </div>
                                <div>
                                    <div className="font-semibold">{displayData[2]?.average_rating}</div>
                                    <div className="text-muted-foreground">Rating</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="rounded-md border mt-8">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Rank</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead className="text-right">Tasks Completed</TableHead>
                            <TableHead className="text-right">Efficiency</TableHead>
                            <TableHead className="text-right">Rating</TableHead>
                            <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayData.slice(3).map((tech, index) => (
                            <TableRow key={tech.technician_id}>
                                <TableCell className="font-medium">
                                    {getRankIcon(index + 3)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {tech.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {tech.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">{tech.tasks_completed}</TableCell>
                                <TableCell className="text-right">
                                    {tech.efficiency_score}%
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        {tech.average_rating}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {tech.points}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
