import { IncomeExpenseChart } from "@/components/analytics/income-expense-chart";
import { PageHeader } from "@/components/page-header";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";

// Mock data for demonstration
const mockTransactions = [
    { id: '1', date: '2024-01-01', type: 'income' as const, amount: 5000, description: 'Salary', category: 'Salary', workspace: 'personal' as const },
    { id: '2', date: '2024-01-02', type: 'expense' as const, amount: 1200, description: 'Rent', category: 'Housing', workspace: 'personal' as const },
    { id: '3', date: '2024-01-03', type: 'income' as const, amount: 800, description: 'Freelance', category: 'Freelance', workspace: 'personal' as const },
    { id: '4', date: '2024-01-04', type: 'expense' as const, amount: 300, description: 'Groceries', category: 'Food', workspace: 'personal' as const },
];

export default function AnalyticsPage() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader
                title="Analytics"
                description="Get a deeper insight into your financial habits."
            />
            <div className="space-y-6 px-4 sm:px-6">
                <OverviewCards transactions={mockTransactions} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <IncomeExpenseChart transactions={mockTransactions} />
                    <CategoryPieChart transactions={mockTransactions} />
                </div>
            </div>
        </div>
    )
}
