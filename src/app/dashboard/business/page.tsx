
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const businessLinks = [
    {
        href: '/dashboard/clients',
        icon: Users,
        title: 'Clients',
        description: 'Manage your customers and contacts.',
    },
    {
        href: '/dashboard/products',
        icon: Package,
        title: 'Products & Services',
        description: 'Maintain your offerings and pricing.',
    },
    {
        href: '/dashboard/quotes',
        icon: FileText,
        title: 'Quotations',
        description: 'Create and track quotes for clients.',
    }
]

export default function BusinessHubPage() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader
                title="Business Hub"
                description="Your central command for all business activities."
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6">
                {businessLinks.map(link => (
                    <Link to={link.href} key={link.href}>
                        <Card className="hover:bg-muted/50 transition-colors h-full">
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                    <link.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>{link.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{link.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
