
// src/pages/Technicians.tsx
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  getTechnicians, 
  getTechnicianLeaderboard,
  type Technician,
} from '@/api/technicians';
import { getAttendance, type AttendanceRecord } from '@/api/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Users, 
  TrendingUp, 
  Calendar,
  Star,
  MapPin,
  CheckCircle,
  UserPlus,
  Download,
} from 'lucide-react';
import { TechnicianPerformance } from '@/components/technicians/TechnicianPerformance';
import { AttendanceTracker } from '@/components/technicians/AttendanceTracker';

// This is the new layout component for the technician section.
// It will render the nested routes.
export const TechnicianPage = () => <Outlet />;

const TechnicianDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: technicians, isLoading: techLoading } = useQuery<any>({
    queryKey: ['technicians'],
    queryFn: () => getTechnicians({ active_only: true }),
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<any>({
    queryKey: ['technician-leaderboard'],
    queryFn: () => getTechnicianLeaderboard({ limit: 10 }),
  });

  const { data: recentAttendance, isLoading: attendanceLoading } = useQuery<any>({
    queryKey: ['recent-attendance'],
    queryFn: () => getAttendance({}),
  });

  const isLoading = techLoading || leaderboardLoading || attendanceLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const technicianList = technicians?.data || [];
  const leaderboardData = Array.isArray(leaderboard) ? leaderboard : [];
  const attendanceList = recentAttendance?.data || [];

  const activeTechnicians = technicianList.filter((tech: Technician) => tech.is_active);
  const onDutyTechnicians = attendanceList.filter((att: AttendanceRecord) => 
    att.status === 'present' && !att.check_out
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technician Management</h1>
          <p className="text-muted-foreground">
            Monitor field operations, performance, and customer satisfaction
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
          <Link to="/technicians/create">
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Technician
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTechnicians.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently employed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Duty</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onDutyTechnicians.length}</div>
            <p className="text-xs text-muted-foreground">
              In field currently
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">
              Customer satisfaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Attendance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Technician List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Technicians
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeTechnicians.map((tech: Technician) => (
                    <div key={tech.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{tech.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tech.designation || tech.specialization || 'Technician'} • {tech.employee_code || `#${tech.id}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          Active
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {tech.certification_level || (tech.certifications && tech.certifications.length > 0 ? tech.certifications[0] : 'Certified')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.slice(0, 5).map((tech: any, index: number) => (
                    <div key={tech.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{tech.full_name || tech.technician?.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tech.completed_tasks || tech.tasks_completed || 0} tasks • {tech.completion_rate || 0}% rate
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{tech.rating || tech.total_score || 0}</div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <TechnicianPerformance />
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <AttendanceTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnicianDashboard;
