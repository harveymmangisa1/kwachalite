'use client';

import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
import { LucideIcon } from 'lucide-react';
import type {
  Transaction,
  Bill,
  SavingsGoal,
  Category,
  Client,
  Product,
  Quote,
  Loan,
  BusinessBudget,
  BusinessRevenue,
  BusinessExpense,
  SalesReceipt,
  DeliveryNote,
  SavingsGroup,
  GroupMember,
  GroupInvitation,
  GroupContribution,
  GroupActivity,
  Project,
  Invoice,
  ClientPayment,
  ClientExpense,
  CommunicationLog,
  TaskNote,
} from './types';
import { dbSync } from './supabase-sync';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

// ============================================
// Initial Data
// ============================================

export const initialCategories: Array<Omit<Category, 'id' | 'icon'>> = [
  // Personal Expense Categories
  { name: 'Housing', color: '#2563eb', type: 'expense', workspace: 'personal', budget: 1200, budgetFrequency: 'monthly' },
  { name: 'Transportation', color: '#ca8a04', type: 'expense', workspace: 'personal', budget: 300, budgetFrequency: 'monthly' },
  { name: 'Food & Groceries', color: '#16a34a', type: 'expense', workspace: 'personal', budget: 400, budgetFrequency: 'monthly' },
  { name: 'Utilities', color: '#9333ea', type: 'expense', workspace: 'personal', budget: 150, budgetFrequency: 'monthly' },
  { name: 'Healthcare', color: '#dc2626', type: 'expense', workspace: 'personal', budget: 200, budgetFrequency: 'monthly' },
  { name: 'Entertainment', color: '#db2777', type: 'expense', workspace: 'personal', budget: 100, budgetFrequency: 'monthly' },
  { name: 'Personal Care', color: '#f97316', type: 'expense', workspace: 'personal', budget: 75, budgetFrequency: 'monthly' },
  
  // Personal Income Categories
  { name: 'Salary', color: '#15803d', type: 'income', workspace: 'personal' },
  { name: 'Freelance', color: '#0d9488', type: 'income', workspace: 'personal' },
  { name: 'Investment', color: '#1d4ed8', type: 'income', workspace: 'personal' },

  // Business Expense Categories
  { name: 'Office Supplies', color: '#4f46e5', type: 'expense', workspace: 'business', budget: 200, budgetFrequency: 'monthly' },
  { name: 'Software & Tools', color: '#0891b2', type: 'expense', workspace: 'business', budget: 150, budgetFrequency: 'monthly' },
  { name: 'Marketing', color: '#be185d', type: 'expense', workspace: 'business', budget: 500, budgetFrequency: 'monthly' },
  { name: 'Travel', color: '#c2410c', type: 'expense', workspace: 'business', budget: 300, budgetFrequency: 'monthly' },
  { name: 'Employee Salaries', color: '#b91c1c', type: 'expense', workspace: 'business', budget: 5000, budgetFrequency: 'monthly' },

  // Business Income Categories
  { name: 'Product Sales', color: '#047857', type: 'income', workspace: 'business' },
  { name: 'Service Fees', color: '#0e7490', type: 'income', workspace: 'business' },
  { name: 'Consulting', color: '#312e81', type: 'income', workspace: 'business' },
];


// ============================================
// Store Interface
// ============================================

interface AppState {
  transactions: Transaction[];
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  clients: Client[];
  products: Product[];
  quotes: Quote[];
  loans: Loan[];
  categories: Category[];
  salesReceipts: SalesReceipt[];
  deliveryNotes: DeliveryNote[];
  businessBudgets: BusinessBudget[];
  businessRevenues: BusinessRevenue[];
  businessExpenses: BusinessExpense[];
  // Group Savings
  savingsGroups: SavingsGroup[];
  groupMembers: GroupMember[];
  groupInvitations: GroupInvitation[];
  groupContributions: GroupContribution[];
  groupActivities: GroupActivity[];
  // CRM Properties
  projects: Project[];
  invoices: Invoice[];
  payments: ClientPayment[];
  expenses: ClientExpense[];
  communications: CommunicationLog[];
  tasks: TaskNote[];
  isLoading: boolean;
  
