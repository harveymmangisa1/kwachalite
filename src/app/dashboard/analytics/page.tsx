import { IncomeExpenseChart } from "@/components/analytics/income-expense-chart";
import { PageHeader } from "@/components/page-header";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";

export default function AnalyticsPage() {
    return (
        <>
            <PageHeader
                title="Analytics"
                description="Get a deeper insight into your financial habits."
            />
            <div className="space-y-6">
                <OverviewCards />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <IncomeExpenseChart />
                    <CategoryPieChart />
                </div>
            </div>
        </>
    )
}
