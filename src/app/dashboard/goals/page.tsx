
import { PageHeader } from '@/components/page-header';
import { Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function GoalsPage() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader
                title="Financial Goals"
                description="Set and track your spending and savings goals."
            />
            <div className="px-4 sm:px-6">
                <Card className="text-center py-12">
                    <CardContent>
                        <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Coming Soon!</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This is where you'll be able to set flexible financial goals.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
