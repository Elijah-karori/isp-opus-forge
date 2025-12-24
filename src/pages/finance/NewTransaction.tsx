// src/pages/finance/NewTransaction.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChevronLeft,
    DollarSign,
    ArrowDownLeft,
    ArrowUpRight,
    Camera,
    Calendar,
    Tag,
    FileText,
    Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

export default function NewTransaction() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionType, setTransactionType] = useState<'debit' | 'credit'>('debit');
    const [formData, setFormData] = useState({
        amount: '',
        subBudgetId: '',
        description: '',
        reference: '',
        date: new Date().toISOString().split('T')[0],
    });

    // Mock sub-budgets
    const subBudgets = [
        { id: 1, name: 'Operations - Equipment' },
        { id: 2, name: 'Operations - Supplies' },
        { id: 3, name: 'Marketing - Campaigns' },
        { id: 4, name: 'HR - Payroll' },
        { id: 5, name: 'Infrastructure - Fiber' },
    ];

    const handleSubmit = async () => {
        if (!formData.amount || !formData.subBudgetId) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.request({
                url: '/finance/budget-usages/',
                method: 'POST',
                data: {
                    sub_budget_id: parseInt(formData.subBudgetId),
                    amount: parseFloat(formData.amount),
                    type: transactionType,
                    description: formData.description || `${transactionType === 'debit' ? 'Expense' : 'Income'} - ${formData.reference}`,
                    transaction_date: formData.date
                }
            });

            toast({
                title: "Transaction Recorded",
                description: "The transaction has been successfully logged."
            });
            navigate(-1);
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong while recording the transaction",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-full -m-6 p-6 lg:p-10 flex flex-col items-center justify-center">
            {/* Background Decorative Blur */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-2xl w-full space-y-8">
                {/* Header */}
                <div className="flex items-center gap-6 mb-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-2xl h-12 w-12 hover:bg-white/20 dark:hover:bg-white/5 border border-white/10"
                        onClick={() => navigate(-1)}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Record Transaction</h1>
                        <p className="text-muted-foreground font-medium">Log income or expense to budget categories</p>
                    </div>
                </div>

                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/5 p-8 lg:p-12">
                    {/* Amount Input Section */}
                    <div className="text-center mb-10 space-y-4">
                        <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Enter Transaction Amount</Label>
                        <div className="flex items-center justify-center gap-4 py-4">
                            <span className="text-3xl font-black text-slate-400">KES</span>
                            <div className="relative group">
                                <Input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => handleChange('amount', e.target.value)}
                                    placeholder="0.00"
                                    className="text-6xl font-black bg-transparent border-none text-center w-full focus-visible:ring-0 placeholder:text-slate-200 dark:placeholder:text-white/10 h-auto p-0"
                                />
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                            </div>
                        </div>
                    </div>

                    {/* Type Toggle */}
                    <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl gap-2 mb-10">
                        <button
                            onClick={() => setTransactionType('debit')}
                            className={`flex-1 flex items-center justify-center h-14 rounded-xl font-black transition-all ${transactionType === 'debit' ? 'bg-white dark:bg-red-500 text-red-500 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <ArrowUpRight className="h-5 w-5 mr-2" />
                            Expense
                        </button>
                        <button
                            onClick={() => setTransactionType('credit')}
                            className={`flex-1 flex items-center justify-center h-14 rounded-xl font-black transition-all ${transactionType === 'credit' ? 'bg-white dark:bg-green-500 text-green-500 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <ArrowDownLeft className="h-5 w-5 mr-2" />
                            Income
                        </button>
                    </div>

                    {/* Detailed Fields */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                                <Select
                                    value={formData.subBudgetId}
                                    onValueChange={(value) => handleChange('subBudgetId', value)}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 font-bold">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-white/10">
                                        {subBudgets.map((budget) => (
                                            <SelectItem key={budget.id} value={budget.id.toString()} className="rounded-xl focus:bg-blue-50 dark:focus:bg-blue-900/40">
                                                {budget.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleChange('date', e.target.value)}
                                        className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 font-bold px-4"
                                    />
                                    <Calendar className="absolute right-4 top-4 h-5 w-5 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Reference No.</Label>
                            <Input
                                value={formData.reference}
                                onChange={(e) => handleChange('reference', e.target.value)}
                                placeholder="INV-001 or Receipt ID"
                                className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 font-bold px-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Notes / Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="What was this for?"
                                className="min-h-[120px] rounded-2xl bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 font-bold p-4 resize-none"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-16 rounded-[1.25rem] border-dashed border-2 border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                                onClick={() => toast({ title: "Module Locked", description: "Optical Receipt Recognition is coming soon!" })}
                            >
                                <Camera className="h-5 w-5 mr-3" />
                                Attach Receipt
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`flex-[1.5] h-16 rounded-[1.25rem] font-black text-white text-lg shadow-xl transition-all hover:scale-105 active:scale-95 ${transactionType === 'debit' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'}`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    `Submit ${transactionType === 'debit' ? 'Expense' : 'Income'}`
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