  // Methods
  setSyncData: (key: string, data: any[]) => void;

  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id' | 'category'> & { category_id: string }) => Promise<void>;
  updateTransaction: (transaction: Omit<Transaction, 'category'> & { category_id: string }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Bill methods
  addBill: (bill: Omit<Bill, 'id'>) => Promise<void>;
  updateBill: (bill: Bill) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;

  // Savings Goal methods
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  // Category methods
  addCategory: (category: Omit<Category, 'id' | 'icon'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Client methods
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Product methods
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Quote methods
  addQuote: (quote: Omit<Quote, 'id'>) => Promise<void>;
  updateQuote: (quote: Quote) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;

  // Loan methods
  addLoan: (loan: Omit<Loan, 'id'>) => Promise<void>;
  updateLoan: (loan: Loan) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;

  // Business Budget methods
  addBusinessBudget: (budget: Omit<BusinessBudget, 'id'>) => Promise<void>;
  updateBusinessBudget: (budget: BusinessBudget) => Promise<void>;
  deleteBusinessBudget: (id: string) => Promise<void>;
  
  // Group Savings methods
  addSavingsGroup: (group: Omit<SavingsGroup, 'id'>) => Promise<void>;
  updateSavingsGroup: (group: SavingsGroup) => Promise<void>;
  deleteSavingsGroup: (id: string) => Promise<void>;

  addGroupMember: (member: Omit<GroupMember, 'id'>) => Promise<void>;
  updateGroupMember: (member: GroupMember) => Promise<void>;
  deleteGroupMember: (id: string) => Promise<void>;

  addGroupInvitation: (invitation: Omit<GroupInvitation, 'id'>) => Promise<void>;
  updateGroupInvitation: (invitation: GroupInvitation) => Promise<void>;
  deleteGroupInvitation: (id: string) => Promise<void>;

  addGroupContribution: (contribution: Omit<GroupContribution, 'id'>) => Promise<void>;
  updateGroupContribution: (contribution: GroupContribution) => Promise<void>;
  deleteGroupContribution: (id: string) => Promise<void>;

  addGroupActivity: (activity: Omit<GroupActivity, 'id'>) => Promise<void>;
  updateGroupActivity: (activity: GroupActivity) => Promise<void>;
  deleteGroupActivity: (id: string) => Promise<void>;

  // Project methods
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Invoice methods
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  // Client Payment methods
  addClientPayment: (payment: Omit<ClientPayment, 'id'>) => Promise<void>;
  updateClientPayment: (payment: ClientPayment) => Promise<void>;
  deleteClientPayment: (id: string) => Promise<void>;

  // Client Expense methods
  addClientExpense: (expense: Omit<ClientExpense, 'id'>) => Promise<void>;
  updateClientExpense: (expense: ClientExpense) => Promise<void>;
  deleteClientExpense: (id: string) => Promise<void>;

  // Communication Log methods
  addCommunicationLog: (log: Omit<CommunicationLog, 'id'>) => Promise<void>;
  updateCommunicationLog: (log: CommunicationLog) => Promise<void>;
  deleteCommunicationLog: (id: string) => Promise<void>;

  // Task Note methods
  addTaskNote: (task: Omit<TaskNote, 'id'>) => Promise<void>;
  updateTaskNote: (task: TaskNote) => Promise<void>;
  deleteTaskNote: (id: string) => Promise<void>;
}

// ============================================
// Store Implementation - Supabase-First Architecture
// ============================================

export const useAppStore = create<AppState>()(
  (set, get) => ({
      // ============================================
      // Initial State
      // ============================================
      transactions: [],
      bills: [],
      savingsGoals: [],
      clients: [],
      products: [],
      quotes: [],
      loans: [],
      categories: [],
      salesReceipts: [],
      deliveryNotes: [],
      businessBudgets: [],
      businessRevenues: [],
      businessExpenses: [],
      savingsGroups: [],
      groupMembers: [],
      groupInvitations: [],
      groupContributions: [],
      groupActivities: [],
      projects: [],
      invoices: [],
      payments: [],
      expenses: [],
      communications: [],
      tasks: [],
      isLoading: true,

      // ============================================
      // Methods
      // ============================================

      setSyncData: (key: string, data: any[]) => {
        set({ [key as keyof AppState]: data, isLoading: false } as Partial<AppState>);
      },

      // --------------------------------------------
      // Transactions - Supabase First
      // --------------------------------------------
      addTransaction: async (newTransaction) => {
        const category = get().categories.find(c => c.id === newTransaction.category_id);
        if (!category) throw new Error('Category not found');
        
        const transaction: Transaction = {
          id: generateId(),
          ...newTransaction,
          category: category.name,
        };
        
        // Sync to Supabase FIRST, then update local state
        try {
          await dbSync.syncTransaction(transaction, 'create');
          set(state => ({ transactions: [transaction, ...state.transactions] }));
        } catch (error) {
          console.error('Failed to sync transaction to Supabase:', error);
          throw error; // Propagate error to handle in UI
        }
      },

      updateTransaction: async (updatedTransaction) => {
        const category = get().categories.find(c => c.id === updatedTransaction.category_id);
        if (!category) throw new Error('Category not found');

        const transaction: Transaction = {
          ...updatedTransaction,
          category: category.name,
        };

        // Sync to Supabase FIRST, then update local state
        try {
          await dbSync.syncTransaction(transaction, 'update');
          set(state => ({
            transactions: state.transactions.map(t => t.id === transaction.id ? transaction : t),
          }));
        } catch (error) {
          console.error('Failed to update transaction in Supabase:', error);
          throw error;
        }
      },

      deleteTransaction: async (id: string) => {
        const transactionToDelete = get().transactions.find(t => t.id === id);
        if (!transactionToDelete) return;
        
        // Sync to Supabase FIRST, then update local state
        try {
          await dbSync.syncTransaction(transactionToDelete, 'delete');
          set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
        } catch (error) {
          console.error('Failed to delete transaction from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Bills - Supabase First
      // --------------------------------------------
      addBill: async (newBill) => {
        const bill: Bill = { id: generateId(), ...newBill };
        try {
          await dbSync.syncBill(bill, 'create');
          set(state => ({ bills: [bill, ...state.bills] }));
        } catch (error) {
          console.error('Failed to sync bill to Supabase:', error);
          throw error;
        }
      },

      updateBill: async (updatedBill) => {
        try {
          await dbSync.syncBill(updatedBill, 'update');
          set(state => ({ 
            bills: state.bills.map(b => b.id === updatedBill.id ? updatedBill : b)
          }));
        } catch (error) {
          console.error('Failed to update bill in Supabase:', error);
          throw error;
        }
      },

      deleteBill: async (id: string) => {
        const billToDelete = get().bills.find(b => b.id === id);
        if (!billToDelete) return;
        try {
          await dbSync.syncBill(billToDelete, 'delete');
          set(state => ({ bills: state.bills.filter(b => b.id !== id) }));
        } catch (error) {
          console.error('Failed to delete bill from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Savings Goals - Supabase First
      // --------------------------------------------
      addSavingsGoal: async (newGoal) => {
        const goal: SavingsGoal = { id: generateId(), ...newGoal };
        try {
          await dbSync.syncSavingsGoal(goal, 'create');
          set(state => ({ savingsGoals: [goal, ...state.savingsGoals] }));
        } catch (error) {
          console.error('Failed to sync savings goal to Supabase:', error);
          throw error;
        }
      },

      updateSavingsGoal: async (updatedGoal) => {
        try {
          await dbSync.syncSavingsGoal(updatedGoal, 'update');
          set(state => ({ 
            savingsGoals: state.savingsGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
          }));
        } catch (error) {
          console.error('Failed to update savings goal in Supabase:', error);
          throw error;
        }
      },

      deleteSavingsGoal: async (id: string) => {
        const goalToDelete = get().savingsGoals.find(g => g.id === id);
        if (!goalToDelete) return;
        try {
          await dbSync.syncSavingsGoal(goalToDelete, 'delete');
          set(state => ({ savingsGoals: state.savingsGoals.filter(g => g.id !== id) }));
        } catch (error) {
          console.error('Failed to delete savings goal from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Categories - Supabase First
      // --------------------------------------------
      addCategory: async (newCategory) => {
        const category: Category = { id: generateId(), ...newCategory, icon: 'Folder' as unknown as LucideIcon };
        try {
          await dbSync.syncCategory(category, 'create');
          set(state => ({ categories: [category, ...state.categories] }));
        } catch (error) {
          console.error('Failed to sync category to Supabase:', error);
          throw error;
        }
      },

      updateCategory: async (updatedCategory) => {
        try {
          await dbSync.syncCategory(updatedCategory, 'update');
          set(state => ({ 
            categories: state.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
          }));
        } catch (error) {
          console.error('Failed to update category in Supabase:', error);
          throw error;
        }
      },

      deleteCategory: async (id: string) => {
        const categoryToDelete = get().categories.find(c => c.id === id);
        if (!categoryToDelete) return;
        try {
          await dbSync.syncCategory(categoryToDelete, 'delete');
          set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
        } catch (error) {
          console.error('Failed to delete category from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Clients - Supabase First
      // --------------------------------------------
      addClient: async (newClient) => {
        const client: Client = { id: generateId(), ...newClient };
        try {
          await dbSync.syncClient(client, 'create');
          set(state => ({ clients: [client, ...state.clients] }));
        } catch (error) {
          console.error('Failed to sync client to Supabase:', error);
          throw error;
        }
      },

      updateClient: async (updatedClient) => {
        try {
          await dbSync.syncClient(updatedClient, 'update');
          set(state => ({ 
            clients: state.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
          }));
        } catch (error) {
          console.error('Failed to update client in Supabase:', error);
          throw error;
        }
      },

      deleteClient: async (id: string) => {
        const clientToDelete = get().clients.find(c => c.id === id);
        if (!clientToDelete) return;
        try {
          await dbSync.syncClient(clientToDelete, 'delete');
          set(state => ({ clients: state.clients.filter(c => c.id !== id) }));
        } catch (error) {
          console.error('Failed to delete client from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Products - Supabase First
      // --------------------------------------------
      addProduct: async (newProduct) => {
        const product: Product = { id: generateId(), ...newProduct };
        try {
          await dbSync.syncProduct(product, 'create');
          set(state => ({ products: [product, ...state.products] }));
        } catch (error) {
          console.error('Failed to sync product to Supabase:', error);
          throw error;
        }
      },

      updateProduct: async (updatedProduct) => {
        try {
          await dbSync.syncProduct(updatedProduct, 'update');
          set(state => ({ 
            products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
          }));
        } catch (error) {
          console.error('Failed to update product in Supabase:', error);
          throw error;
        }
      },

      deleteProduct: async (id: string) => {
        const productToDelete = get().products.find(p => p.id === id);
        if (!productToDelete) return;
        try {
          await dbSync.syncProduct(productToDelete, 'delete');
          set(state => ({ products: state.products.filter(p => p.id !== id) }));
        } catch (error) {
          console.error('Failed to delete product from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Quotes - Supabase First
      // --------------------------------------------
      addQuote: async (newQuote) => {
        const quote: Quote = { id: generateId(), ...newQuote };
        try {
          await dbSync.syncQuote(quote, 'create');
          set(state => ({ quotes: [quote, ...state.quotes] }));
        } catch (error) {
          console.error('Failed to sync quote to Supabase:', error);
          throw error;
        }
      },

      updateQuote: async (updatedQuote) => {
        try {
          await dbSync.syncQuote(updatedQuote, 'update');
          set(state => ({ 
            quotes: state.quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q)
          }));
        } catch (error) {
          console.error('Failed to update quote in Supabase:', error);
          throw error;
        }
      },

      deleteQuote: async (id: string) => {
        const quoteToDelete = get().quotes.find(q => q.id === id);
        if (!quoteToDelete) return;
        try {
          await dbSync.syncQuote(quoteToDelete, 'delete');
          set(state => ({ quotes: state.quotes.filter(q => q.id !== id) }));
        } catch (error) {
          console.error('Failed to delete quote from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Loans - Supabase First
      // --------------------------------------------
      addLoan: async (newLoan) => {
        const loan: Loan = { id: generateId(), ...newLoan };
        try {
          await dbSync.syncLoan(loan, 'create');
          set(state => ({ loans: [loan, ...state.loans] }));
        } catch (error) {
          console.error('Failed to sync loan to Supabase:', error);
          throw error;
        }
      },

      updateLoan: async (updatedLoan) => {
        try {
          await dbSync.syncLoan(updatedLoan, 'update');
          set(state => ({ 
            loans: state.loans.map(l => l.id === updatedLoan.id ? updatedLoan : l)
          }));
        } catch (error) {
          console.error('Failed to update loan in Supabase:', error);
          throw error;
        }
      },

      deleteLoan: async (id: string) => {
        const loanToDelete = get().loans.find(l => l.id === id);
        if (!loanToDelete) return;
        try {
          await dbSync.syncLoan(loanToDelete, 'delete');
          set(state => ({ loans: state.loans.filter(l => l.id !== id) }));
        } catch (error) {
          console.error('Failed to delete loan from Supabase:', error);
          throw error;
        }
      },
      
      // --------------------------------------------
      // Business Budgets - Supabase First
      // --------------------------------------------
      addBusinessBudget: async (newBudget) => {
        const budget: BusinessBudget = { id: generateId(), ...newBudget };
        try {
          await dbSync.syncBusinessBudget(budget, 'create');
          set(state => ({ businessBudgets: [budget, ...state.businessBudgets] }));
        } catch (error) {
          console.error('Failed to sync business budget to Supabase:', error);
          throw error;
        }
      },

      updateBusinessBudget: async (updatedBudget) => {
        try {
          await dbSync.syncBusinessBudget(updatedBudget, 'update');
          set(state => ({ 
            businessBudgets: state.businessBudgets.map(b => b.id === updatedBudget.id ? updatedBudget : b)
          }));
        } catch (error) {
          console.error('Failed to update business budget in Supabase:', error);
          throw error;
        }
      },

      deleteBusinessBudget: async (id: string) => {
        const budgetToDelete = get().businessBudgets.find(b => b.id === id);
        if (!budgetToDelete) return;
        try {
          await dbSync.syncBusinessBudget(budgetToDelete, 'delete');
          set(state => ({ businessBudgets: state.businessBudgets.filter(b => b.id !== id) }));
        } catch (error) {
          console.error('Failed to delete business budget from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Group Savings - Supabase First
      // --------------------------------------------
      addSavingsGroup: async (newGroup) => {
        const group: SavingsGroup = { id: generateId(), ...newGroup };
        try {
          await dbSync.syncSavingsGroup(group, 'create');
          set(state => ({ savingsGroups: [group, ...state.savingsGroups] }));
        } catch (error) {
          console.error('Failed to sync savings group to Supabase:', error);
          throw error;
        }
      },

      updateSavingsGroup: async (updatedGroup) => {
        try {
          await dbSync.syncSavingsGroup(updatedGroup, 'update');
          set(state => ({ 
            savingsGroups: state.savingsGroups.map(g => g.id === updatedGroup.id ? updatedGroup : g)
          }));
        } catch (error) {
          console.error('Failed to update savings group in Supabase:', error);
          throw error;
        }
      },

      deleteSavingsGroup: async (id: string) => {
        const groupToDelete = get().savingsGroups.find(g => g.id === id);
        if (!groupToDelete) return;
        try {
          await dbSync.syncSavingsGroup(groupToDelete, 'delete');
          set(state => ({ savingsGroups: state.savingsGroups.filter(g => g.id !== id) }));
        } catch (error) {
          console.error('Failed to delete savings group from Supabase:', error);
          throw error;
        }
      },

      addGroupMember: async (newMember) => {
        const member: GroupMember = { id: generateId(), ...newMember };
        try {
          await dbSync.syncGroupMember(member, 'create');
          set(state => ({ groupMembers: [member, ...state.groupMembers] }));
        } catch (error) {
          console.error('Failed to sync group member to Supabase:', error);
          throw error;
        }
      },

      updateGroupMember: async (updatedMember) => {
        try {
          await dbSync.syncGroupMember(updatedMember, 'update');
          set(state => ({ 
            groupMembers: state.groupMembers.map(m => m.id === updatedMember.id ? updatedMember : m)
          }));
        } catch (error) {
          console.error('Failed to update group member in Supabase:', error);
          throw error;
        }
      },

      deleteGroupMember: async (id: string) => {
        const memberToDelete = get().groupMembers.find(m => m.id === id);
        if (!memberToDelete) return;
        try {
          await dbSync.syncGroupMember(memberToDelete, 'delete');
          set(state => ({ groupMembers: state.groupMembers.filter(m => m.id !== id) }));
        } catch (error) {
          console.error('Failed to delete group member from Supabase:', error);
          throw error;
        }
      },
      
      addGroupInvitation: async (newInvitation) => {
        const invitation: GroupInvitation = { id: generateId(), ...newInvitation };
        try {
          await dbSync.syncGroupInvitation(invitation, 'create');
          set(state => ({ groupInvitations: [invitation, ...state.groupInvitations] }));
        } catch (error) {
          console.error('Failed to sync group invitation to Supabase:', error);
          throw error;
        }
      },

      updateGroupInvitation: async (updatedInvitation) => {
        try {
          await dbSync.syncGroupInvitation(updatedInvitation, 'update');
          set(state => ({ 
            groupInvitations: state.groupInvitations.map(i => i.id === updatedInvitation.id ? updatedInvitation : i)
          }));
        } catch (error) {
          console.error('Failed to update group invitation in Supabase:', error);
          throw error;
        }
      },

      deleteGroupInvitation: async (id: string) => {
        const invitationToDelete = get().groupInvitations.find(i => i.id === id);
        if (!invitationToDelete) return;
        try {
          await dbSync.syncGroupInvitation(invitationToDelete, 'delete');
          set(state => ({ groupInvitations: state.groupInvitations.filter(i => i.id !== id) }));
        } catch (error) {
          console.error('Failed to delete group invitation from Supabase:', error);
          throw error;
        }
      },
      
      addGroupContribution: async (newContribution) => {
        const contribution: GroupContribution = { id: generateId(), ...newContribution };
        try {
          await dbSync.syncGroupContribution(contribution, 'create');
          set(state => ({ groupContributions: [contribution, ...state.groupContributions] }));
        } catch (error) {
          console.error('Failed to sync group contribution to Supabase:', error);
          throw error;
        }
      },

      updateGroupContribution: async (updatedContribution) => {
        try {
          await dbSync.syncGroupContribution(updatedContribution, 'update');
          set(state => ({ 
            groupContributions: state.groupContributions.map(c => c.id === updatedContribution.id ? updatedContribution : c)
          }));
        } catch (error) {
          console.error('Failed to update group contribution in Supabase:', error);
          throw error;
        }
      },

      deleteGroupContribution: async (id: string) => {
        const contributionToDelete = get().groupContributions.find(c => c.id === id);
        if (!contributionToDelete) return;
        try {
          await dbSync.syncGroupContribution(contributionToDelete, 'delete');
          set(state => ({ groupContributions: state.groupContributions.filter(c => c.id !== id) }));
        } catch (error) {
          console.error('Failed to delete group contribution from Supabase:', error);
          throw error;
        }
      },
      
      addGroupActivity: async (newActivity) => {
        const activity: GroupActivity = { id: generateId(), ...newActivity };
        try {
          await dbSync.syncGroupActivity(activity, 'create');
          set(state => ({ groupActivities: [activity, ...state.groupActivities] }));
        } catch (error) {
          console.error('Failed to sync group activity to Supabase:', error);
          throw error;
        }
      },

      updateGroupActivity: async (updatedActivity: GroupActivity) => {
        try {
          await dbSync.syncGroupActivity(updatedActivity, 'update');
          set(state => ({ 
            groupActivities: state.groupActivities.map(a => a.id === updatedActivity.id ? updatedActivity : a)
          }));
        } catch (error) {
          console.error('Failed to update group activity in Supabase:', error);
          throw error;
        }
      },

      deleteGroupActivity: async (id: string) => {
        const activityToDelete = get().groupActivities.find(a => a.id === id);
        if (!activityToDelete) return;
        try {
          await dbSync.syncGroupActivity(activityToDelete, 'delete');
          set(state => ({ groupActivities: state.groupActivities.filter(a => a.id !== id) }));
        } catch (error) {
          console.error('Failed to delete group activity from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Projects - Supabase First
      // --------------------------------------------
      addProject: async (newProject: Omit<Project, 'id'>) => {
        const project: Project = { id: generateId(), ...newProject };
        try {
          await dbSync.syncProject(project, 'create');
          set(state => ({ projects: [project, ...state.projects] }));
        } catch (error) {
          console.error('Failed to sync project to Supabase:', error);
          throw error;
        }
      },

      updateProject: async (updatedProject: Project) => {
        try {
          await dbSync.syncProject(updatedProject, 'update');
          set(state => ({ 
            projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
          }));
        } catch (error) {
          console.error('Failed to update project in Supabase:', error);
          throw error;
        }
      },

      deleteProject: async (id: string) => {
        const projectToDelete = get().projects.find(p => p.id === id);
        if (!projectToDelete) return;
        try {
          await dbSync.syncProject(projectToDelete, 'delete');
          set(state => ({ projects: state.projects.filter(p => p.id !== id) }));
        } catch (error) {
          console.error('Failed to delete project from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Invoices - Supabase First
      // --------------------------------------------
      addInvoice: async (newInvoice: Omit<Invoice, 'id'>) => {
        const invoice: Invoice = { id: generateId(), ...newInvoice };
        try {
          await dbSync.syncInvoice(invoice, 'create');
          set(state => ({ invoices: [invoice, ...state.invoices] }));
        } catch (error) {
          console.error('Failed to sync invoice to Supabase:', error);
          throw error;
        }
      },

      updateInvoice: async (updatedInvoice: Invoice) => {
        try {
          await dbSync.syncInvoice(updatedInvoice, 'update');
          set(state => ({ 
            invoices: state.invoices.map(i => i.id === updatedInvoice.id ? updatedInvoice : i)
          }));
        } catch (error) {
          console.error('Failed to update invoice in Supabase:', error);
          throw error;
        }
      },

      deleteInvoice: async (id: string) => {
        const invoiceToDelete = get().invoices.find(i => i.id === id);
        if (!invoiceToDelete) return;
        try {
          await dbSync.syncInvoice(invoiceToDelete, 'delete');
          set(state => ({ invoices: state.invoices.filter(i => i.id !== id) }));
        } catch (error) {
          console.error('Failed to delete invoice from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Client Payments - Supabase First
      // --------------------------------------------
      addClientPayment: async (newPayment: Omit<ClientPayment, 'id'>) => {
        const payment: ClientPayment = { id: generateId(), ...newPayment };
        try {
          await dbSync.syncClientPayment(payment, 'create');
          set(state => ({ payments: [payment, ...state.payments] }));
        } catch (error) {
          console.error('Failed to sync client payment to Supabase:', error);
          throw error;
        }
      },

      updateClientPayment: async (updatedPayment: ClientPayment) => {
        try {
          await dbSync.syncClientPayment(updatedPayment, 'update');
          set(state => ({ 
            payments: state.payments.map(p => p.id === updatedPayment.id ? updatedPayment : p)
          }));
        } catch (error) {
          console.error('Failed to update client payment in Supabase:', error);
          throw error;
        }
      },

      deleteClientPayment: async (id: string) => {
        const paymentToDelete = get().payments.find(p => p.id === id);
        if (!paymentToDelete) return;
        try {
          await dbSync.syncClientPayment(paymentToDelete, 'delete');
          set(state => ({ payments: state.payments.filter(p => p.id !== id) }));
        } catch (error) {
          console.error('Failed to delete client payment from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Client Expenses - Supabase First
      // --------------------------------------------
      addClientExpense: async (newExpense: Omit<ClientExpense, 'id'>) => {
        const expense: ClientExpense = { id: generateId(), ...newExpense };
        try {
          await dbSync.syncClientExpense(expense, 'create');
          set(state => ({ expenses: [expense, ...state.expenses] }));
        } catch (error) {
          console.error('Failed to sync client expense to Supabase:', error);
          throw error;
        }
      },

      updateClientExpense: async (updatedExpense: ClientExpense) => {
        try {
          await dbSync.syncClientExpense(updatedExpense, 'update');
          set(state => ({ 
            expenses: state.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
          }));
        } catch (error) {
          console.error('Failed to update client expense in Supabase:', error);
          throw error;
        }
      },

      deleteClientExpense: async (id: string) => {
        const expenseToDelete = get().expenses.find(e => e.id === id);
        if (!expenseToDelete) return;
        try {
          await dbSync.syncClientExpense(expenseToDelete, 'delete');
          set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
        } catch (error) {
          console.error('Failed to delete client expense from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Communication Logs - Supabase First
      // --------------------------------------------
      addCommunicationLog: async (newLog: Omit<CommunicationLog, 'id'>) => {
        const log: CommunicationLog = { id: generateId(), ...newLog };
        try {
          await dbSync.syncCommunicationLog(log, 'create');
          set(state => ({ communications: [log, ...state.communications] }));
        } catch (error) {
          console.error('Failed to sync communication log to Supabase:', error);
          throw error;
        }
      },

      updateCommunicationLog: async (updatedLog: CommunicationLog) => {
        try {
          await dbSync.syncCommunicationLog(updatedLog, 'update');
          set(state => ({ 
            communications: state.communications.map(c => c.id === updatedLog.id ? updatedLog : c)
          }));
        } catch (error) {
          console.error('Failed to update communication log in Supabase:', error);
          throw error;
        }
      },

      deleteCommunicationLog: async (id: string) => {
        const logToDelete = get().communications.find(c => c.id === id);
        if (!logToDelete) return;
        try {
          await dbSync.syncCommunicationLog(logToDelete, 'delete');
          set(state => ({ communications: state.communications.filter(c => c.id !== id) }));
        } catch (error) {
          console.error('Failed to delete communication log from Supabase:', error);
          throw error;
        }
      },

      // --------------------------------------------
      // Task Notes - Supabase First
      // --------------------------------------------
      addTaskNote: async (newTask: Omit<TaskNote, 'id'>) => {
        const task: TaskNote = { id: generateId(), ...newTask };
        try {
          await dbSync.syncTaskNote(task, 'create');
          set(state => ({ tasks: [task, ...state.tasks] }));
        } catch (error) {
          console.error('Failed to sync task note to Supabase:', error);
          throw error;
        }
      },

      updateTaskNote: async (updatedTask: TaskNote) => {
        try {
          await dbSync.syncTaskNote(updatedTask, 'update');
          set(state => ({ 
            tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
          }));
        } catch (error) {
          console.error('Failed to update task note in Supabase:', error);
          throw error;
        }
      },

      deleteTaskNote: async (id: string) => {
        const taskToDelete = get().tasks.find(t => t.id === id);
        if (!taskToDelete) return;
        try {
          await dbSync.syncTaskNote(taskToDelete, 'delete');
          set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
        } catch (error) {
          console.error('Failed to delete task note from Supabase:', error);
          throw error;
        }
      },
    })
);

// Expose store to window for Supabase sync
if (typeof window !== 'undefined') {
  (window as any).__KWACHALITE_STORE__ = useAppStore.getState();
  useAppStore.subscribe(state => {
    (window as any).__KWACHALITE_STORE__ = state;
  });
}