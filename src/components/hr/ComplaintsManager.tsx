import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComplaints, recordComplaint, type Complaint, type ComplaintCreate } from '@/api/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Flag, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ComplaintsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComplaint, setNewComplaint] = useState<Partial<ComplaintCreate>>({});

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => getComplaints(),
  });

  const createComplaintMutation = useMutation({
    mutationFn: recordComplaint,
    onSuccess: () => {
      toast({ title: 'Complaint Recorded' });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setNewComplaint({});
    },
    onError: (error: any) => {
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    createComplaintMutation.mutate(newComplaint as ComplaintCreate);
  };

  const complaintList = complaints?.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Record a New Complaint
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Complaint form will go here */}
          <Button onClick={handleSubmit} disabled={createComplaintMutation.isPending}>
            Submit Complaint
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Complaint Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaintList.map((complaint: Complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{complaint.employee_id}</TableCell>
                    <TableCell>{complaint.complaint_type}</TableCell>
                    <TableCell>
                      <Badge severity={complaint.severity}>{complaint.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={complaint.is_valid === null ? 'secondary' : 'outline'}>
                        {complaint.is_valid === null ? 'Pending' : (complaint.is_valid ? 'Valid' : 'Invalid')}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(complaint.reported_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
