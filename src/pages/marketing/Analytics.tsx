import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, PieChart, LineChart } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Marketing Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Campaign ROI</CardTitle>
          <CardDescription>Return on investment from marketing campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart className="h-64 w-full text-muted-foreground" />
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart className="h-64 w-full text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction (CSAT)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart className="h-64 w-full text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
