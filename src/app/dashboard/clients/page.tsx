
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { clients } from '@/lib/data';
import { AddClientSheet } from '@/components/clients/add-client-sheet';
import { ClientsDataTable } from '@/components/clients/data-table';

export default function ClientsPage() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="Clients" description="Manage your business clients.">
                <AddClientSheet />
            </PageHeader>
            <div className="px-4 sm:px-6">
                <Card>
                    <CardHeader>
                        <CardTitle>All Clients</CardTitle>
                        <CardDescription>
                            Here is a list of all your clients.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ClientsDataTable data={clients} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
