import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  hours_worked: string;
  check_in_location: string | null;
  check_out_location: string | null;
}

export default function Attendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: attendanceRecords = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', user?.id],
    queryFn: async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/api/v1/hr/attendance?employee_id=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/api/v1/hr/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          employee_id: user?.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          check_in: new Date().toISOString(),
          status: 'present',
          check_in_location: `${position.coords.latitude},${position.coords.longitude}`,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to check in');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked in successfully');
    },
    onError: () => {
      toast.error('Failed to check in');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (recordId: number) => {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/api/v1/hr/attendance/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          check_out: new Date().toISOString(),
          check_out_location: `${position.coords.latitude},${position.coords.longitude}`,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to check out');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked out successfully');
    },
    onError: () => {
      toast.error('Failed to check out');
    },
  });

  const todayRecord = attendanceRecords.find(
    record => record.date === format(new Date(), 'yyyy-MM-dd')
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      on_leave: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Track your daily attendance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayRecord ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Check In</p>
                    <p className="font-medium">
                      {todayRecord.check_in 
                        ? format(new Date(todayRecord.check_in), 'h:mm a')
                        : 'Not checked in'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Check Out</p>
                    <p className="font-medium">
                      {todayRecord.check_out 
                        ? format(new Date(todayRecord.check_out), 'h:mm a')
                        : 'Not checked out'}
                    </p>
                  </div>
                </div>
              </div>
              
              {!todayRecord.check_out && (
                <Button 
                  onClick={() => checkOutMutation.mutate(todayRecord.id)}
                  disabled={checkOutMutation.isPending}
                >
                  Check Out
                </Button>
              )}
            </div>
          ) : (
            <Button 
              onClick={() => checkInMutation.mutate()}
              disabled={checkInMutation.isPending}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : attendanceRecords.length === 0 ? (
            <p className="text-muted-foreground">No attendance records found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.check_in 
                        ? format(new Date(record.check_in), 'h:mm a')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {record.check_out 
                        ? format(new Date(record.check_out), 'h:mm a')
                        : '-'}
                    </TableCell>
                    <TableCell>{record.hours_worked || '0'} hrs</TableCell>
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
