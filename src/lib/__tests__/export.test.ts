/**
 * @jest-environment jsdom
 */

import {
  exportTransactions,
  exportBills,
  exportFinancialSummary,
  getExportFilename,
  exportData,
} from '../export';
import type { Transaction, Bill, SavingsGoal, Loan } from '../types';

// Mock the global URL and document objects
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    href: '',
    download: '',
    click: mockClick,
  })),
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
});

// Mock Blob
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
}));

describe('Export Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('mock-url');
  });

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-01',
      description: 'Test transaction 1',
      amount: 100,
      type: 'expense',
      category: 'groceries',
      workspace: 'personal',
    },
    {
      id: '2',
      date: '2024-01-02',
      description: 'Test transaction 2',
      amount: 200,
      type: 'income',
      category: 'salary',
      workspace: 'personal',
    },
  ];

  const mockBills: Bill[] = [
    {
      id: '1',
      name: 'Electricity',
      amount: 150,
      dueDate: '2024-01-15',
      status: 'unpaid',
      isRecurring: true,
      recurringFrequency: 'monthly',
      workspace: 'personal',
    },
  ];

  describe('exportTransactions', () => {
    it('should export transactions as CSV', () => {
      exportTransactions(mockTransactions, { format: 'csv' });

      expect(Blob).toHaveBeenCalledWith(
        [expect.stringContaining('Date,Description,Category,Type,Amount,Workspace')],
        { type: 'text/csv' }
      );
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should export transactions as JSON', () => {
      exportTransactions(mockTransactions, { format: 'json' });

      expect(Blob).toHaveBeenCalledWith(
        [expect.stringContaining('"id": "1"')],
        { type: 'application/json' }
      );
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should filter transactions by workspace', () => {
      const mixedTransactions = [
        ...mockTransactions,
        {
          id: '3',
          date: '2024-01-03',
          description: 'Business transaction',
          amount: 300,
          type: 'expense' as const,
          category: 'office-supplies',
          workspace: 'business' as const,
        },
      ];

      exportTransactions(mixedTransactions, {
        format: 'json',
        workspace: 'personal',
      });

      const blobCall = (Blob as jest.Mock).mock.calls[0];
      const exportedData = JSON.parse(blobCall[0][0]);
      expect(exportedData).toHaveLength(2);
      expect(exportedData.every((t: Transaction) => t.workspace === 'personal')).toBe(true);
    });

    it('should filter transactions by date range', () => {
      exportTransactions(mockTransactions, {
        format: 'json',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-01',
        },
      });

      const blobCall = (Blob as jest.Mock).mock.calls[0];
      const exportedData = JSON.parse(blobCall[0][0]);
      expect(exportedData).toHaveLength(1);
      expect(exportedData[0].id).toBe('1');
    });
  });

  describe('exportBills', () => {
    it('should export bills as CSV', () => {
      exportBills(mockBills, { format: 'csv' });

      expect(Blob).toHaveBeenCalledWith(
        [expect.stringContaining('Name,Amount,Due Date,Status,Is Recurring,Frequency')],
        { type: 'text/csv' }
      );
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should format bill data correctly for CSV', () => {
      exportBills(mockBills, { format: 'csv' });

      const blobCall = (Blob as jest.Mock).mock.calls[0];
      const csvContent = blobCall[0][0];
      
      expect(csvContent).toContain('Electricity');
      expect(csvContent).toContain('MK 150.00'); // Formatted currency
      expect(csvContent).toContain('Unpaid'); // Capitalized status
      expect(csvContent).toContain('Yes'); // Boolean formatted
    });
  });

  describe('exportFinancialSummary', () => {
    const mockGoals: SavingsGoal[] = [
      {
        id: '1',
        name: 'Vacation',
        targetAmount: 5000,
        currentAmount: 2500,
        deadline: '2024-12-31',
        type: 'individual',
        workspace: 'personal',
      },
    ];

    const mockLoans: Loan[] = [
      {
        id: '1',
        lender: 'Bank',
        principal: 10000,
        remainingAmount: 8000,
        interestRate: 5,
        term: 12,
        startDate: '2024-01-01',
        status: 'active',
        workspace: 'personal',
      },
    ];

    it('should generate comprehensive financial summary', () => {
      exportFinancialSummary(
        mockTransactions,
        mockBills,
        mockGoals,
        mockLoans,
        { format: 'json', workspace: 'personal' }
      );

      const blobCall = (Blob as jest.Mock).mock.calls[0];
      const summaryData = JSON.parse(blobCall[0][0]);

      expect(summaryData.workspace).toBe('Personal');
      expect(summaryData.totalIncome).toBe('MK 200.00');
      expect(summaryData.totalExpenses).toBe('MK 100.00');
      expect(summaryData.netIncome).toBe('MK 100.00');
      expect(summaryData.categoryBreakdown).toBeDefined();
    });

    it('should calculate category breakdown correctly', () => {
      exportFinancialSummary(
        mockTransactions,
        mockBills,
        mockGoals,
        mockLoans,
        { format: 'json', workspace: 'personal' }
      );

      const blobCall = (Blob as jest.Mock).mock.calls[0];
      const summaryData = JSON.parse(blobCall[0][0]);

      expect(summaryData.categoryBreakdown.groceries.expense).toBe(100);
      expect(summaryData.categoryBreakdown.salary.income).toBe(200);
    });
  });

  describe('getExportFilename', () => {
    it('should generate filename with date', () => {
      const filename = getExportFilename('transactions', 'csv', 'personal');
      const today = new Date().toISOString().split('T')[0];
      
      expect(filename).toBe(`personal_transactions_${today}.csv`);
    });

    it('should generate filename without workspace', () => {
      const filename = getExportFilename('clients', 'json');
      const today = new Date().toISOString().split('T')[0];
      
      expect(filename).toBe(`clients_${today}.json`);
    });
  });

  describe('exportData', () => {
    it('should handle transactions export', async () => {
      await exportData('transactions', mockTransactions, { format: 'csv' });
      
      expect(Blob).toHaveBeenCalledWith(
        [expect.stringContaining('Date,Description')],
        { type: 'text/csv' }
      );
    });

    it('should handle financial summary export', async () => {
      const data = {
        transactions: mockTransactions,
        bills: mockBills,
        goals: [],
        loans: [],
      };

      await exportData('financial-summary', data, { format: 'json' });
      
      expect(Blob).toHaveBeenCalledWith(
        [expect.stringContaining('totalIncome')],
        { type: 'application/json' }
      );
    });

    it('should throw error for unsupported export type', async () => {
      await expect(
        exportData('unsupported' as any, {}, { format: 'csv' })
      ).rejects.toThrow('Unsupported export type: unsupported');
    });
  });
});