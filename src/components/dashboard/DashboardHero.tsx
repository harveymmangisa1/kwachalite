import { useEffect, useState } from 'react';
import { 
  Wallet, Trophy, Calendar, Zap, Target, ChevronRight,
  TrendingUp, TrendingDown, Sparkles, Activity,
    Flame, PieChart
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StreakService } from '@/lib/streak-service';
import type { UserStreak, Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DashboardHeroProps {
    userName: string;
    userId: string;
    transactions: Transaction[];
}

export function DashboardHero({ userName, userId, transactions }: DashboardHeroProps) {
    const [streak, setStreak] = useState<UserStreak | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        StreakService.getUserStreak(userId).then(setStreak);
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, [userId]);

    // --- Calculations ---
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const totalIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;
    const isPositive = netBalance >= 0;
    const currentStreak = streak?.current_streak || 0;
    
    const savingsRate = totalIncome > 0 
        ? Math.max(0, Math.round((1 - totalExpenses / totalIncome) * 100))
        : 0;

    const dailyAverage = monthlyTransactions.length > 0 
        ? Math.round(totalExpenses / monthlyTransactions.length)
        : 0;

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // Format currency helper for cleaner JSX
    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK', minimumFractionDigits: 0 }).format(amount).replace('MWK', 'K');

    return (
        <div className="space-y-8 font-sans text-slate-900 animate-in fade-in duration-500">
            
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', month: 'long', day: 'numeric' 
                            })}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                        {getGreeting()}, <span className="text-indigo-600">{userName}</span>
                    </h1>
                    <p className="text-slate-500 max-w-md">
                        Here's your financial breakdown for this month. You have <span className="font-semibold text-slate-700">{monthlyTransactions.length} pending insights</span>.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-600">
                        View Reports
                    </Button>
                    <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                        <Zap className="w-4 h-4 mr-2" />
                        Quick Action
                    </Button>
                </div>
            </div>

            {/* --- Bento Grid Layout --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Main Financial Card (8 Cols) */}
                <Card className="lg:col-span-8 relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 group">
                    {/* Subtle Background Gradient */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                        
                        {/* Balance Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <Wallet className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Net Balance</h2>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-sm font-bold flex items-center",
                                            isPositive ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                            {totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0}% 
                                            <span className="text-slate-400 font-normal ml-1">vs last month</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50">
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Large Balance Display */}
                        <div>
                            <span className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900">
                                {formatCurrency(Math.abs(netBalance))}
                            </span>
                        </div>

                        {/* Income / Expense Split Pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Income Pill */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 hover:bg-emerald-50 transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-full shadow-sm">
                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-emerald-700/70 uppercase">Income</span>
                                        <span className="text-lg font-bold text-slate-900">{formatCurrency(totalIncome)}</span>
                                    </div>
                                </div>
                                <PieChart className="w-4 h-4 text-emerald-300" />
                            </div>

                            {/* Expense Pill */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50 hover:bg-rose-50 transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm">
                                        <TrendingDown className="w-4 h-4 text-rose-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-rose-700/70 uppercase">Expenses</span>
                                        <span className="text-lg font-bold text-slate-900">{formatCurrency(totalExpenses)}</span>
                                    </div>
                                </div>
                                <PieChart className="w-4 h-4 text-rose-300" />
                            </div>
                        </div>

                        {/* Savings Rate Progress */}
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-600">Savings Goal</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">{savingsRate}% <span className="text-slate-400 font-normal">/ 20%</span></span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ width: `${Math.min(savingsRate, 100)}%` }}
                                >
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Right Column Stats (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* 2. Gamified Streak Card (Dark Theme) */}
                    <Card className="flex-1 p-6 rounded-[2rem] border-0 bg-[#0F172A] text-white shadow-xl relative overflow-hidden group">
                        {/* Mesh Gradients */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-2.5 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700">
                                    <Flame className={cn("w-5 h-5", currentStreak > 0 ? "text-amber-400 fill-amber-400" : "text-slate-500")} />
                                </div>
                                <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700">
                                    Level {Math.floor(currentStreak / 7) + 1}
                                </Badge>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold tracking-tight text-white">{currentStreak}</span>
                                    <span className="text-lg text-slate-400 font-medium">days</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                    {StreakService.getMotivationalMessage(currentStreak)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                                    <p className="text-xs text-slate-400 mb-1">Best Streak</p>
                                    <div className="flex items-center gap-1.5">
                                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="font-bold">{streak?.longest_streak || 0}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                                    <p className="text-xs text-slate-400 mb-1">Active Days</p>
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="font-bold">{streak?.total_active_days || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 3. Daily Average / Insight Card */}
                    <Card className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-lg shadow-slate-200/20 group hover:border-indigo-100 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-orange-50 rounded-xl">
                                    <Activity className="w-4 h-4 text-orange-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Daily Avg</span>
                            </div>
                            {savingsRate > 20 && (
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px] px-2 py-0.5 h-auto">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Healthy
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{formatCurrency(dailyAverage)}</p>
                                <p className="text-xs text-slate-500 mt-1">Average spent per day</p>
                            </div>
                            <div className="h-8 w-16 flex items-end justify-between gap-1">
                                {/* CSS-only mini bar chart visualization */}
                                <div className="w-full bg-slate-100 rounded-sm h-[40%]" />
                                <div className="w-full bg-slate-100 rounded-sm h-[70%]" />
                                <div className="w-full bg-slate-100 rounded-sm h-[50%]" />
                                <div className="w-full bg-indigo-500 rounded-sm h-[90%]" />
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}