import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAttendance, type AttendanceRecord } from '@/api/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, MapPin, Search } from 'lucide-react';

export function AttendanceLogs() {
  const [filters, setFilters] = useState({ 
    employeeId: '', 
    startDate: '', 
    endDate: '' 
  });

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => getAttendance({
      employee_id: filters.employeeId ? Number(filters.employeeId) : undefined,
      start_date: filters.startDate,
      end_date: filters.endDate,
    }),
    enabled: !!(filters.startDate && filters.endDate), // Only fetch if dates are set
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const attendanceList = attendance?.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Attendance Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="grid gap-2">
            <label htmlFor="employeeId">Employee ID</label>
            <Input
              id="employeeId"
              name="employeeId"
              placeholder="Filter by Employee ID"
              value={filters.employeeId}
              onChange={handleFilterChange}
              className="w-full lg:w-48"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="startDate">Start Date</label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="endDate">End Date</label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Records
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
                  <TableHead>Technician</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceList.map((record: AttendanceRecord) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.technician?.full_name || 'N/A'}
                      <div className="text-sm text-muted-foreground">
                        {record.technician?.employee_code}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {record.check_in ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(record.check_in).toLocaleTimeString()}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {record.check_out ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(record.check_out).toLocaleTimeString()}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {record.check_in_location || 'N/A'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {attendanceList.length === 0 && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No attendance records found for the selected criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
