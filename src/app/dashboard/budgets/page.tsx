
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { categories, transactions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import React from 'react';
import { Target } from 'lucide-react';
import type { Category } from '@/lib/types';
import { BudgetManager } from '@/components/budgets/budget-manager';

interface BudgetCategory extends Category {
    spent: number;
    progress: number;
}

export default function BudgetsPage() {
    const { activeWorkspace } = useActiveWorkspace();

    const budgetData = React.useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const expenseCategories = categories.filter(
            (c) => c.workspace === activeWorkspace && c.type === 'expense' && c.budget && c.budget > 0
        );

        const monthlyTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startOfMonth && transactionDate <= endOfMonth && t.workspace === activeWorkspace;
        });

        return expenseCategories.map((category) => {
            const spent = monthlyTransactions
                .filter((t) => t.category === category.name)
                .reduce((sum, t) => sum + t.amount, 0);

            const progress = category.budget ? (spent / category.budget) * 100 : 0;

            return { ...category, spent, progress };
        });
    }, [activeWorkspace]);

    return (
        <div className="flex-1 space-y-4">
            <PageHeader
                title="Budgets"
                description="Manage and track your spending against your monthly budgets."
            />
            <div className="grid gap-6 lg:grid-cols-2 px-4 sm:px-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Progress</CardTitle>
                             <CardDescription>Your spending progress for this month.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {budgetData.length > 0 ? (
                                <div className="space-y-6">
                                    {budgetData.map((item) => (
                                        <div key={item.id}>
                                            <div className="flex justify-between mb-1 items-center">
                                                <span className="text-sm font-medium">{item.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatCurrency(item.spent)} / {formatCurrency(item.budget!)}
                                                </span>
                                            </div>
                                            <Progress value={item.progress} />
                                            <p className="text-xs text-muted-foreground mt-1 text-right">
                                                {formatCurrency(Math.max(0, item.budget! - item.spent))} {item.spent > item.budget! ? 'over' : 'remaining'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No Budgets Set</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Use the manager to set budgets for your expense categories.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <div>
                    <BudgetManager />
                </div>
            </div>
        </div>
    )
}
