
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { savingsGoals as goals } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { AddGoalSheet } from '@/components/goals/add-goal-sheet';
import { UpdateGoalSheet } from '@/components/goals/update-goal-sheet';
import { PiggyBank, ShoppingCart } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
                        const purchasedItems = goal.items?.filter(i => i.purchased).length || 0;
                        const totalItems = goal.items?.length || 0;
                        return (
                            <Card key={goal.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                                            <div>
                                                <CardTitle>{goal.name}</CardTitle>
                                                <CardDescription>Deadline: {new Date(goal.deadline).toLocaleDateString()}</CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1">
                                    {goal.items && goal.items.length > 0 && (
                                         <div className="space-y-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold text-sm">Shopping List</h4>
                                                <span className="text-xs text-muted-foreground">{purchasedItems} / {totalItems} purchased</span>
                                            </div>
                                            {goal.items.map(item => (
                                                <div key={item.id} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox id={`item-${item.id}`} checked={item.purchased} />
                                                        <Label htmlFor={`item-${item.id}`} className={item.purchased ? 'line-through text-muted-foreground' : ''}>
                                                            {item.name}
                                                        </Label>
                                                    </div>
                                                    <span className={item.purchased ? 'line-through text-muted-foreground' : ''}>{formatCurrency(item.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-muted-foreground">Contribution Progress</span>
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
