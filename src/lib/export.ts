import type { Transaction, Bill, SavingsGoal, Client, Product, Quote, Loan } from './types';
import { formatCurrency } from './utils';

export type ExportFormat = 'csv' | 'json';
export type ExportType = 'transactions' | 'bills' | 'goals' | 'clients' | 'products' | 'quotes' | 'loans' | 'financial-summary';

interface ExportOptions {
  format: ExportFormat;
  dateRange?: {
    start: string;
    end: string;
  };
  workspace?: 'personal' | 'business';
  includeCategories?: boolean;
}

// CSV Export Functions
function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers: (keyof T)[],
  headerLabels?: string[]
): string {
  if (data.length === 0) return '';
  
  const csvHeaders = headerLabels || headers.map(String);
  const csvRows = [csvHeaders.join(',')];
  
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Transaction Export
export function exportTransactions(
  transactions: Transaction[],
  options: ExportOptions
): void {
  let filteredTransactions = [...transactions];
  
  // Filter by workspace if specified
  if (options.workspace) {
    filteredTransactions = filteredTransactions.filter(t => t.workspace === options.workspace);
  }
  
  // Filter by date range if specified
  if (options.dateRange) {
    const start = new Date(options.dateRange.start);
    const end = new Date(options.dateRange.end);
    filteredTransactions = filteredTransactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  }
  
  // Sort by date (newest first)
  filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const filename = `transactions_${new Date().toISOString().split('T')[0]}.${options.format}`;
  
  if (options.format === 'csv') {
    const headers: (keyof Transaction)[] = ['date', 'description', 'category', 'type', 'amount', 'workspace'];
    const headerLabels = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Workspace'];
    
    const csvData = filteredTransactions.map(t => ({
      ...t,
      amount: formatCurrency(t.amount),
      type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      workspace: t.workspace.charAt(0).toUpperCase() + t.workspace.slice(1),
    }));
    
    const csvContent = arrayToCSV(csvData, headers, headerLabels);
    downloadFile(csvContent, filename, 'text/csv');
  } else {
    const jsonContent = JSON.stringify(filteredTransactions, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
  }
}

// Bills Export
export function exportBills(bills: Bill[], options: ExportOptions): void {
  let filteredBills = [...bills];
  
  if (options.workspace) {
    filteredBills = filteredBills.filter(b => b.workspace === options.workspace);
  }
  
  const filename = `bills_${new Date().toISOString().split('T')[0]}.${options.format}`;
  
  if (options.format === 'csv') {
    const headers: (keyof Bill)[] = ['name', 'amount', 'dueDate', 'status', 'isRecurring', 'recurringFrequency'];
    const headerLabels = ['Name', 'Amount', 'Due Date', 'Status', 'Is Recurring', 'Frequency'];
    
    const csvData = filteredBills.map(b => ({
      ...b,
      amount: formatCurrency(b.amount),
      status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
      isRecurring: b.isRecurring ? 'Yes' : 'No',
      recurringFrequency: b.recurringFrequency || 'N/A',
    }));
    
    const csvContent = arrayToCSV(csvData, headers, headerLabels);
    downloadFile(csvContent, filename, 'text/csv');
  } else {
    const jsonContent = JSON.stringify(filteredBills, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
  }
}

// Financial Summary Export
export function exportFinancialSummary(
  transactions: Transaction[],
  bills: Bill[],
  goals: SavingsGoal[],
  loans: Loan[],
  options: ExportOptions
): void {
  const workspace = options.workspace || 'personal';
  const workspaceTransactions = transactions.filter(t => t.workspace === workspace);
  const workspaceBills = bills.filter(b => b.workspace === workspace);
  const workspaceGoals = goals.filter(g => g.workspace === workspace);
  const workspaceLoans = loans.filter(l => l.workspace === workspace);
  
  // Calculate summary statistics
  const totalIncome = workspaceTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = workspaceTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netIncome = totalIncome - totalExpenses;
  
  const unpaidBills = workspaceBills
    .filter(b => b.status === 'unpaid')
    .reduce((sum, b) => sum + b.amount, 0);
    
  const totalGoalTarget = workspaceGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalProgress = workspaceGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  
  const totalLoanDebt = workspaceLoans
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.remainingAmount, 0);
  
  // Category breakdown
  const categoryBreakdown = workspaceTransactions.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { income: 0, expense: 0 };
    }
    acc[t.category][t.type] += t.amount;
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);
  
  const summary = {
    workspace: workspace.charAt(0).toUpperCase() + workspace.slice(1),
    reportDate: new Date().toISOString().split('T')[0],
    totalIncome: formatCurrency(totalIncome),
    totalExpenses: formatCurrency(totalExpenses),
    netIncome: formatCurrency(netIncome),
    unpaidBills: formatCurrency(unpaidBills),
    totalGoalTarget: formatCurrency(totalGoalTarget),
    totalGoalProgress: formatCurrency(totalGoalProgress),
    goalProgressPercentage: totalGoalTarget > 0 ? ((totalGoalProgress / totalGoalTarget) * 100).toFixed(1) + '%' : '0%',
    totalLoanDebt: formatCurrency(totalLoanDebt),
    categoryBreakdown,
  };
  
  const filename = `financial_summary_${workspace}_${new Date().toISOString().split('T')[0]}.${options.format}`;
  
  if (options.format === 'csv') {
    // Create a flattened CSV view
    const summaryRows = [
      ['Metric', 'Value'],
      ['Workspace', summary.workspace],
      ['Report Date', summary.reportDate],
      ['Total Income', summary.totalIncome],
      ['Total Expenses', summary.totalExpenses],
      ['Net Income', summary.netIncome],
      ['Unpaid Bills', summary.unpaidBills],
      ['Goal Target', summary.totalGoalTarget],
      ['Goal Progress', summary.totalGoalProgress],
      ['Goal Progress %', summary.goalProgressPercentage],
      ['Loan Debt', summary.totalLoanDebt],
      ['', ''], // Empty row
      ['Category Breakdown', ''],
      ['Category', 'Income', 'Expenses'],
    ];
    
    Object.entries(categoryBreakdown).forEach(([category, amounts]) => {
      summaryRows.push([
        category,
        formatCurrency(amounts.income),
        formatCurrency(amounts.expense)
      ]);
    });
    
    const csvContent = summaryRows.map(row => row.join(',')).join('\n');
    downloadFile(csvContent, filename, 'text/csv');
  } else {
    const jsonContent = JSON.stringify(summary, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
  }
}

// Clients Export (Business only)
export function exportClients(clients: Client[], options: ExportOptions): void {
  const filename = `clients_${new Date().toISOString().split('T')[0]}.${options.format}`;
  
  if (options.format === 'csv') {
    const headers: (keyof Client)[] = ['name', 'email', 'phone', 'address'];
    const headerLabels = ['Name', 'Email', 'Phone', 'Address'];
    
    const csvData = clients.map(c => ({
      ...c,
      phone: c.phone || '',
      address: c.address || '',
    }));
    
    const csvContent = arrayToCSV(csvData, headers, headerLabels);
    downloadFile(csvContent, filename, 'text/csv');
  } else {
    const jsonContent = JSON.stringify(clients, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
  }
}

// Products Export (Business only)
export function exportProducts(products: Product[], options: ExportOptions): void {
  const filename = `products_${new Date().toISOString().split('T')[0]}.${options.format}`;
  
  if (options.format === 'csv') {
    const headers: (keyof Product)[] = ['name', 'description', 'price', 'cost_price'];
    const headerLabels = ['Name', 'Description', 'Price', 'Cost Price'];
    
    const csvData = products.map(p => ({
      ...p,
      description: p.description || '',
      price: formatCurrency(p.price),
      cost_price: formatCurrency(p.cost_price || 0),
    }));
    
    const csvContent = arrayToCSV(csvData, headers, headerLabels);
    downloadFile(csvContent, filename, 'text/csv');
  } else {
    const jsonContent = JSON.stringify(products, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
  }
}

// Utility function to get appropriate filename
export function getExportFilename(type: ExportType, format: ExportFormat, workspace?: string): string {
  const date = new Date().toISOString().split('T')[0];
  const workspacePrefix = workspace ? `${workspace}_` : '';
  return `${workspacePrefix}${type}_${date}.${format}`;
}

// Main export function
export async function exportData(
  type: ExportType,
  data: any,
  options: ExportOptions
): Promise<void> {
  try {
    switch (type) {
      case 'transactions':
        exportTransactions(data, options);
        break;
      case 'bills':
        exportBills(data, options);
        break;
      case 'clients':
        exportClients(data, options);
        break;
      case 'products':
        exportProducts(data, options);
        break;
      case 'financial-summary':
        const { transactions, bills, goals, loans } = data;
        exportFinancialSummary(transactions, bills, goals, loans, options);
        break;
      default:
        throw new Error(`Unsupported export type: ${type}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error(`Failed to export ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}