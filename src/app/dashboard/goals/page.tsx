
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { savingsGoals as goals } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { AddGoalSheet } from '@/components/goals/add-goal-sheet';
import { UpdateGoalSheet } from '@/components/goals/update-goal-sheet';
import { PiggyBank } from 'lucide-react';

export default function GoalsPage() {

    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="Financial Goals" description="Set and track your specific financial goals.">
                <AddGoalSheet />
            </PageHeader>
            {goals.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6">
                    {goals.map(goal => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                            <Card key={goal.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{goal.name}</CardTitle>
                                            <CardDescription>Deadline: {new Date(goal.deadline).toLocaleDateString()}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-muted-foreground">Progress</span>
                                            <span className="text-sm font-medium">{Math.round(progress)}%</span>
                                        </div>
                                        <Progress value={progress} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                        </p>
                                    </div>
                                </CardContent>
                                 <CardFooter className="flex justify-end gap-2">
                                    <UpdateGoalSheet goal={goal} />
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="px-4 sm:px-6">
                    <Card className="text-center py-12">
                        <CardContent>
                            <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Financial Goals Yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Create a goal to start tracking your progress.
                            </p>
                            <div className="mt-6">
                                <AddGoalSheet />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
