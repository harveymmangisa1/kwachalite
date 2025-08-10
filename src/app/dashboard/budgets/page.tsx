
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { categories, transactions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import React from 'react';
import { Target } from 'lucide-react';
import type { Category, Transaction } from '@/lib/types';

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
            (c) => c.workspace === activeWorkspace && c.type === 'expense' && c.budget
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
            <div className="px-4 sm:px-6">
                {budgetData.length > 0 ? (
                     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {budgetData.map((item) => (
                            <Card key={item.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                                    <item.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-muted-foreground">Spent</span>
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(item.spent)} / {formatCurrency(item.budget!)}
                                                </span>
                                            </div>
                                            <Progress value={item.progress} />
                                             <p className="text-xs text-muted-foreground mt-1 text-right">
                                                {formatCurrency(item.budget! - item.spent)} remaining
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Budgets Found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Budgets can be set on expense categories in Settings.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
