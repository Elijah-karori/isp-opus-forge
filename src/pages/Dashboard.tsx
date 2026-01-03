import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LayoutDashboard, LogOut, Shield, Building2 } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 text-muted-foreground font-medium text-xs mb-2">
                <Clock className="h-4 w-4" />
                {dateStr}
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                {greeting}, {user?.full_name?.split(' ')[0] || 'User'} 👋
              </h1>
              <div className="flex flex-wrap gap-2 mt-3">
                {user?.roles_v2?.map(role => (
                  <Badge key={role.id} variant="secondary" className="px-3">
                    {role.name}
                  </Badge>
                )) || (
                  <Badge variant="secondary" className="px-3">
                    {user?.role || 'Member'}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Account
              </CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium text-muted-foreground">Email:</span> {user?.email}</p>
              <p><span className="font-medium text-muted-foreground">Role:</span> {user?.roles_v2?.[0]?.name || user?.role}</p>
              <p><span className="font-medium text-muted-foreground">RBAC:</span> {user?.rbac_version || 'v2'}</p>
            </CardContent>
          </Card>

          {user?.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization
                </CardTitle>
                <CardDescription>Your company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium text-muted-foreground">Company:</span> {user.company.name}</p>
                {user.division && <p><span className="font-medium text-muted-foreground">Division:</span> {user.division.name}</p>}
                {user.department && <p><span className="font-medium text-muted-foreground">Department:</span> {user.department.name}</p>}
              </CardContent>
            </Card>
          )}

          {user?.permissions_v2 && user.permissions_v2.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permissions
                </CardTitle>
                <CardDescription>{user.permissions_v2.length} permissions granted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {user.permissions_v2.slice(0, 6).map((perm, i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {perm.name}
                    </span>
                  ))}
                  {user.permissions_v2.length > 6 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{user.permissions_v2.length - 6} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
