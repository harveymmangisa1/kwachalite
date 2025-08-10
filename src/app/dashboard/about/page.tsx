import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Briefcase,
    ArrowRightLeft,
    Landmark,
    Target,
    ReceiptText,
    Users,
    Package,
    FileText,
    BarChart2,
    Settings
} from 'lucide-react';

const features = [
    {
        icon: Briefcase,
        title: 'Multi-Workspace',
        description: 'Switch between personal and business workspaces to keep your finances separate and organized.',
    },
    {
        icon: ArrowRightLeft,
        title: 'Transactions',
        description: 'Track all your income and expenses. Use the AI receipt scanner to automatically categorize expenses.',
    },
    {
        icon: Landmark,
        title: 'Budgets',
        description: 'Set monthly or weekly budgets for different spending categories to stay on top of your finances.',
    },
    {
        icon: Target,
        title: 'Goals',
        description: 'Create savings goals for specific objectives, like a vacation or a new gadget, complete with a shopping list.',
    },
    {
        icon: ReceiptText,
        title: 'Bills',
        description: 'Manage your upcoming and recurring bills to avoid late fees.',
    },
    {
        icon: Users,
        title: 'Clients',
        description: 'For business users, manage your client information and contact details in one place.',
    },
    {
        icon: Package,
        title: 'Products & Services',
        description: 'Keep a list of products and services you offer to easily create quotations.',
    },
    {
        icon: FileText,
        title: 'Quotations',
        description: 'Create, manage, and send professional quotations to your clients.',
    },
    {
        icon: BarChart2,
        title: 'Analytics',
        description: 'Visualize your financial data with insightful charts and graphs.',
    },
    {
        icon: Settings,
        title: 'Settings',
        description: 'Customize your profile and application settings.',
    }
]

export default function AboutPage() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader
                title="About KwachaLite"
                description="Your modern, minimal personal and business finance tracker."
            />
            <div className="px-4 sm:px-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to KwachaLite!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            KwachaLite is designed to help you take control of your financial life with ease and clarity. Whether you're managing your personal budget or tracking your business expenses, we provide the tools you need to succeed.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Features</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div key={feature.title} className="flex items-start gap-4">
                                <feature.icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Navigation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Use the sidebar on the left (or the bottom navigation bar on mobile) to move between the different sections of the app. Your user menu in the top right (or under your avatar in the desktop sidebar) allows you to switch between workspaces and access settings.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
