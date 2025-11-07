'use client';

import { useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download, Mail, Check, X, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import Logo from '@/components/logo';
import { BusinessHeader } from '@/components/documents/business-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useBusinessProfile } from '@/hooks/use-business-profile';
import { AddReceiptSheet } from '@/components/receipts/add-receipt-sheet';
import { AddDeliveryNoteSheet } from '@/components/delivery-notes/add-delivery-note-sheet';
import { TermsConditions } from '@/components/documents/terms-conditions';
import { CreditCard, Truck, FileText } from 'lucide-react';

export default function QuotePage() {
    const params = useParams();
    const quoteId = params.id as string;
    const { quotes, clients, products, updateQuote } = useAppStore();
    const quote = quotes.find(q => q.id === quoteId);
    const client = quote ? clients.find(c => c.id === quote.clientId) : null;
    const quoteRef = React.useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const { businessProfile } = useBusinessProfile();
    const [isReceiptSheetOpen, setIsReceiptSheetOpen] = React.useState(false);
    const [isDeliveryNoteSheetOpen, setIsDeliveryNoteSheetOpen] = React.useState(false);

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
        const businessName = businessProfile?.name || 'My Business Inc.';
        const subject = `Quotation ${quote.quoteNumber} from ${businessName}`;
        const body = `Dear ${client.name},\n\nPlease find our quotation attached.\n\nView it online: ${window.location.href}\n\nBest regards,\n${businessName}`;
        window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    const handleStatusChange = (newStatus: 'draft' | 'sent' | 'accepted' | 'rejected') => {
        const updatedQuote = {
            ...quote,
            status: newStatus
        };
        
        updateQuote(updatedQuote);
        
        toast({
            title: 'Quote Status Updated',
            description: `Quote ${quote.quoteNumber} status has been updated to ${newStatus}.`,
        });
    }
    
    const handleCreateInvoice = () => {
        // Convert quote to invoice by marking it as accepted
        handleStatusChange('accepted');
        toast({
            title: 'Invoice Created',
            description: `Quote ${quote.quoteNumber} has been converted to an invoice.`,
        });
    }

    const totalAmount = getTotalAmount(quote.items);

    return (
        <div className="flex-1 space-y-4">
            <PageHeader 
                title={`Quote ${quote.quoteNumber}`} 
                description={`Details for quotation sent to ${client.name}`}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <span className="capitalize">{quote.status}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusChange('draft')}>
                            <span className="flex items-center">
                                <span className="mr-2 h-2 w-2 rounded-full bg-gray-400"></span>
                                Draft
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('sent')}>
                            <span className="flex items-center">
                                <span className="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
                                Sent
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('accepted')}>
                            <span className="flex items-center">
                                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                                Accepted
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('rejected')}>
                            <span className="flex items-center">
                                <span className="mr-2 h-2 w-2 rounded-full bg-red-500"></span>
                                Rejected
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" onClick={handleEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Quote
                </Button>
                <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
                {quote.status === 'sent' && (
                    <Button onClick={handleCreateInvoice} variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Convert to Invoice
                    </Button>
                )}
                {(quote.status === 'accepted' || quote.status === 'sent') && (
                    <>
                        <Button onClick={() => setIsReceiptSheetOpen(true)} variant="outline">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Add Receipt
                        </Button>
                        <Button onClick={() => setIsDeliveryNoteSheetOpen(true)} variant="outline">
                            <Truck className="mr-2 h-4 w-4" />
                            Create Delivery Note
                        </Button>
                    </>
                )}
            </PageHeader>
            <div className="px-4 sm:px-6">
                <Card ref={quoteRef} className="p-8 card-minimal">
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
                                <CardTitle className="text-4xl mb-2">QUOTATION</CardTitle>
                                <p className="text-muted-foreground"><strong>Quote #:</strong> {quote.quoteNumber}</p>
                                <p className="text-muted-foreground"><strong>Date:</strong> {new Date(quote.date).toLocaleDateString()}</p>
                                <p className="text-muted-foreground"><strong>Expires:</strong> {new Date(quote.expiryDate).toLocaleDateString()}</p>
                                <span className={`mt-2 px-2 py-0.5 rounded-md text-xs capitalize ${
                                    quote.status === 'accepted' ? 'badge-success' :
                                    quote.status === 'sent' ? 'badge-info' :
                                    quote.status === 'rejected' ? 'badge-error' : ''
                                }`}>
                                    {quote.status}
                                </span>
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
                    
                    <TermsConditions showPaymentTerms={false} />
                    
                    <CardFooter className="p-0 mt-12 text-center text-xs text-muted-foreground">
                        Thank you for your business!
                    </CardFooter>
                </Card>
            </div>
            
            {/* Workflow Sheets */}
            <AddReceiptSheet
                open={isReceiptSheetOpen}
                onOpenChange={setIsReceiptSheetOpen}
                linkedQuoteId={quote.id}
                prefilledAmount={totalAmount}
            />
            
            <AddDeliveryNoteSheet
                open={isDeliveryNoteSheetOpen}
                onOpenChange={setIsDeliveryNoteSheetOpen}
                linkedQuoteId={quote.id}
            />
        </div>
    );
}