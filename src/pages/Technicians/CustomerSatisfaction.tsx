import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import technicianApi, { CustomerSatisfaction } from '@/api/technicianServices';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerSatisfactionPage() {
    const queryClient = useQueryClient();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [newFeedback, setNewFeedback] = useState({
        task_id: '',
        rating: 5,
        feedback: '',
    });

    const { data: feedbackList, isLoading } = useQuery({
        queryKey: ['customer-satisfaction'],
        queryFn: () => technicianApi.listSatisfaction().then((res) => res.data),
    });

    const submitMutation = useMutation({
        mutationFn: (data: any) =>
            technicianApi.recordSatisfaction({
                ...data,
                task_id: parseInt(data.task_id),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-satisfaction'] });
            setIsFeedbackOpen(false);
            toast.success('Feedback recorded successfully');
        },
    });

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Customer Satisfaction
                    </h1>
                    <p className="text-muted-foreground">
                        Review customer feedback and ratings
                    </p>
                </div>
                <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <MessageSquare className="mr-2 h-4 w-4" /> Record Feedback
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record Customer Feedback</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Task ID</label>
                                <Input
                                    type="number"
                                    value={newFeedback.task_id}
                                    onChange={(e) =>
                                        setNewFeedback({ ...newFeedback, task_id: e.target.value })
                                    }
                                    placeholder="Task ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rating (1-5)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Button
                                            key={star}
                                            variant={newFeedback.rating === star ? 'default' : 'outline'}
                                            size="icon"
                                            onClick={() =>
                                                setNewFeedback({ ...newFeedback, rating: star })
                                            }
                                            type="button"
                                        >
                                            <Star
                                                className={`h-4 w-4 ${newFeedback.rating >= star ? 'fill-current' : ''
                                                    }`}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Comments</label>
                                <Textarea
                                    value={newFeedback.feedback}
                                    onChange={(e) =>
                                        setNewFeedback({ ...newFeedback, feedback: e.target.value })
                                    }
                                    placeholder="Customer comments..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFeedbackOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => submitMutation.mutate(newFeedback)}
                                disabled={submitMutation.isPending}
                            >
                                Submit Feedback
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.8</div>
                        <p className="text-xs text-muted-foreground">Based on 150 reviews</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">92%</div>
                        <p className="text-xs text-muted-foreground">4 & 5 star ratings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Negative Feedback</CardTitle>
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2%</div>
                        <p className="text-xs text-muted-foreground">1 & 2 star ratings</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Task ID</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Feedback</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading feedback...
                                </TableCell>
                            </TableRow>
                        ) : feedbackList?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No feedback records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            feedbackList?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>#{item.task_id}</TableCell>
                                    <TableCell>Tech #{item.technician_id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < item.rating
                                                            ? 'text-yellow-500 fill-current'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {item.feedback || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
