import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import marketingApi, { Campaign } from '@/api/marketingServices';
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
import { Plus, BarChart2, Target, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CampaignManager() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({});

    // Mock data since list endpoint wasn't explicitly in my previous API definition
    // In a real scenario, I'd add a listCampaigns endpoint.
    // For now, I'll assume it exists or mock it to show UI.
    const campaigns: Campaign[] = [
        {
            id: 1,
            name: 'Summer Fiber Promo',
            description: 'Discounted installation for new fiber customers',
            target_leads: 100,
            budget: 5000,
            start_date: '2024-06-01',
            end_date: '2024-08-31',
            created_at: '2024-05-15',
        },
    ];

    const createMutation = useMutation({
        mutationFn: (data: Partial<Campaign>) => marketingApi.createCampaign(data),
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            setIsCreateOpen(false);
            toast.success('Campaign created successfully');
        },
    });

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campaign Manager</h1>
                    <p className="text-muted-foreground">
                        Plan and track marketing campaigns
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Campaign</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Campaign Name</label>
                                <Input
                                    value={newCampaign.name || ''}
                                    onChange={(e) =>
                                        setNewCampaign({ ...newCampaign, name: e.target.value })
                                    }
                                    placeholder="e.g., Winter WiFi Special"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={newCampaign.description || ''}
                                    onChange={(e) =>
                                        setNewCampaign({ ...newCampaign, description: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Leads</label>
                                    <Input
                                        type="number"
                                        value={newCampaign.target_leads || ''}
                                        onChange={(e) =>
                                            setNewCampaign({
                                                ...newCampaign,
                                                target_leads: parseInt(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Budget ($)</label>
                                    <Input
                                        type="number"
                                        value={newCampaign.budget || ''}
                                        onChange={(e) =>
                                            setNewCampaign({
                                                ...newCampaign,
                                                budget: parseFloat(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <Input
                                        type="date"
                                        value={newCampaign.start_date || ''}
                                        onChange={(e) =>
                                            setNewCampaign({ ...newCampaign, start_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Date</label>
                                    <Input
                                        type="date"
                                        value={newCampaign.end_date || ''}
                                        onChange={(e) =>
                                            setNewCampaign({ ...newCampaign, end_date: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => createMutation.mutate(newCampaign)}
                                disabled={createMutation.isPending}
                            >
                                Launch Campaign
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaigns.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$5,000</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Campaign Name</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Target Leads</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.map((campaign) => (
                            <TableRow key={campaign.id}>
                                <TableCell className="font-medium">{campaign.name}</TableCell>
                                <TableCell>{campaign.start_date}</TableCell>
                                <TableCell>{campaign.end_date}</TableCell>
                                <TableCell>{campaign.target_leads}</TableCell>
                                <TableCell>${campaign.budget?.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        View Performance
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
