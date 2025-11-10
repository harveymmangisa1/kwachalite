import { IncomeExpenseChart } from "@/components/analytics/income-expense-chart";
import { PageHeader } from "@/components/page-header";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { useAppStore } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";

export default function AnalyticsPage() {
    const { transactions, bills, savingsGoals, loans, businessRevenues, businessExpenses } = useAppStore();

    // Combine all financial data for comprehensive analytics
    const allTransactions = [
        ...transactions,
        // Convert bills to transactions for analytics
        ...bills.map(bill => ({
            id: `bill-${bill.id}`,
            date: bill.dueDate,
            type: 'expense' as const,
            amount: bill.amount,
            description: bill.name,
            category: 'Bills',
            workspace: bill.workspace,
        })),
        // Convert loan payments to transactions
        ...loans.map(loan => ({
            id: `loan-${loan.id}`,
            date: loan.startDate,
            type: 'expense' as const,
            amount: loan.principal / loan.term, // Monthly payment approximation
            description: `Loan payment - ${loan.lender}`,
            category: 'Loans',
            workspace: loan.workspace,
        })),
        // Convert business revenues to transactions
        ...businessRevenues.map(revenue => ({
            id: `revenue-${revenue.id}`,
            date: revenue.date,
            type: 'income' as const,
            amount: revenue.amount,
            description: revenue.description,
            category: revenue.category,
            workspace: 'business' as const,
        })),
        // Convert business expenses to transactions
        ...businessExpenses.map(expense => ({
            id: `expense-${expense.id}`,
            date: expense.date,
            type: 'expense' as const,
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            workspace: 'business' as const,
        })),
    ];

    return (
        <div className="flex-1 space-y-4">
            <PageHeader
                title="Analytics"
                description="Get a deeper insight into your financial habits."
            />
            <div className="space-y-6 px-4 sm:px-6">
                {allTransactions.length > 0 ? (
                    <>
                        <OverviewCards transactions={allTransactions} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <IncomeExpenseChart transactions={allTransactions} />
                            <CategoryPieChart transactions={allTransactions} />
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="card-minimal">
                            <CardHeader className="text-center">
                                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <CardTitle>No Data Available</CardTitle>
                                <CardDescription>
                                    Start adding transactions, bills, and goals to see your analytics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Your financial data will appear here once you start tracking your income and expenses.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="card-minimal">
                            <CardHeader className="text-center">
                                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <CardTitle>Track Your Progress</CardTitle>
                                <CardDescription>
                                    Monitor your income and expenses over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Add transactions regularly to see trends and patterns in your financial behavior.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="card-minimal">
                            <CardHeader className="text-center">
                                <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <CardTitle>Category Breakdown</CardTitle>
                                <CardDescription>
                                    Understand where your money goes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    View detailed breakdowns of your spending by category.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
