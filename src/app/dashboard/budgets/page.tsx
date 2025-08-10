
import { BudgetManager } from '@/components/budgets/budget-manager';
import { PageHeader } from '@/components/page-header';

export default function BudgetsPage() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader
                title="Budgets"
                description="Set and manage your monthly spending budgets for each category."
            />
            <div className="px-4 sm:px-6">
               <div className="max-w-4xl mx-auto">
                    <BudgetManager />
               </div>
            </div>
        </div>
    )
}
