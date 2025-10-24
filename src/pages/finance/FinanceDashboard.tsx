import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, AlertTriangle, CreditCard, FileBarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinanceDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Budget</CardTitle>
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$5,231,876</p>
            <p className="text-sm text-muted-foreground">Across 42 active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Variances</CardTitle>
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">18</p>
            <p className="text-sm text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Payouts</CardTitle>
            <CreditCard className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$172,839</p>
            <p className="text-sm text-muted-foreground">For this pay cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Over-Budget Projects</CardTitle>
            <FileBarChart className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Require immediate review</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Navigate to key finance areas</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/finance/variances">
            <Button variant="outline" className="w-full justify-start text-left h-20">
              <AlertTriangle className="mr-4 h-6 w-6 text-destructive" />
              <div>
                <p className="font-bold">Review BOM Variances</p>
                <p className="text-sm text-muted-foreground">Approve or reject material or cost changes.</p>
              </div>
            </Button>
          </Link>
          <Link to="/finance/payouts">
            <Button variant="outline" className="w-full justify-start text-left h-20">
              <CreditCard className="mr-4 h-6 w-6 text-blue-500" />
              <div>
                <p className="font-bold">Process Payouts</p>
                <p className="text-sm text-muted-foreground">Authorize payments for completed tasks.</p>
              </div>
            </Button>
          </Link>
          <Link to="/finance/reports">
            <Button variant="outline" className="w-full justify-start text-left h-20">
              <FileBarChart className="mr-4 h-6 w-6 text-orange-500" />
              <div>
                <p className="font-bold">Generate Reports</p>
                <p className="text-sm text-muted-foreground">View financial summaries and forecasts.</p>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
