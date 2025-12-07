'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

// ============================================
// Initial Data
// ============================================

export const initialCategories: Omit<Category, 'icon'>[] = [
  // Personal Expense Categories
  { id: 'cat_1', name: 'Housing', color: '#2563eb', type: 'expense', workspace: 'personal', budget: 1200, budgetFrequency: 'monthly' },
  { id: 'cat_2', name: 'Transportation', color: '#ca8a04', type: 'expense', workspace: 'personal', budget: 300, budgetFrequency: 'monthly' },
  { id: 'cat_3', name: 'Food & Groceries', color: '#16a34a', type: 'expense', workspace: 'personal', budget: 400, budgetFrequency: 'monthly' },
  { id: 'cat_4', name: 'Utilities', color: '#9333ea', type: 'expense', workspace: 'personal', budget: 150, budgetFrequency: 'monthly' },
  { id: 'cat_5', name: 'Healthcare', color: '#dc2626', type: 'expense', workspace: 'personal', budget: 200, budgetFrequency: 'monthly' },
  { id: 'cat_6', name: 'Entertainment', color: '#db2777', type: 'expense', workspace: 'personal', budget: 100, budgetFrequency: 'monthly' },
  { id: 'cat_7', name: 'Personal Care', color: '#f97316', type: 'expense', workspace: 'personal', budget: 75, budgetFrequency: 'monthly' },
  
  // Personal Income Categories
  { id: 'cat_8', name: 'Salary', color: '#15803d', type: 'income', workspace: 'personal' },
  { id: 'cat_9', name: 'Freelance', color: '#0d9488', type: 'income', workspace: 'personal' },
  { id: 'cat_10', name: 'Investment', color: '#1d4ed8', type: 'income', workspace: 'personal' },

  // Business Expense Categories
  { id: 'cat_11', name: 'Office Supplies', color: '#4f46e5', type: 'expense', workspace: 'business', budget: 200, budgetFrequency: 'monthly' },
  { id: 'cat_12', name: 'Software & Tools', color: '#0891b2', type: 'expense', workspace: 'business', budget: 150, budgetFrequency: 'monthly' },
  { id: 'cat_13', name: 'Marketing', color: '#be185d', type: 'expense', workspace: 'business', budget: 500, budgetFrequency: 'monthly' },
  { id: 'cat_14', name: 'Travel', color: '#c2410c', type: 'expense', workspace: 'business', budget: 300, budgetFrequency: 'monthly' },
  { id: 'cat_15', name: 'Employee Salaries', color: '#b91c1c', type: 'expense', workspace: 'business', budget: 5000, budgetFrequency: 'monthly' },

  // Business Income Categories
  { id: 'cat_16', name: 'Product Sales', color: '#047857', type: 'income', workspace: 'business' },
  { id: 'cat_17', name: 'Service Fees', color: '#0e7490', type: 'income', workspace: 'business' },
  { id: 'cat_18', name: 'Consulting', color: '#312e81', type: 'income', workspace: 'business' },
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
}

// ============================================
// Store Implementation
// ============================================

