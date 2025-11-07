'use client';

import { useParams } from 'react-router-dom';
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
import { BusinessHeader } from '@/components/documents/business-header';
import { useBusinessProfile } from '@/hooks/use-business-profile';
import { AddReceiptSheet } from '@/components/receipts/add-receipt-sheet';
import { AddDeliveryNoteSheet } from '@/components/delivery-notes/add-delivery-note-sheet';
import { TermsConditions } from '@/components/documents/terms-conditions';
import { CreditCard, Truck } from 'lucide-react';
import type { Quote, Client, Product } from '@/lib/types';

export default function InvoicePage() {
    const params = useParams();
    const invoiceId = params.id as string;
    const { quotes, clients, products } = useAppStore();
    
    // Find the quote that was converted to this invoice
    const quote = quotes.find(q => q.id === invoiceId && q.status === 'accepted');
    const client = quote ? clients.find(c => c.id === quote.clientId) : null;
    const invoiceRef = React.useRef<HTMLDivElement>(null);
    const { businessProfile } = useBusinessProfile();
    const [isReceiptSheetOpen, setIsReceiptSheetOpen] = React.useState(false);
    const [isDeliveryNoteSheetOpen, setIsDeliveryNoteSheetOpen] = React.useState(false);

    if (!quote || !client) {
        return (
            <div className="flex-1 space-y-4">
                <PageHeader title="Invoice Not Found" description="The requested invoice could not be found." />
            </div>
        );
    }

    const getTotalAmount = (items: Quote['items']) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    const getProductName = (productId: string) => {
        return products.find(p => p.id === productId)?.name || 'Unknown Product';
    }
    
    const handleDownload = () => {
        const input = invoiceRef.current;
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
    
    const handleEmail = () => {
        const businessName = businessProfile?.name || 'My Business Inc.';
        const subject = `Invoice ${quote.quoteNumber} from ${businessName}`;
        const body = `Dear ${client.name},\n\nPlease find our invoice attached.\n\nBest regards,\n${businessName}`;
        window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    const totalAmount = getTotalAmount(quote.items);

    return (
        <div className="flex-1 space-y-4">
            <PageHeader 
                title={`Invoice ${quote.quoteNumber}`} 
                description={`Details for invoice generated from quote sent to ${client.name}`}
            >
                <Button variant="outline" onClick={handleEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Invoice
                </Button>
                <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
                <Button onClick={() => setIsReceiptSheetOpen(true)} variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Payment
                </Button>
                <Button onClick={() => setIsDeliveryNoteSheetOpen(true)} variant="outline">
                    <Truck className="mr-2 h-4 w-4" />
                    Create Delivery Note
                </Button>
            </PageHeader>
            <div className="px-4 sm:px-6">
                <Card ref={invoiceRef} className="p-8 card-minimal">
                    <CardHeader className="p-0 mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <BusinessHeader 
                                    fallbackName="My Business Inc."
                                    fallbackAddress="123 Business Rd, Commerce City, 12345"
                                    fallbackEmail="contact@mybusiness.com"
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
                                    <TableRow key={index} className="row-hover-minimal">
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
                    
                    <TermsConditions showPaymentTerms={true} />
                    
                    <CardFooter className="p-0 mt-12 text-center text-xs text-muted-foreground">
                        Thank you for your business! Payment is due within 30 days.
                    </CardFooter>
                </Card>
            </div>
            
            {/* Workflow Sheets */}
            <AddReceiptSheet
                open={isReceiptSheetOpen}
                onOpenChange={setIsReceiptSheetOpen}
                linkedInvoiceId={quote.id}
                prefilledAmount={totalAmount}
            />
            
            <AddDeliveryNoteSheet
                open={isDeliveryNoteSheetOpen}
                onOpenChange={setIsDeliveryNoteSheetOpen}
                linkedInvoiceId={quote.id}
            />
        </div>
    );
}
