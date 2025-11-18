import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, ChevronDown, ChevronRight, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  getMasterBudgets, 
  getSubBudgets, 
  getBudgetUsages,
  createMasterBudget,
  createSubBudget,
  createBudgetUsage,
  uploadBudget,
  type MasterBudget,
  type SubBudget,
  type BudgetUsage as BudgetUsageType
} from '@/api/finance';
import { CreateMasterBudgetDialog } from '@/components/finance/CreateMasterBudgetDialog';
import { CreateSubBudgetDialog } from '@/components/finance/CreateSubBudgetDialog';
import { CreateBudgetUsageDialog } from '@/components/finance/CreateBudgetUsageDialog';
import { UploadBudgetDialog } from '@/components/finance/UploadBudgetDialog';

export default function BudgetManagement() {
  const [selectedMaster, setSelectedMaster] = useState<number | null>(null);
  const [expandedBudgets, setExpandedBudgets] = useState<Set<number>>(new Set());
  const [showCreateMaster, setShowCreateMaster] = useState(false);
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [showCreateUsage, setShowCreateUsage] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedSubBudget, setSelectedSubBudget] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: masterBudgets, isLoading } = useQuery({
    queryKey: ['masterBudgets'],
    queryFn: async () => {
      const res = await getMasterBudgets();
      return res.data;
    }
  });

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedBudgets);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBudgets(newExpanded);
  };

  const calculateUsage = (subBudget: SubBudget, usages: BudgetUsageType[]) => {
    const totalUsed = usages
      .filter(u => u.type === 'debit' && u.status !== 'rejected')
      .reduce((sum, u) => sum + parseFloat(u.amount), 0);
    const budget = parseFloat(subBudget.amount);
    return {
      used: totalUsed,
      budget,
      percentage: budget > 0 ? (totalUsed / budget) * 100 : 0,
      remaining: budget - totalUsed
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground">Manage master budgets, sub-budgets, and track spending</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowUpload(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Excel
          </Button>
          <Button onClick={() => setShowCreateMaster(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Master Budget
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{masterBudgets?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active master budgets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${masterBudgets?.reduce((sum, b) => sum + parseFloat(b.total_amount), 0).toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all budgets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Period</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {masterBudgets?.length ? new Date(masterBudgets[0].start_date).getFullYear() : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Current fiscal year</p>
          </CardContent>
        </Card>
      </div>

      {/* Master Budgets List */}
      <div className="space-y-4">
        {masterBudgets?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Budgets Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first master budget to get started</p>
              <Button onClick={() => setShowCreateMaster(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Master Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          masterBudgets?.map((master) => (
            <MasterBudgetCard
              key={master.id}
              master={master}
              isExpanded={expandedBudgets.has(master.id)}
              onToggle={() => toggleExpanded(master.id)}
              onCreateSub={() => {
                setSelectedMaster(master.id);
                setShowCreateSub(true);
              }}
              onCreateUsage={(subId) => {
                setSelectedSubBudget(subId);
                setShowCreateUsage(true);
              }}
              calculateUsage={calculateUsage}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      <CreateMasterBudgetDialog
        open={showCreateMaster}
        onClose={() => setShowCreateMaster(false)}
      />
      <CreateSubBudgetDialog
        open={showCreateSub}
        onClose={() => setShowCreateSub(false)}
        masterBudgetId={selectedMaster}
      />
      <CreateBudgetUsageDialog
        open={showCreateUsage}
        onClose={() => setShowCreateUsage(false)}
        subBudgetId={selectedSubBudget}
      />
      <UploadBudgetDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
      />
    </div>
  );
}

interface MasterBudgetCardProps {
  master: MasterBudget;
  isExpanded: boolean;
  onToggle: () => void;
  onCreateSub: () => void;
  onCreateUsage: (subId: number) => void;
  calculateUsage: (subBudget: SubBudget, usages: BudgetUsageType[]) => any;
}

function MasterBudgetCard({ master, isExpanded, onToggle, onCreateSub, onCreateUsage, calculateUsage }: MasterBudgetCardProps) {
  const { data: subBudgets } = useQuery({
    queryKey: ['subBudgets', master.id],
    queryFn: async () => {
      const res = await getSubBudgets(master.id);
      return res.data;
    },
    enabled: isExpanded
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <div>
              <CardTitle>{master.name}</CardTitle>
              <CardDescription>
                {new Date(master.start_date).toLocaleDateString()} - {new Date(master.end_date).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${parseFloat(master.total_amount).toLocaleString()}</div>
            <Badge variant="outline">{subBudgets?.length || 0} sub-budgets</Badge>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <Button onClick={onCreateSub} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Sub-Budget
            </Button>

            {subBudgets?.map((sub) => (
              <SubBudgetCard
                key={sub.id}
                subBudget={sub}
                onCreateUsage={onCreateUsage}
                calculateUsage={calculateUsage}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface SubBudgetCardProps {
  subBudget: SubBudget;
  onCreateUsage: (subId: number) => void;
  calculateUsage: (subBudget: SubBudget, usages: BudgetUsageType[]) => any;
}

function SubBudgetCard({ subBudget, onCreateUsage, calculateUsage }: SubBudgetCardProps) {
  const { data: usages } = useQuery({
    queryKey: ['budgetUsages', subBudget.id],
    queryFn: async () => {
      const res = await getBudgetUsages(subBudget.id);
      return res.data;
    }
  });

  const usage = calculateUsage(subBudget, usages || []);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{subBudget.name}</h4>
          <p className="text-sm text-muted-foreground">
            ${usage.used.toLocaleString()} of ${usage.budget.toLocaleString()}
          </p>
        </div>
        <Button onClick={() => onCreateUsage(subBudget.id)} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Usage
        </Button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Budget Utilization</span>
          <span className={usage.percentage > 100 ? 'text-destructive font-semibold' : ''}>
            {usage.percentage.toFixed(1)}%
          </span>
        </div>
        <Progress value={Math.min(usage.percentage, 100)} className="h-2" />
        {usage.percentage > 100 && (
          <p className="text-sm text-destructive">⚠️ Over budget by ${Math.abs(usage.remaining).toLocaleString()}</p>
        )}
      </div>

      {usages && usages.length > 0 && (
        <div className="mt-3 space-y-2">
          <h5 className="text-sm font-medium">Recent Transactions</h5>
          {usages.slice(0, 3).map((u) => (
            <div key={u.id} className="flex items-center justify-between text-sm border-l-2 pl-2" style={{ borderColor: u.type === 'debit' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' }}>
              <span className="text-muted-foreground truncate">{u.description || 'No description'}</span>
              <div className="flex items-center gap-2">
                <span className={u.type === 'debit' ? 'text-destructive' : 'text-primary'}>
                  {u.type === 'debit' ? '-' : '+'}${parseFloat(u.amount).toLocaleString()}
                </span>
                <Badge variant={u.status === 'approved' ? 'default' : u.status === 'pending_approval' ? 'secondary' : 'destructive'}>
                  {u.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
