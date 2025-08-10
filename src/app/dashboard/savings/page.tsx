
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { savingsGoals } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { AddGoalSheet } from '@/components/savings/add-goal-sheet';
import { UpdateSavingsGoal } from '@/components/savings/update-goal-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Share2, PiggyBank } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShareGoalButton } from '@/components/savings/share-goal-button';

export default function SavingsPage() {

    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="Savings" description="Track and manage your savings goals.">
                <AddGoalSheet />
            </PageHeader>
            {savingsGoals.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6">
                    {savingsGoals.map(goal => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                            <Card key={goal.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{goal.name}</CardTitle>
                                            <CardDescription>Deadline: {new Date(goal.deadline).toLocaleDateString()}</CardDescription>
                                        </div>
                                        {goal.type === 'group' && (
                                            <div className="flex -space-x-2">
                                                {goal.members?.map((member, index) => (
                                                    <Avatar key={index} className="h-8 w-8 border-2 border-background">
                                                        <AvatarImage src={`https://placehold.co/40x40.png?text=${member.substring(0, 2).toUpperCase()}`} data-ai-hint="person avatar" />
                                                        <AvatarFallback>{member.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                        )}
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
                                    {goal.type === 'group' && (
                                       <ShareGoalButton goalId={goal.id} />
                                    )}
                                    <UpdateSavingsGoal goal={goal} />
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
                            <h3 className="mt-4 text-lg font-semibold">No Savings Goals</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Start saving for your dreams today.
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
