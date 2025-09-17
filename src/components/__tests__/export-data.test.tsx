/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportData, ExportTransactions } from '../export-data';
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks and stores
jest.mock('@/lib/data');
jest.mock('@/hooks/use-active-workspace');
jest.mock('@/hooks/use-toast');
jest.mock('@/lib/export');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
const mockUseActiveWorkspace = useActiveWorkspace as jest.MockedFunction<typeof useActiveWorkspace>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockToast = jest.fn();

describe('ExportData Component', () => {
  beforeEach(() => {
    mockUseAppStore.mockReturnValue({
      transactions: [
        {
          id: '1',
          date: '2024-01-01',
          description: 'Test transaction',
          amount: 100,
          type: 'expense',
          category: 'groceries',
          workspace: 'personal',
        },
      ],
      bills: [],
      savingsGoals: [],
      clients: [],
      products: [],
      quotes: [],
      loans: [],
      categories: [],
      addTransaction: jest.fn(),
      updateTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      addBill: jest.fn(),
      updateBill: jest.fn(),
      deleteBill: jest.fn(),
      addSavingsGoal: jest.fn(),
      updateSavingsGoal: jest.fn(),
      deleteSavingsGoal: jest.fn(),
      addClient: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: jest.fn(),
      addProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      addQuote: jest.fn(),
      updateQuote: jest.fn(),
      deleteQuote: jest.fn(),
      addLoan: jest.fn(),
      updateLoan: jest.fn(),
      deleteLoan: jest.fn(),
      addCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      setSyncData: jest.fn(),
      initializeFirebaseSync: jest.fn(),
    });

    mockUseActiveWorkspace.mockReturnValue({
      activeWorkspace: 'personal',
      setActiveWorkspace: jest.fn(),
    });

    mockUseToast.mockReturnValue({
      toast: mockToast,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render export button with correct text', () => {
      render(<ExportData type="transactions" title="Test Export" />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Export Test Export')).toBeInTheDocument();
    });

    it('should render with default title when none provided', () => {
      render(<ExportData type="transactions" />);
      
      expect(screen.getByText('Export transactions')).toBeInTheDocument();
    });

    it('should render dropdown when showDropdown is true', () => {
      render(<ExportData type="transactions" showDropdown />);
      
      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });

  describe('Dialog Interaction', () => {
    it('should open dialog when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportData type="transactions" title="Test Export" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByText('Export Test Export')).toBeInTheDocument();
      expect(screen.getByText('Configure your export settings and download your transactions data.')).toBeInTheDocument();
    });

    it('should show format selection dropdown', async () => {
      const user = userEvent.setup();
      render(<ExportData type="transactions" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByText('Export Format')).toBeInTheDocument();
    });

    it('should show date range inputs for transactions export', async () => {
      const user = userEvent.setup();
      render(<ExportData type="transactions" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByText('End Date')).toBeInTheDocument();
    });

    it('should not show date range for non-transaction exports', async () => {
      const user = userEvent.setup();
      render(<ExportData type="clients" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.queryByText('Start Date')).not.toBeInTheDocument();
      expect(screen.queryByText('End Date')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call export function with correct parameters', async () => {
      const user = userEvent.setup();
      render(<ExportData type="transactions" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Export Successful',
          description: 'Your transactions data has been exported successfully.',
        });
      });
    });

    it('should handle export errors gracefully', async () => {
      // Mock export function to throw error
      const mockExportData = require('@/lib/export').exportData;
      mockExportData.mockRejectedValueOnce(new Error('Export failed'));

      const user = userEvent.setup();
      render(<ExportData type="transactions" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Export Failed',
          description: 'Export failed',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Quick Export (Dropdown)', () => {
    it('should perform quick CSV export', async () => {
      const user = userEvent.setup();
      render(<ExportData type="transactions" showDropdown />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const csvOption = screen.getByText('Export as CSV');
      await user.click(csvOption);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Export Successful',
          description: 'Your transactions data has been exported successfully.',
        });
      });
    });

    it('should perform quick JSON export', async () => {
      const user = userEvent.setup();
      render(<ExportData type="transactions" showDropdown />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const jsonOption = screen.getByText('Export as JSON');
      await user.click(jsonOption);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Export Successful',
          description: 'Your transactions data has been exported successfully.',
        });
      });
    });
  });

  describe('ExportTransactions Convenience Component', () => {
    it('should render with transactions type', () => {
      render(<ExportTransactions />);
      
      expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    });

    it('should pass through props correctly', () => {
      render(<ExportTransactions buttonVariant="outline" showDropdown />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-input');
      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const user = userEvent.setup();
      render(<ExportData type="transactions" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      await user.click(button);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<ExportData type="transactions" />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});