
'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/data';
import { QuotesDataTable } from '@/components/quotes/data-table';
import { Mail, Phone } from 'lucide-react';

export default function ClientDetailPage() {
    const params = useParams();
    const clientId = params.id as string;
    const { clients, quotes } = useAppStore();
    const client = clients.find(c => c.id === clientId);
    const clientQuotes = quotes.filter(q => q.clientId === clientId);

    if (!client) {
        return (
            <div className="flex-1 space-y-4">
                <PageHeader title="Client Not Found" description="The requested client could not be found." />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4">
            <PageHeader title={client.name} description="View client details and history." />
            <div className="px-4 sm:px-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                           <Mail className="h-5 w-5 text-muted-foreground" />
                           <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                             {client.email}
                           </a>
                        </div>
                        {client.phone && (
                            <div className="flex items-center gap-4">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <span>{client.phone}</span>
                            </div>
                        )}
                        {client.address && (
                             <p className="text-muted-foreground pt-2">
                                <strong>Address:</strong><br />
                                {client.address.split(',').map((line, index) => <span key={index}>{line.trim()}<br/></span>)}
                            </p>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Quotation History</CardTitle>
                        <CardDescription>
                            A list of all quotations sent to {client.name}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <QuotesDataTable data={clientQuotes} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
