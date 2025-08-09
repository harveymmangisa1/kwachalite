import { IncomeExpenseChart } from "@/components/analytics/income-expense-chart";
import { PageHeader } from "@/components/page-header";
import { OverviewCards } from "@/components/dashboard/overview-cards";

export default function AnalyticsPage() {
    return (
        <>
            <PageHeader
                title="Analytics"
                description="Get a deeper insight into your financial habits."
            />
            <div className="space-y-6">
                <OverviewCards />
                <IncomeExpenseChart />
            </div>
        </>
    )
}
