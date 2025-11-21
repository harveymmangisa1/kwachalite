'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { AddGoalSheet } from '@/components/goals/add-goal-sheet';
import { PiggyBank, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavingsPage() {
    const { savingsGoals } = useAppStore();

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container-padding space-y-6 pb-8">
                <PageHeader 
                    title="Savings" 
                    description="Track your personal and group savings goals."
                    icon={<Target className="h-6 w-6 text-blue-600" />}
                >
                    <div className="flex gap-2">
                        <AddGoalSheet />
                        <Button asChild variant="outline">
                            <Link to="/dashboard/savings/groups">
                                <Users className="h-4 w-4 mr-2" />
                                Group Savings
                            </Link>
                        </Button>
                    </div>
                </PageHeader>
                {savingsGoals.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {savingsGoals.map(goal => {
                            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                            return (
                                <Card key={goal.id} className="flex flex-col rounded-2xl shadow-sm">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <PiggyBank className="h-6 w-6 text-muted-foreground" />
                                                <div>
                                                    <CardTitle>{goal.name}</CardTitle>
                                                    <CardDescription>Deadline: {new Date(goal.deadline).toLocaleDateString()}</CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 flex-1">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-muted-foreground">Progress</span>
                                                <span className="text-sm font-medium">{Math.round(progress)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card className="text-center py-12 rounded-2xl shadow-sm">
                        <CardContent>
                            <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Savings Goals Yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Create a goal to start tracking your progress.
                            </p>
                            <div className="mt-6">
                                <AddGoalSheet />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}