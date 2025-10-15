import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Calendar, User } from 'lucide-react';

const projects = [
  {
    id: 1,
    name: 'Downtown Fiber Installation',
    status: 'in_progress',
    location: '123 Main St, Downtown',
    customer: 'ABC Corporation',
    start_date: '2025-01-10',
    technicians: 4,
    budget: 45000,
  },
  {
    id: 2,
    name: 'Office Network Upgrade',
    status: 'planning',
    location: '456 Business Ave',
    customer: 'XYZ Ltd',
    start_date: '2025-01-20',
    technicians: 2,
    budget: 28000,
  },
  {
    id: 3,
    name: 'Residential Area Expansion',
    status: 'in_progress',
    location: 'Oak Street Area',
    customer: 'Multiple Residents',
    start_date: '2025-01-05',
    technicians: 6,
    budget: 120000,
  },
];

const statusColors = {
  planning: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-success/10 text-success border-success/20',
  on_hold: 'bg-muted text-muted-foreground border-border',
};

export default function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage installation and service projects</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{project.name}</CardTitle>
                <Badge variant="outline" className={statusColors[project.status as keyof typeof statusColors]}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {project.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Start: {new Date(project.start_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {project.technicians} technicians assigned
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Budget</span>
                <span className="font-semibold">${project.budget.toLocaleString()}</span>
              </div>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
