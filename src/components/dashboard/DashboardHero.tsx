import { useEffect, useState } from 'react';
import { 
  Flame, TrendingUp, TrendingDown, Wallet, 
  ArrowUpRight, ArrowDownRight, Sparkles, Trophy, 
  Calendar, Zap, Activity 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StreakService } from '@/lib/streak-service';
import type { UserStreak, Transaction } from '@/lib/types';

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

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const currentStreak = streak?.current_streak || 0;
    
    // Calculate Savings Rate for Progress Bar
    const savingsRate = totalIncome > 0 
        ? Math.max(0, Math.round((1 - totalExpenses / totalIncome) * 100))
        : 0;

    return (
        <div className="space-y-6 font-sans text-slate-900">
            {/* 1. Header Section: Clean, Personal, Welcoming */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        {getGreeting()}, {userName} 
                        <span className="animate-pulse">👋</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    {savingsRate > 20 && (
                        <Badge variant="outline" className="py-1.5 px-3 bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 fill-emerald-700" />
                            <span>Savings Expert</span>
                        </Badge>
                    )}
                    <Badge variant="outline" className="py-1.5 px-3 bg-slate-100 text-slate-600 border-slate-200 rounded-full">
                        {monthlyTransactions.length} Transactions
                    </Badge>
                </div>
            </div>

            {/* 2. Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Main Financial Card (Corporate & Clean) - Spans 8 columns */}
                <Card className="col-span-1 md:col-span-8 p-6 md:p-8 rounded-3xl border-slate-100 shadow-xl shadow-slate-200/40 bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-slate-900 rounded-xl">
                                    <Wallet className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-semibold tracking-wide uppercase text-slate-500">Net Balance</span>
                            </div>

                            <div className="flex items-baseline gap-4 mb-2">
                                <span className={`text-5xl md:text-6xl font-black tracking-tighter ${isPositive ? 'text-slate-900' : 'text-rose-600'}`}>
                                    K{Math.abs(netBalance).toLocaleString()}
                                </span>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span>{totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0}%</span>
                                </div>
                            </div>
                            <p className="text-slate-500 font-medium">
                                {netBalance > 0 ? "You're growing your wealth! 🚀" : "Let's optimize your spending. 📉"}
                            </p>
                        </div>

                        {/* Income/Expense Split & Savings Bar */}
                        <div className="mt-8 space-y-4">
                             {/* Custom Progress Bar for Savings */}
                             <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <span>Spending</span>
                                    <span>Savings Rate ({savingsRate}%)</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                    <div 
                                        style={{ width: `${100 - savingsRate}%` }} 
                                        className="h-full bg-slate-300 transition-all duration-1000 ease-out" 
                                    />
                                    <div 
                                        style={{ width: `${savingsRate}%` }} 
                                        className="h-full bg-slate-900 transition-all duration-1000 ease-out" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Income</p>
                                        <p className="font-bold text-slate-700">K{totalIncome.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <ArrowDownRight className="w-5 h-5 text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Expenses</p>
                                        <p className="font-bold text-slate-700">K{totalExpenses.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Right Column: Streak & Stats - Spans 4 columns */}
                <div className="col-span-1 md:col-span-4 flex flex-col gap-4">
                    
                    {/* Streak Card (Youthful / Gamified) - Dark Mode Contrast */}
                    <Card className="flex-1 p-6 rounded-3xl bg-slate-900 text-white border-0 shadow-xl shadow-slate-900/20 relative overflow-hidden">
                        {/* Abstract Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-40"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full blur-[40px] opacity-30"></div>
                        
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl inline-flex">
                                    <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-400 fill-orange-400' : 'text-slate-400'}`} />
                                </div>
                                <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md">
                                    Level {Math.floor(currentStreak / 7) + 1}
                                </Badge>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-end gap-2 mb-1">
                                    <h3 className="text-5xl font-black tracking-tighter">{currentStreak}</h3>
                                    <span className="text-lg font-medium text-slate-400 mb-1.5">day streak</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {StreakService.getMotivationalMessage(currentStreak)}
                                </p>
                            </div>

                            {/* Mini Streak Stats */}
                            <div className="grid grid-cols-2 gap-2 mt-6">
                                <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-sm">
                                    <Trophy className="w-4 h-4 text-yellow-400 mb-1" />
                                    <p className="text-xs text-slate-400">Best</p>
                                    <p className="font-bold">{streak?.longest_streak || 0}</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-sm">
                                    <Zap className="w-4 h-4 text-blue-400 mb-1" />
                                    <p className="text-xs text-slate-400">Active</p>
                                    <p className="font-bold">{streak?.total_active_days || 0}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Stat (Simple & Clean) */}
                    <Card className="p-5 rounded-3xl border-slate-100 shadow-lg shadow-slate-100 bg-white flex items-center justify-between group hover:border-indigo-100 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Daily Avg</p>
                            <p className="text-2xl font-black text-slate-900">
                                K{monthlyTransactions.length > 0 ? Math.round(totalExpenses / monthlyTransactions.length).toLocaleString() : 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors">
                            <Activity className="w-6 h-6" />
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}