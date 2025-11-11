'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { exportData, type ExportFormat, type ExportType } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useAppStore } from '@/lib/data';

const exportFormSchema = z.object({
  format: z.enum(['csv', 'json']),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  includeCategories: z.boolean().optional(),
});

interface ExportDataProps {
  type: ExportType;
  title?: string;
  description?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'default' | 'lg';
  showDropdown?: boolean;
}

export function ExportData({
  type,
  title,
  description,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  showDropdown = false,
}: ExportDataProps) {
  const [open, setOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const { toast } = useToast();
  const { activeWorkspace } = useActiveWorkspace();
  const { transactions, bills, savingsGoals, clients, products, quotes, loans } = useAppStore();

  const form = useForm<z.infer<typeof exportFormSchema>>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      format: 'csv',
      includeCategories: true,
    },
  });

  const handleQuickExport = async (format: ExportFormat) => {
    await performExport(format, {});
  };

  const performExport = async (format: ExportFormat, options: any) => {
    setIsExporting(true);
    
    try {
      let data;
      
      switch (type) {
        case 'transactions':
          data = transactions;
          break;
        case 'bills':
          data = bills;
          break;
        case 'goals':
          data = savingsGoals;
          break;
        case 'clients':
          data = clients;
          break;
        case 'products':
          data = products;
          break;
        case 'quotes':
          data = quotes;
          break;
        case 'loans':
          data = loans;
          break;
        case 'financial-summary':
          data = { transactions, bills, goals: savingsGoals, loans };
          break;
        default:
          throw new Error(`Unsupported export type: ${type}`);
      }

      await exportData(type, data, {
        format,
        workspace: activeWorkspace,
        ...options,
      });

      toast({
        title: 'Export Successful',
        description: `Your ${type} data has been exported successfully.`,
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An error occurred during export.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof exportFormSchema>) => {
    await performExport(values.format, {
      dateRange: values.dateRange,
      includeCategories: values.includeCategories,
    });
  };

  if (showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={buttonVariant} size={buttonSize}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Quick Export</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleQuickExport('csv')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport('json')}>
            <FileText className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Calendar className="mr-2 h-4 w-4" />
                Advanced Export...
              </DropdownMenuItem>
            </DialogTrigger>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Export {title || type}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Export {title || type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogDescription>
            {description || 
              `Configure your export settings and download your ${type} data.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="csv">
                        <div className="flex items-center">
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          CSV (Excel Compatible)
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          JSON (Raw Data)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(type === 'transactions' || type === 'financial-summary') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateRange.start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateRange.end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isExporting}>
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Convenience components for specific data types
export function ExportTransactions(props: Omit<ExportDataProps, 'type'>) {
  return <ExportData type="transactions" title="Transactions" {...props} />;
}

export function ExportFinancialSummary(props: Omit<ExportDataProps, 'type'>) {
  return (
    <ExportData
      type="financial-summary"
      title="Financial Summary"
      description="Export a comprehensive financial report including transactions, budgets, and goals."
      {...props}
    />
  );
}

export function ExportBills(props: Omit<ExportDataProps, 'type'>) {
  return <ExportData type="bills" title="Bills" {...props} />;
}

export function ExportClients(props: Omit<ExportDataProps, 'type'>) {
  return <ExportData type="clients" title="Clients" {...props} />;
}

export function ExportProducts(props: Omit<ExportDataProps, 'type'>) {
  return <ExportData type="products" title="Products" {...props} />;
}