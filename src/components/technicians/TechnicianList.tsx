
import { useQuery } from '@tanstack/react-query';
import { getEmployees, type Employee } from '@/api/hr';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Wrench } from 'lucide-react';

export function TechnicianList() {
  const { data: technicians, isLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => getEmployees({ department: 'Technician' }),
  });

  const getStatusBadge = (status: Employee['status']) => {
    const variants = {
      active: { class: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Active' },
      inactive: { class: 'bg-gray-500/10 text-gray-500 border-gray-500/20', label: 'Inactive' },
      on_leave: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'On Leave' },
      terminated: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Terminated' },
    };
    return variants[status] || variants.inactive;
  };

  // apiClient already unwraps response.data
  const technicianList = Array.isArray(technicians) ? technicians : (technicians?.data || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Technician List
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
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicianList.map((technician: Employee) => {
                const statusBadge = getStatusBadge(technician.status);
                return (
                  <TableRow key={technician.id}>
                    <TableCell className="font-medium">
                      {technician.user?.full_name}
                      <div className="text-sm text-muted-foreground">{technician.user?.email}</div>
                    </TableCell>
                    <TableCell>{technician.designation}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge.class}>
                        {statusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/hr/employees/${technician.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
