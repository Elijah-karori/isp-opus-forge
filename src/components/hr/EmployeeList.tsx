
import { useQuery } from '@tanstack/react-query';
import { getEmployees, type Employee } from '@/api/hr';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, UserPlus } from 'lucide-react';

export function EmployeeList() {
  const navigate = useNavigate();
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees({ status: 'active' }),
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

  const employeeList = employees || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Directory
        </CardTitle>
        <Button onClick={() => navigate('/hr/create-employee')}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Employee
        </Button>
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
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeList.map((employee: Employee) => {
                const statusBadge = getStatusBadge(employee.status);
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.user?.full_name}
                      <div className="text-sm text-muted-foreground">{employee.user?.email}</div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge.class}>
                        {statusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/hr/employees/${employee.id}`}>
                        <Button variant="outline" size="sm">
                          View/Edit
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
