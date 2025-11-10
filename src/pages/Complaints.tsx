// src/pages/Complaints.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, XCircle, Clock, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/api/axios';
import { format } from 'date-fns';

interface Complaint {
  id: number;
  employee_id: number;
  task_id?: number;
  complaint_type: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_investigation' | 'resolved' | 'dismissed';
  reported_at: string;
  investigated_at?: string;
  is_valid?: boolean;
  investigation_notes?: string;
  resolution?: string;
  employee?: {
    full_name: string;
    email: string;
  };
  task?: {
    title: string;
  };
}

const Complaints = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isInvestigateDialogOpen, setIsInvestigateDialogOpen] = useState(false);
  const [investigationData, setInvestigationData] = useState({
    is_valid: true,
    investigation_notes: '',
    resolution: '',
  });

  // Fetch complaints
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const response = await axios.get('/hr/complaints');
      return response.data;
    },
  });

  // Fetch pending complaints
  const { data: pendingComplaints } = useQuery({
    queryKey: ['pending-complaints'],
    queryFn: async () => {
      const response = await axios.get('/hr/complaints/pending');
      return response.data;
    },
  });

  // Investigate complaint mutation
  const investigateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof investigationData }) => {
      const response = await axios.post(`/hr/complaints/${id}/investigate`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Complaint investigation completed",
      });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['pending-complaints'] });
      setIsInvestigateDialogOpen(false);
      setSelectedComplaint(null);
      setInvestigationData({
        is_valid: true,
        investigation_notes: '',
        resolution: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to process complaint",
        variant: "destructive",
      });
    },
  });

  const handleInvestigate = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsInvestigateDialogOpen(true);
  };

  const handleSubmitInvestigation = () => {
    if (selectedComplaint) {
      investigateMutation.mutate({
        id: selectedComplaint.id,
        data: investigationData,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const complaintList: Complaint[] = Array.isArray(complaints) ? complaints : (complaints?.data || []);
  const pendingList: Complaint[] = Array.isArray(pendingComplaints) ? pendingComplaints : (pendingComplaints?.data || []);

  const resolvedCount = complaintList.filter((c) => c.status === 'resolved').length;
  const underInvestigationCount = complaintList.filter((c) => c.status === 'under_investigation').length;
  const criticalCount = complaintList.filter((c) => c.priority === 'critical' && c.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaints Management</h1>
          <p className="text-muted-foreground">Track and investigate customer complaints</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingList.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{underInvestigationCount}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Urgent attention needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Complaints */}
      {pendingList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Complaints</CardTitle>
            <CardDescription>Complaints awaiting investigation</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingList.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{complaint.employee?.full_name}</div>
                        <div className="text-sm text-muted-foreground">{complaint.employee?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{complaint.complaint_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          complaint.priority === 'critical'
                            ? 'destructive'
                            : complaint.priority === 'high'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                    <TableCell>
                      {complaint.task?.title ? (
                        <Badge variant="outline">{complaint.task.title}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(complaint.reported_at), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvestigate(complaint)}
                      >
                        Investigate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Complaints */}
      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>Complete complaint history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaintList.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{complaint.employee?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{complaint.employee?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{complaint.complaint_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        complaint.priority === 'critical'
                          ? 'destructive'
                          : complaint.priority === 'high'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {complaint.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                  <TableCell>
                    {complaint.status === 'resolved' && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                    {complaint.status === 'pending' && (
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {complaint.status === 'under_investigation' && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Investigating
                      </Badge>
                    )}
                    {complaint.status === 'dismissed' && (
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Dismissed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(complaint.reported_at), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {complaintList.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No complaints found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investigation Dialog */}
      <Dialog open={isInvestigateDialogOpen} onOpenChange={setIsInvestigateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Investigate Complaint</DialogTitle>
            <DialogDescription>
              Review and investigate the complaint details
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Employee</Label>
                  <p className="font-medium">{selectedComplaint.employee?.full_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge variant="outline">{selectedComplaint.complaint_type}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Badge variant={selectedComplaint.priority === 'critical' ? 'destructive' : 'default'}>
                    {selectedComplaint.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Reported</Label>
                  <p className="text-sm">{format(new Date(selectedComplaint.reported_at), 'MMM dd, yyyy')}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{selectedComplaint.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Is this complaint valid?</Label>
                <div className="flex gap-4">
                  <Button
                    variant={investigationData.is_valid ? 'default' : 'outline'}
                    onClick={() => setInvestigationData({ ...investigationData, is_valid: true })}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Valid
                  </Button>
                  <Button
                    variant={!investigationData.is_valid ? 'default' : 'outline'}
                    onClick={() => setInvestigationData({ ...investigationData, is_valid: false })}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Invalid
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investigation_notes">Investigation Notes</Label>
                <Textarea
                  id="investigation_notes"
                  value={investigationData.investigation_notes}
                  onChange={(e) =>
                    setInvestigationData({ ...investigationData, investigation_notes: e.target.value })
                  }
                  placeholder="Document your investigation findings..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Textarea
                  id="resolution"
                  value={investigationData.resolution}
                  onChange={(e) =>
                    setInvestigationData({ ...investigationData, resolution: e.target.value })
                  }
                  placeholder="What actions were taken to resolve this?"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsInvestigateDialogOpen(false);
                setSelectedComplaint(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitInvestigation} disabled={investigateMutation.isPending}>
              {investigateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Investigation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Complaints;
