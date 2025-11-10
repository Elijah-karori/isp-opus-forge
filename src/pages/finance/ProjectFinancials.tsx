import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from 'lucide-react';

const ProjectFinancials = () => {
  const { id } = useParams<{ id: string }>();

  const { data: financials, isLoading } = useQuery({
    queryKey: ['project-financials', id],
    queryFn: () => apiClient.getProjectFinancials(Number(id)),
  });

  if (isLoading) {
    return <div>Loading project financials...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Project Financials</h1>
      <Card>
        <CardHeader>
          <CardTitle>Project: {financials?.project_name}</CardTitle>
          <CardDescription>Financial overview and performance</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs. Actual</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Bar Chart */}
              <BarChart className="h-40 w-full text-muted-foreground" />
              <div className="mt-4 text-center">
                <p>Total Budget: ${financials?.total_budget?.toLocaleString()}</p>
                <p>Total Spent: ${financials?.total_spent?.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Pie Chart */}
              <PieChart className="h-40 w-full text-muted-foreground" />
              <div className="mt-4 text-center">
                <p>Materials: ${financials?.material_costs?.toLocaleString()}</p>
                <p>Labor: ${financials?.labor_costs?.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Profitability</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Line Chart */}
              <LineChart className="h-40 w-full text-muted-foreground" />
              <div className="mt-4 text-center">
                <p>Projected Margin: {financials?.projected_margin}%</p>
                <p>Current Margin: {financials?.current_margin}%</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectFinancials;
