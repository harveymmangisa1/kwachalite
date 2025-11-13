'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Receipt, Download, Mail, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { BusinessHeader } from '@/components/documents/business-header';
import type { Quote, Client, Product } from '@/lib/types';

export default function InvoicesPage() {
    const { quotes, clients, products } = useAppStore();
    
    // Filter quotes that are accepted (these can be converted to invoices)
    const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted');
    
    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
    }
    
    const getClientEmail = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.email || '';
    }

    const getTotalAmount = (items: Quote['items']) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    const getProductName = (productId: string) => {
        return products.find(p => p.id === productId)?.name || 'Unknown Product';
    }
    
    const handleDownloadInvoice = (quote: Quote) => {
        const input = document.getElementById(`invoice-${quote.id}`);
        if (input) {
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Invoice-${quote.quoteNumber}.pdf`);
            });
        }
    };
    
    const handleEmailInvoice = (quote: Quote) => {
        const client = clients.find(c => c.id === quote.clientId);
        if (client) {
            const subject = `Invoice ${quote.quoteNumber} from My Business Inc.`;
            const body = `Dear ${client.name},\n\nPlease find our invoice attached.\n\nBest regards,\nMy Business Inc.`;
            window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    }

    return (
        <div data-tour="invoices" className="flex-1 space-y-4">
            <PageHeader 
                title="Invoices" 
                description="Manage your business invoices. Accepted quotes can be converted to invoices."
            />
            <div className="px-4 sm:px-6">
                {acceptedQuotes.length > 0 ? (
                    <div className="space-y-6">
                        <Card className="card-minimal">
                            <CardHeader>
                                <CardTitle>Ready to Invoice</CardTitle>
                                <CardDescription>
                                    These accepted quotes can be converted to invoices.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quote #</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {acceptedQuotes.map((quote) => {
                                            const totalAmount = getTotalAmount(quote.items);
                                            return (
                                                <TableRow key={quote.id} className="row-hover-minimal">
                                                    <TableCell>
                                                        <div className="font-medium">{quote.quoteNumber}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getClientName(quote.clientId)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(quote.date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(totalAmount)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm" className="h-8 px-3" asChild>
                                                                <Link to={`/dashboard/invoices/${quote.id}`}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="h-8 px-3"
                                                                onClick={() => handleEmailInvoice(quote)}
                                                            >
                                                                <Mail className="h-4 w-4 mr-2" />
                                                                Email
                                                            </Button>
                                                            <Button 
                                                                size="sm"
                                                                className="h-8 px-3"
                                                                onClick={() => handleDownloadInvoice(quote)}
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        
                        {/* Invoice Preview Templates */}
                        <div className="hidden">
                            {acceptedQuotes.map((quote) => {
                                const client = clients.find(c => c.id === quote.clientId) as Client | undefined;
                                const totalAmount = getTotalAmount(quote.items);
                                
                                return (
                                    <Card 
                                        key={quote.id} 
                                        id={`invoice-${quote.id}`} 
                                        className="p-8 max-w-4xl card-minimal"
                                    >
                                        <CardHeader className="p-0 mb-8">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <BusinessHeader 
                                                        fallbackName="My Business Inc."
                                                        fallbackAddress="123 Business Rd, Commerce City, 12345"
                                                        fallbackEmail="contact@mybusiness.com"
                                                        compact={true}
                                                    />
                                                </div>
                                                <div className="text-right">
                                                    <CardTitle className="text-4xl mb-2">INVOICE</CardTitle>
                                                    <p className="text-muted-foreground"><strong>Invoice #:</strong> {quote.quoteNumber}</p>
                                                    <p className="text-muted-foreground"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                                    <p className="text-muted-foreground"><strong>Due Date:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="mb-8">
                                                <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
                                                <p className="text-muted-foreground">
                                                    {client?.name}<br />
                                                    {client?.address}<br />
                                                    {client?.email}
                                                </p>
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Item</TableHead>
                                                        <TableHead className="text-center">Quantity</TableHead>
                                                        <TableHead className="text-right">Price</TableHead>
                                                        <TableHead className="text-right">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {quote.items.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-medium">{getProductName(item.productId)}</TableCell>
                                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            <div className="flex justify-end mt-8">
                                                <div className="w-full max-w-sm">
                                                    <div className="flex justify-between py-2">
                                                        <span className="text-muted-foreground">Subtotal</span>
                                                        <span>{formatCurrency(totalAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2">
                                                        <span className="text-muted-foreground">Tax (0%)</span>
                                                        <span>{formatCurrency(0)}</span>
                                                    </div>
                                                    <div className="border-t my-2"></div>
                                                    <div className="flex justify-between py-2 font-bold text-lg">
                                                        <span>Total</span>
                                                        <span>{formatCurrency(totalAmount)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-0 mt-12 text-center text-xs text-muted-foreground">
                                            Thank you for your business! Payment is due within 30 days.
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <Card className="text-center py-12 card-minimal">
                        <CardContent>
                            <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Invoices Ready</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Accepted quotes will appear here and can be converted to invoices.
                            </p>
                            <div className="mt-6">
                                <Link to="/dashboard/quotes">
                                    <Button>
                                        View Quotes
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}