export const useAppStore = create<AppState>()(
  persist(
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
      // Transactions
      // --------------------------------------------
      addTransaction: async (newTransaction) => {
        const category = get().categories.find(c => c.id === newTransaction.category_id);
        if (!category) throw new Error('Category not found');
        
        const transaction: Transaction = {
          id: `trans_${Date.now()}`,
          ...newTransaction,
          category: category.name,
        };
        
        set(state => ({ transactions: [transaction, ...state.transactions] }));
        await dbSync.syncTransaction(transaction, 'create');
      },

      updateTransaction: async (updatedTransaction) => {
        const category = get().categories.find(c => c.id === updatedTransaction.category_id);
        if (!category) throw new Error('Category not found');

        const transaction: Transaction = {
          ...updatedTransaction,
          category: category.name,
        };

        set(state => ({
          transactions: state.transactions.map(t => t.id === transaction.id ? transaction : t),
        }));
        await dbSync.syncTransaction(transaction, 'update');
      },

      deleteTransaction: async (id: string) => {
        const transactionToDelete = get().transactions.find(t => t.id === id);
        if (!transactionToDelete) return;
        
        set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
        await dbSync.syncTransaction(transactionToDelete, 'delete');
      },

      // --------------------------------------------
      // Bills
      // --------------------------------------------
      addBill: async (newBill) => {
        const bill: Bill = { id: `bill_${Date.now()}`, ...newBill };
        set(state => ({ bills: [bill, ...state.bills] }));
        await dbSync.syncBill(bill, 'create');
      },

      updateBill: async (updatedBill) => {
        set(state => ({ 
          bills: state.bills.map(b => b.id === updatedBill.id ? updatedBill : b)
        }));
        await dbSync.syncBill(updatedBill, 'update');
      },

      deleteBill: async (id: string) => {
        const billToDelete = get().bills.find(b => b.id === id);
        if (!billToDelete) return;
        set(state => ({ bills: state.bills.filter(b => b.id !== id) }));
        await dbSync.syncBill(billToDelete, 'delete');
      },

      // --------------------------------------------
      // Savings Goals
      // --------------------------------------------
      addSavingsGoal: async (newGoal) => {
        const goal: SavingsGoal = { id: `goal_${Date.now()}`, ...newGoal };
        set(state => ({ savingsGoals: [goal, ...state.savingsGoals] }));
        await dbSync.syncSavingsGoal(goal, 'create');
      },

      updateSavingsGoal: async (updatedGoal) => {
        set(state => ({ 
          savingsGoals: state.savingsGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
        }));
        await dbSync.syncSavingsGoal(updatedGoal, 'update');
      },

      deleteSavingsGoal: async (id: string) => {
        const goalToDelete = get().savingsGoals.find(g => g.id === id);
        if (!goalToDelete) return;
        set(state => ({ savingsGoals: state.savingsGoals.filter(g => g.id !== id) }));
        await dbSync.syncSavingsGoal(goalToDelete, 'delete');
      },

      // --------------------------------------------
      // Categories
      // --------------------------------------------
      addCategory: async (newCategory) => {
        // Note: Icon is handled server-side or a default is used
        const category: Category = { id: `cat_${Date.now()}`, ...newCategory, icon: 'folder' as unknown as LucideIcon };
        set(state => ({ categories: [category, ...state.categories] }));
        await dbSync.syncCategory(category, 'create');
      },

      updateCategory: async (updatedCategory) => {
        set(state => ({ 
          categories: state.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
        }));
        await dbSync.syncCategory(updatedCategory, 'update');
      },

      deleteCategory: async (id: string) => {
        const categoryToDelete = get().categories.find(c => c.id === id);
        if (!categoryToDelete) return;
        set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
        await dbSync.syncCategory(categoryToDelete, 'delete');
      },

      // --------------------------------------------
      // Clients
      // --------------------------------------------
      addClient: async (newClient) => {
        const client: Client = { id: `client_${Date.now()}`, ...newClient };
        set(state => ({ clients: [client, ...state.clients] }));
        await dbSync.syncClient(client, 'create');
      },

      updateClient: async (updatedClient) => {
        set(state => ({ 
          clients: state.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
        }));
        await dbSync.syncClient(updatedClient, 'update');
      },

      deleteClient: async (id: string) => {
        const clientToDelete = get().clients.find(c => c.id === id);
        if (!clientToDelete) return;
        set(state => ({ clients: state.clients.filter(c => c.id !== id) }));
        await dbSync.syncClient(clientToDelete, 'delete');
      },

      // --------------------------------------------
      // Products
      // --------------------------------------------
      addProduct: async (newProduct) => {
        const product: Product = { id: `prod_${Date.now()}`, ...newProduct };
        set(state => ({ products: [product, ...state.products] }));
        await dbSync.syncProduct(product, 'create');
      },

      updateProduct: async (updatedProduct) => {
        set(state => ({ 
          products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        }));
        await dbSync.syncProduct(updatedProduct, 'update');
      },

      deleteProduct: async (id: string) => {
        const productToDelete = get().products.find(p => p.id === id);
        if (!productToDelete) return;
        set(state => ({ products: state.products.filter(p => p.id !== id) }));
        await dbSync.syncProduct(productToDelete, 'delete');
      },

      // --------------------------------------------
      // Quotes
      // --------------------------------------------
      addQuote: async (newQuote) => {
        const quote: Quote = { id: `quote_${Date.now()}`, ...newQuote };
        set(state => ({ quotes: [quote, ...state.quotes] }));
        await dbSync.syncQuote(quote, 'create');
      },

      updateQuote: async (updatedQuote) => {
        set(state => ({ 
          quotes: state.quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q)
        }));
        await dbSync.syncQuote(updatedQuote, 'update');
      },

      deleteQuote: async (id: string) => {
        const quoteToDelete = get().quotes.find(q => q.id === id);
        if (!quoteToDelete) return;
        set(state => ({ quotes: state.quotes.filter(q => q.id !== id) }));
        await dbSync.syncQuote(quoteToDelete, 'delete');
      },

      // --------------------------------------------
      // Loans
      // --------------------------------------------
      addLoan: async (newLoan) => {
        const loan: Loan = { id: `loan_${Date.now()}`, ...newLoan };
        set(state => ({ loans: [loan, ...state.loans] }));
        await dbSync.syncLoan(loan, 'create');
      },

      updateLoan: async (updatedLoan) => {
        set(state => ({ 
          loans: state.loans.map(l => l.id === updatedLoan.id ? updatedLoan : l)
        }));
        await dbSync.syncLoan(updatedLoan, 'update');
      },

      deleteLoan: async (id: string) => {
        const loanToDelete = get().loans.find(l => l.id === id);
        if (!loanToDelete) return;
        set(state => ({ loans: state.loans.filter(l => l.id !== id) }));
        await dbSync.syncLoan(loanToDelete, 'delete');
      },
      
      // --------------------------------------------
      // Business Budgets
      // --------------------------------------------
      addBusinessBudget: async (newBudget) => {
        const budget: BusinessBudget = { id: `bb_${Date.now()}`, ...newBudget };
        set(state => ({ businessBudgets: [budget, ...state.businessBudgets] }));
        await dbSync.syncBusinessBudget(budget, 'create');
      },

      updateBusinessBudget: async (updatedBudget) => {
        set(state => ({ 
          businessBudgets: state.businessBudgets.map(b => b.id === updatedBudget.id ? updatedBudget : b)
        }));
        await dbSync.syncBusinessBudget(updatedBudget, 'update');
      },

      deleteBusinessBudget: async (id: string) => {
        const budgetToDelete = get().businessBudgets.find(b => b.id === id);
        if (!budgetToDelete) return;
        set(state => ({ businessBudgets: state.businessBudgets.filter(b => b.id !== id) }));
        await dbSync.syncBusinessBudget(budgetToDelete, 'delete');
      },

      // --------------------------------------------
      // Group Savings
      // --------------------------------------------
      addSavingsGroup: async (newGroup) => {
        const group: SavingsGroup = { id: `sg_${Date.now()}`, ...newGroup };
        set(state => ({ savingsGroups: [group, ...state.savingsGroups] }));
        await dbSync.syncSavingsGroup(group, 'create');
      },

      updateSavingsGroup: async (updatedGroup) => {
        set(state => ({ 
          savingsGroups: state.savingsGroups.map(g => g.id === updatedGroup.id ? updatedGroup : g)
        }));
        await dbSync.syncSavingsGroup(updatedGroup, 'update');
      },

      deleteSavingsGroup: async (id: string) => {
        const groupToDelete = get().savingsGroups.find(g => g.id === id);
        if (!groupToDelete) return;
        set(state => ({ savingsGroups: state.savingsGroups.filter(g => g.id !== id) }));
        await dbSync.syncSavingsGroup(groupToDelete, 'delete');
      },

      addGroupMember: async (newMember) => {
        const member: GroupMember = { id: `gm_${Date.now()}`, ...newMember };
        set(state => ({ groupMembers: [member, ...state.groupMembers] }));
        await dbSync.syncGroupMember(member, 'create');
      },

      updateGroupMember: async (updatedMember) => {
        set(state => ({ 
          groupMembers: state.groupMembers.map(m => m.id === updatedMember.id ? updatedMember : m)
        }));
        await dbSync.syncGroupMember(updatedMember, 'update');
      },

      deleteGroupMember: async (id: string) => {
        const memberToDelete = get().groupMembers.find(m => m.id === id);
        if (!memberToDelete) return;
        set(state => ({ groupMembers: state.groupMembers.filter(m => m.id !== id) }));
        await dbSync.syncGroupMember(memberToDelete, 'delete');
      },
      
      addGroupInvitation: async (newInvitation) => {
        const invitation: GroupInvitation = { id: `gi_${Date.now()}`, ...newInvitation };
        set(state => ({ groupInvitations: [invitation, ...state.groupInvitations] }));
        await dbSync.syncGroupInvitation(invitation, 'create');
      },

      updateGroupInvitation: async (updatedInvitation) => {
        set(state => ({ 
          groupInvitations: state.groupInvitations.map(i => i.id === updatedInvitation.id ? updatedInvitation : i)
        }));
        await dbSync.syncGroupInvitation(updatedInvitation, 'update');
      },

      deleteGroupInvitation: async (id: string) => {
        const invitationToDelete = get().groupInvitations.find(i => i.id === id);
        if (!invitationToDelete) return;
        set(state => ({ groupInvitations: state.groupInvitations.filter(i => i.id !== id) }));
        await dbSync.syncGroupInvitation(invitationToDelete, 'delete');
      },
      
      addGroupContribution: async (newContribution) => {
        const contribution: GroupContribution = { id: `gc_${Date.now()}`, ...newContribution };
        set(state => ({ groupContributions: [contribution, ...state.groupContributions] }));
        await dbSync.syncGroupContribution(contribution, 'create');
      },

      updateGroupContribution: async (updatedContribution) => {
        set(state => ({ 
          groupContributions: state.groupContributions.map(c => c.id === updatedContribution.id ? updatedContribution : c)
        }));
        await dbSync.syncGroupContribution(updatedContribution, 'update');
      },

      deleteGroupContribution: async (id: string) => {
        const contributionToDelete = get().groupContributions.find(c => c.id === id);
        if (!contributionToDelete) return;
        set(state => ({ groupContributions: state.groupContributions.filter(c => c.id !== id) }));
        await dbSync.syncGroupContribution(contributionToDelete, 'delete');
      },
      
      addGroupActivity: async (newActivity) => {
        const activity: GroupActivity = { id: `ga_${Date.now()}`, ...newActivity };
        set(state => ({ groupActivities: [activity, ...state.groupActivities] }));
        await dbSync.syncGroupActivity(activity, 'create');
      },
    }),
    {
      name: 'kwachalite-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist a subset of the state
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ![].includes(key))
        ) as Partial<AppState>,
    }
  )
);

// Expose store to the window for Supabase sync
if (typeof window !== 'undefined') {
  (window as any).__KWACHALITE_STORE__ = useAppStore.getState();
  useAppStore.subscribe(state => {
    (window as any).__KWACHALITE_STORE__ = state;
  });
}
