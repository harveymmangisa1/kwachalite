import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { savingsGoals } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function SavingsPage() {
    return (
        <>
            <PageHeader title="Savings" description="Track your progress towards your savings goals." />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {savingsGoals.map(goal => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                        <Card key={goal.id}>
                            <CardHeader>
                                <CardTitle>{goal.name}</CardTitle>
                                <CardDescription>Deadline: {new Date(goal.deadline).toLocaleDateString()}</CardDescription>
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
                        </Card>
                    )
                })}
            </div>
        </>
    )
}
