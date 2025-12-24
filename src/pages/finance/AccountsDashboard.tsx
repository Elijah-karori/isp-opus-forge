// src/pages/finance/AccountsDashboard.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Building2,
    Wallet,
    CreditCard,
    PiggyBank,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Send,
    ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api';

interface FinancialAccount {
    id: number;
    name: string;
    account_number: string;
    type: string;
    balance?: number;
    description?: string;
}

export default function AccountsDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');

    // Fetch accounts
    const { data: accounts = [], isLoading } = useQuery<FinancialAccount[]>({
        queryKey: ['financial-accounts'],
        queryFn: async () => {
            const response = await apiClient.request<FinancialAccount[]>({
                url: '/finance/financial-accounts/',
                method: 'GET'
            });
            return response || [];
        }
    });

    // Calculate totals (mock data since API may not return balance)
    const totalLiquidity = 2450000;
    const liquidityChange = 12.5;

    // Mock account data with balances
    const accountsWithBalance = accounts.length > 0 ? accounts.map(acc => ({
        ...acc,
        balance: Math.random() * 1000000,
        change: (Math.random() - 0.5) * 20
    })) : [
        { id: 1, name: 'Main Business Account', type: 'bank', account_number: '****1234', balance: 1250000, change: 5.2 },
        { id: 2, name: 'Operations Account', type: 'bank', account_number: '****5678', balance: 450000, change: -2.1 },
        { id: 3, name: 'Petty Cash', type: 'cash', account_number: 'N/A', balance: 50000, change: 0 },
        { id: 4, name: 'Credit Line', type: 'credit', account_number: '****9012', balance: -200000, change: 10.0 },
        { id: 5, name: 'Reserve Fund', type: 'savings', account_number: '****3456', balance: 900000, change: 1.5 },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bank': return <Building2 className="h-6 w-6" />;
            case 'cash': return <Wallet className="h-6 w-6" />;
            case 'credit': return <CreditCard className="h-6 w-6" />;
            case 'savings': return <PiggyBank className="h-6 w-6" />;
            default: return <Wallet className="h-6 w-6" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'bank': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'cash': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'credit': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'savings': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    const filteredAccounts = activeTab === 'all'
        ? accountsWithBalance
        : accountsWithBalance.filter(acc => acc.type === activeTab);

    return (
        <div className="min-h-full -m-6 p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto">
            {/* Header / Summary Section */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-white/20 dark:hover:bg-white/5"
                            onClick={() => navigate(-1)}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <h1 className="text-3xl font-black tracking-tight">Finance</h1>
                    </div>

                    <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-2xl shadow-blue-500/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-125">
                            <TrendingUp className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Total Liquidity</p>
                                <Badge className="bg-white/20 text-white border-none rounded-lg px-2 py-1 font-bold">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +{liquidityChange}%
                                </Badge>
                            </div>
                            <div>
                                <p className="text-4xl font-black mb-1">
                                    KES {totalLiquidity.toLocaleString()}
                                </p>
                                <p className="text-blue-100/70 text-sm font-medium tracking-wide">
                                    AVAILABLE ACROSS {accountsWithBalance.length} CHANNELS
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    className="flex-1 h-12 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-black transition-all hover:scale-105 active:scale-95"
                                    onClick={() => navigate('/finance/new-transaction')}
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Fund
                                </Button>
                                <Button
                                    className="flex-1 h-12 bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md rounded-2xl font-black transition-all hover:scale-105 active:scale-95"
                                    onClick={() => navigate('/finance/new-transaction')}
                                >
                                    <Send className="h-5 w-5 mr-2" />
                                    Pay
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:w-2/3 flex flex-col gap-6">
                    {/* Filters & Tabs */}
                    <div className="flex items-center justify-between">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-1.5 h-14 rounded-2xl border border-white/20 w-full lg:w-auto">
                                <TabsTrigger value="all" className="flex-1 lg:px-8 rounded-xl font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">All</TabsTrigger>
                                <TabsTrigger value="bank" className="flex-1 lg:px-8 rounded-xl font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Bank</TabsTrigger>
                                <TabsTrigger value="cash" className="flex-1 lg:px-8 rounded-xl font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Cash</TabsTrigger>
                                <TabsTrigger value="savings" className="flex-1 lg:px-8 rounded-xl font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Savings</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Desktop Grid / Mobile List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        {filteredAccounts.map((account) => (
                            <div
                                key={account.id}
                                className="p-6 rounded-[2rem] bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
                                onClick={() => navigate(`/finance/accounts/${account.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-12 ${getTypeColor(account.type)}`}>
                                        {getTypeIcon(account.type)}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Balance</p>
                                        <p className={`text-2xl font-black ${account.balance < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                            KES {Math.abs(account.balance).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-end justify-between">
                                    <div>
                                        <p className="text-lg font-black">{account.name}</p>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest">{account.account_number}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {account.change > 0 ? (
                                            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-none font-bold">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                +{account.change.toFixed(1)}%
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-none font-bold">
                                                <TrendingDown className="h-3 w-3 mr-1" />
                                                {account.change.toFixed(1)}%
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Floating Action (Mobile only) or Header context dependent */}
            <Button
                size="lg"
                className="lg:hidden fixed bottom-10 right-6 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-500/40 z-50 text-white"
                onClick={() => navigate('/finance/new-transaction')}
            >
                <Plus className="h-8 w-8" />
            </Button>
        </div>
    );
}
