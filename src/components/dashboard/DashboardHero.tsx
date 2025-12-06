import { useEffect, useState } from 'react';
import { Flame, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StreakService } from '@/lib/streak-service';
import type { UserStreak } from '@/lib/types';
import type { Transaction } from '@/lib/types';

interface DashboardHeroProps {
    userName: string;
    userId: string;
    transactions: Transaction[];
}

export function DashboardHero({ userName, userId, transactions }: DashboardHeroProps) {
    const [streak, setStreak] = useState<UserStreak | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Load streak data
        StreakService.getUserStreak(userId).then(setStreak);

        // Update time every minute for greeting
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, [userId]);

    // Calculate financial summary
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

    // Get greeting based on time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // Get motivational message based on financial status
    const getFinancialMessage = () => {
        if (netBalance > 0) {
            return "You're doing great this month!";
        } else if (netBalance === 0) {
            return "You're breaking even this month.";
        } else {
            return "Let's work on reducing expenses.";
        }
    };

    const currentStreak = streak?.current_streak || 0;
    const streakMessage = StreakService.getMotivationalMessage(currentStreak);

    return (
        <Card className="overflow-hidden border-0 shadow-xl">
            {/* Gradient Background */}
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 md:p-8">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Content */}
                <div className="relative space-y-6">
                    {/* Greeting Section */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {getGreeting()}, {userName}! 👋
                        </h1>
                        <p className="text-primary-100 text-sm md:text-base">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Financial Status & Streak - Side by Side on Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Financial Status */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-3">
                                <Wallet className="w-5 h-5 text-white" />
                                <h3 className="text-white font-semibold">This Month</h3>
                            </div>

                            <div className="space-y-3">
                                {/* Net Balance */}
                                <div>
                                    <p className="text-white/70 text-xs mb-1">Net Balance</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-2xl md:text-3xl font-bold ${isPositive ? 'text-green-300' : 'text-red-300'
                                            }`}>
                                            K{Math.abs(netBalance).toLocaleString()}
                                        </span>
                                        {isPositive ? (
                                            <TrendingUp className="w-5 h-5 text-green-300" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5 text-red-300" />
                                        )}
                                    </div>
                                    <p className="text-white/60 text-xs mt-1">
                                        {getFinancialMessage()}
                                    </p>
                                </div>

                                {/* Income & Expenses */}
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
                                    <div>
                                        <div className="flex items-center gap-1 mb-1">
                                            <ArrowUpRight className="w-3 h-3 text-green-300" />
                                            <p className="text-white/70 text-xs">Income</p>
                                        </div>
                                        <p className="text-white font-semibold text-sm">
                                            K{totalIncome.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-1">
                                            <ArrowDownRight className="w-3 h-3 text-red-300" />
                                            <p className="text-white/70 text-xs">Expenses</p>
                                        </div>
                                        <p className="text-white font-semibold text-sm">
                                            K{totalExpenses.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Streak Status */}
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Flame className="w-5 h-5 text-white" />
                                <h3 className="text-white font-semibold">Your Streak</h3>
                            </div>

                            <div className="space-y-2">
                                {/* Streak Count */}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-black text-white">
                                        {currentStreak}
                                    </span>
                                    <span className="text-xl font-bold text-white/80">
                                        {currentStreak === 1 ? 'day' : 'days'}
                                    </span>
                                </div>

                                {/* Streak Message */}
                                <p className="text-white/90 text-sm">
                                    {streakMessage}
                                </p>

                                {/* Best Streak Badge */}
                                {streak && streak.longest_streak > 0 && (
                                    <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                                        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                                            🏆 Best: {streak.longest_streak} days
                                        </Badge>
                                        {streak.streak_freeze_count > 0 && (
                                            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                                                ❄️ {streak.streak_freeze_count} freeze{streak.streak_freeze_count !== 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                            <p className="text-white/70 text-xs mb-1">Transactions</p>
                            <p className="text-white font-bold text-lg">
                                {monthlyTransactions.length}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                            <p className="text-white/70 text-xs mb-1">Active Days</p>
                            <p className="text-white font-bold text-lg">
                                {streak?.total_active_days || 0}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                            <p className="text-white/70 text-xs mb-1">Savings Rate</p>
                            <p className="text-white font-bold text-lg">
                                {totalIncome > 0
                                    ? `${Math.round((1 - totalExpenses / totalIncome) * 100)}%`
                                    : '0%'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
