
'use client';

import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import Logo from '@/components/logo';

export default function QuotePage() {
    const params = useParams();
    const quoteId = params.id as string;
    const { quotes, clients, products } = useAppStore();
    const quote = quotes.find(q => q.id === quoteId);
    const client = quote ? clients.find(c => c.id === quote.clientId) : null;
    const quoteRef = React.useRef<HTMLDivElement>(null);

    if (!quote || !client) {
        return (
            <div className="flex-1 space-y-4">
                <PageHeader title="Quote Not Found" description="The requested quote could not be found." />
            </div>
        );
    }

    const getTotalAmount = (items: typeof quote.items) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    const getProductName = (productId: string) => {
        return products.find(p => p.id === productId)?.name || 'Unknown Product';
    }
    
    const handleDownload = () => {
        const input = quoteRef.current;
        if (input) {
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Quote-${quote.quoteNumber}.pdf`);
            });
        }
    };
    
    const handleEmail = () => {
        const subject = `Quotation ${quote.quoteNumber} from My Business Inc.`;
        const body = `Dear ${client.name},\n\nPlease find our quotation attached.\n\nView it online: ${window.location.href}\n\nBest regards,\nMy Business Inc.`;
        window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    const totalAmount = getTotalAmount(quote.items);

    return (
        <div className="flex-1 space-y-4">
            <PageHeader title={`Quote ${quote.quoteNumber}`} description={`Details for quotation sent to ${client.name}`}>
                <Button variant="outline" onClick={handleEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Quote
                </Button>
                <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </PageHeader>
            <div className="px-4 sm:px-6">
                <Card ref={quoteRef} className="p-8">
                    <CardHeader className="p-0 mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <Logo />
                                <p className="text-muted-foreground text-sm mt-2">
                                    My Business Inc.<br />
                                    123 Business Rd, Commerce City, 12345<br/>
                                    contact@mybusiness.com
                                </p>
                            </div>
                            <div className="text-right">
                                <CardTitle className="text-4xl mb-2">QUOTATION</CardTitle>
                                <p className="text-muted-foreground"><strong>Quote #:</strong> {quote.quoteNumber}</p>
                                <p className="text-muted-foreground"><strong>Date:</strong> {new Date(quote.date).toLocaleDateString()}</p>
                                <p className="text-muted-foreground"><strong>Expires:</strong> {new Date(quote.expiryDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
                            <p className="text-muted-foreground">
                                {client.name}<br />
                                {client.address}<br />
                                {client.email}
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
                        Thank you for your business!
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
