// src/components/technicians/AttendanceTracker.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getAttendanceRecords, 
  recordAttendance,
  type AttendanceRecord 
} from '@/api/technicians';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AttendanceTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: () => getAttendanceRecords({ 
      start_date: selectedDate, 
      end_date: selectedDate 
    }),
  });

  const recordAttendanceMutation = useMutation({
    mutationFn: recordAttendance,
    onSuccess: () => {
      toast({
        title: "Attendance Recorded",
        description: "Attendance record updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: any) => {
      toast({
        title: "Recording Failed",
        description: error.message || "Failed to record attendance",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const variants = {
      present: { class: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Present', icon: CheckCircle },
      absent: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Absent', icon: XCircle },
      late: { class: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'Late', icon: Clock },
      half_day: { class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Half Day', icon: Clock },
      leave: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'On Leave', icon: Calendar },
    };
    return variants[status];
  };

  const handleCheckIn = (technicianId: number) => {
    const now = new Date().toISOString();
    recordAttendanceMutation.mutate({
      technician_id: technicianId,
      date: selectedDate,
      check_in: now,
      status: 'present',
      check_in_location: 'Field Office', // This would come from GPS in real app
    });
  };

  const handleCheckOut = (recordId: number) => {
    const now = new Date().toISOString();
    recordAttendanceMutation.mutate({
      technician_id: 0, // This would be the actual technician ID
      date: selectedDate,
      check_out: now,
      status: 'present',
      check_out_location: 'Field Office',
    });
  };

  const attendanceList = attendance?.data || [];

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance for {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <Badge variant="outline">
              {attendanceList.filter((att: AttendanceRecord) => att.status === 'present').length} Present
            </Badge>
            <Badge variant="outline">
              {attendanceList.filter((att: AttendanceRecord) => att.status === 'absent').length} Absent
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceList.map((record: AttendanceRecord) => {
                  const statusBadge = getStatusBadge(record.status);
                  const IconComponent = statusBadge.icon;
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.technician?.full_name}
                        <div className="text-sm text-muted-foreground">
                          {record.technician?.employee_code}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.check_in ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-green-600" />
                            {new Date(record.check_in).toLocaleTimeString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not checked in</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.check_out ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-red-600" />
                            {new Date(record.check_out).toLocaleTimeString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not checked out</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.hours_worked > 0 ? (
                          <span className="font-medium">{record.hours_worked}h</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.check_in_location && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {record.check_in_location}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadge.class}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!record.check_in && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(record.technician?.id || 0)}
                              disabled={recordAttendanceMutation.isPending}
                            >
                              Check In
                            </Button>
                          )}
                          {record.check_in && !record.check_out && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckOut(record.id)}
                              disabled={recordAttendanceMutation.isPending}
                            >
                              Check Out
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
