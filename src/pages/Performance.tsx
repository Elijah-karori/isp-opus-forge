import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Star, CheckCircle, TrendingUp } from 'lucide-react';

const leaderboard = [
  { id: 1, name: 'John Smith', tasks: 45, rating: 4.9, efficiency: 98, rank: 1 },
  { id: 2, name: 'Sarah Johnson', tasks: 42, rating: 4.8, efficiency: 96, rank: 2 },
  { id: 3, name: 'Mike Wilson', tasks: 38, rating: 4.7, efficiency: 94, rank: 3 },
  { id: 4, name: 'Emily Brown', tasks: 35, rating: 4.6, efficiency: 92, rank: 4 },
  { id: 5, name: 'David Lee', tasks: 33, rating: 4.5, efficiency: 90, rank: 5 },
];

const rankColors = {
  1: 'bg-chart-3 text-white',
  2: 'bg-muted text-muted-foreground',
  3: 'bg-warning/20 text-warning',
};

export default function Performance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Technician Performance</h1>
        <p className="text-muted-foreground">Track and reward top performers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">193</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">Customer satisfaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-chart-3" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    rankColors[tech.rank as keyof typeof rankColors] || 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tech.rank}
                </div>
                <Avatar>
                  <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{tech.name}</div>
                  <div className="text-sm text-muted-foreground">{tech.tasks} tasks completed</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-chart-3 text-chart-3" />
                    {tech.rating}
                  </div>
                  <div className="text-xs text-muted-foreground">{tech.efficiency}% efficiency</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
