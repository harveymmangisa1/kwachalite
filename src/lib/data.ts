import { create } from 'zustand';
import { supabaseSync } from './supabase-sync';
import { appConfig } from './config';
import type { Transaction, Bill, SavingsGoal, Client, Product, Quote, Loan, Category, SalesReceipt, DeliveryNote, BusinessBudget, BusinessRevenue, BusinessExpense, SavingsGroup, GroupMember, GroupInvitation, GroupContribution, GroupActivity, Project, Invoice, ClientPayment, ClientExpense, CommunicationLog, TaskNote } from './types';
import {
  ShoppingBasket,
  Car,
  Home,
  Utensils,
  Heart,
  Film,
  GraduationCap,
  Briefcase,
  Gift,
  Landmark,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Truck,
  Users,
  Computer,
} from 'lucide-react';

// Define the initial categories with configurable budget defaults
export const initialCategories: Category[] = [
  // Personal Expense Categories
  { id: 'd9a8a3f0-29e8-4b71-80f3-9b8f6d3e1b3c', name: 'Groceries', icon: ShoppingBasket, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.groceries, budgetFrequency: 'monthly' },
  { id: 'd7c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Transport', icon: Car, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.transport, budgetFrequency: 'monthly' },
  { id: 'f8c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Housing', icon: Home, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.housing, budgetFrequency: 'monthly' },
  { id: 'a1c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Food & Dining', icon: Utensils, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.food, budgetFrequency: 'monthly' },
  { id: 'b2c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Health', icon: Heart, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'personal' },
  { id: 'c3c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Entertainment', icon: Film, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.entertainment, budgetFrequency: 'monthly' },
  { id: 'e4c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Education', icon: GraduationCap, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal' },
  { id: 'a5c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Gifts', icon: Gift, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal' },
  
  // Personal Income Categories
  { id: 'b6c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Salary', icon: Landmark, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'c7c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Freelance', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'd8c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Investment', icon: TrendingUp, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'e9c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Side Hustle', icon: PiggyBank, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },

  // Business Expense Categories
  { id: 'f0c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Office Supplies', icon: Briefcase, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business', budget: appConfig.defaults.budgets.office, budgetFrequency: 'monthly' },
  { id: 'a2c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Software & Subscriptions', icon: Computer, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'business', budget: appConfig.defaults.budgets.software, budgetFrequency: 'monthly' },
  { id: 'b3c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Marketing & Advertising', icon: TrendingUp, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'business', budget: 500, budgetFrequency: 'monthly' },
  { id: 'c4c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Business Travel', icon: Car, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'business' },
  { id: 'd5c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Client Expenses', icon: Users, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'business' },
  { id: 'e6c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Shipping & Delivery', icon: Truck, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business' },
  { id: 'f7c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Utilities', icon: Home, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'business', budget: 300, budgetFrequency: 'monthly' },
  { id: 'a8c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Rent & Facilities', icon: Home, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'business', budget: 1500, budgetFrequency: 'monthly' },
  { id: 'b9c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Equipment & Assets', icon: Computer, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'business' },
  { id: 'd0c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Insurance', icon: Heart, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business' },
  { id: 'e1c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Professional Services', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'business' },
  { id: 'f2c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Inventory & Supplies', icon: ShoppingBasket, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'business' },

  // Business Income Categories
  { id: 'a3c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Client Payments', icon: CreditCard, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'b4c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Product Sales', icon: ShoppingBasket, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'c5c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Service Revenue', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'd6c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Subscription Revenue', icon: Computer, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'e7c6e0e6-2b8e-4b8a-8b4a-6b5e7d3f9e2b', name: 'Consulting Revenue', icon: Users, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
];


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
  // Transaction methods
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  // Bill methods
  addBill: (bill: Bill) => Promise<void>;
  updateBill: (bill: Bill) => Promise<void>;
  deleteBill: (billId: string) => Promise<void>;
  // Goal methods
  addSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  updateSavingsGoal: (goalId: string, amount: number) => Promise<void>;
  updateSavingsGoalComplete: (goal: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (goalId: string) => Promise<void>;
  // Client methods
  addClient: (client: Client) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  // Product methods
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  // Quote methods
  addQuote: (quote: Quote) => Promise<void>;
  updateQuote: (quote: Quote) => Promise<void>;
  deleteQuote: (quoteId: string) => Promise<void>;
  // Loan methods
  addLoan: (loan: Loan) => Promise<void>;
  updateLoan: (loan: Loan) => Promise<void>;
  deleteLoan: (loanId: string) => Promise<void>;
  // Category methods
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  // Sales Receipt methods
  addSalesReceipt: (receipt: SalesReceipt) => Promise<void>;
  updateSalesReceipt: (receipt: SalesReceipt) => Promise<void>;
  deleteSalesReceipt: (receiptId: string) => Promise<void>;
  // Delivery Note methods
  addDeliveryNote: (deliveryNote: DeliveryNote) => Promise<void>;
  updateDeliveryNote: (deliveryNote: DeliveryNote) => Promise<void>;
  deleteDeliveryNote: (deliveryNoteId: string) => Promise<void>;
  // Business Budget methods
  addBusinessBudget: (budget: BusinessBudget) => Promise<void>;
  updateBusinessBudget: (budget: BusinessBudget) => Promise<void>;
  deleteBusinessBudget: (budgetId: string) => Promise<void>;
  // Business Revenue methods
  addBusinessRevenue: (revenue: BusinessRevenue) => Promise<void>;
  updateBusinessRevenue: (revenue: BusinessRevenue) => Promise<void>;
  deleteBusinessRevenue: (revenueId: string) => Promise<void>;
  // Business Expense methods
  addBusinessExpense: (expense: BusinessExpense) => Promise<void>;
  updateBusinessExpense: (expense: BusinessExpense) => Promise<void>;
  deleteBusinessExpense: (expenseId: string) => Promise<void>;
  // Group Savings methods
  addSavingsGroup: (group: SavingsGroup) => Promise<void>;
  updateSavingsGroup: (group: SavingsGroup) => Promise<void>;
  deleteSavingsGroup: (groupId: string) => Promise<void>;
  addGroupMember: (member: GroupMember) => Promise<void>;
  updateGroupMember: (member: GroupMember) => Promise<void>;
  removeGroupMember: (memberId: string) => Promise<void>;
  addGroupInvitation: (invitation: GroupInvitation) => Promise<void>;
  updateGroupInvitation: (invitation: GroupInvitation) => Promise<void>;
  deleteGroupInvitation: (invitationId: string) => Promise<void>;
  addGroupContribution: (contribution: GroupContribution) => Promise<void>;
  updateGroupContribution: (contribution: GroupContribution) => Promise<void>;
  deleteGroupContribution: (contributionId: string) => Promise<void>;
  addGroupActivity: (activity: GroupActivity) => Promise<void>;
  // CRM methods
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  addPayment: (payment: ClientPayment) => Promise<void>;
  updatePayment: (payment: ClientPayment) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  addExpense: (expense: ClientExpense) => Promise<void>;
  updateExpense: (expense: ClientExpense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addCommunicationLog: (log: CommunicationLog) => Promise<void>;
  updateCommunicationLog: (log: CommunicationLog) => Promise<void>;
  deleteCommunicationLog: (logId: string) => Promise<void>;
  addTaskNote: (task: TaskNote) => Promise<void>;
  updateTaskNote: (task: TaskNote) => Promise<void>;
  deleteTaskNote: (taskId: string) => Promise<void>;
  // Sync methods
  loadData: () => Promise<void>;
  setSyncData: (key: keyof AppState, data: any) => void;
}

export const useAppStore = create<AppState>()(
  (set, get) => {
    // Make store available globally for sync
    if (typeof window !== 'undefined') {
      (window as any).__KWACHALITE_STORE__ = { set, get, setSyncData: (key: keyof AppState, data: any) => set({ [key]: data }) };
    }
    
    return {
    transactions: [],
    bills: [],
    savingsGoals: [],
    clients: [],
    products: [],
    quotes: [],
    loans: [],
    categories: initialCategories,
    salesReceipts: [],
    deliveryNotes: [],
    businessBudgets: [],
    businessRevenues: [],
    businessExpenses: [],
    // Group Savings
    savingsGroups: [],
    groupMembers: [],
    groupInvitations: [],
    groupContributions: [],
    groupActivities: [],
    // CRM Properties
    projects: [],
    invoices: [],
    payments: [],
    expenses: [],
    communications: [],
    tasks: [],
    isLoading: false,

    // Load data from Supabase
    loadData: async () => {
      set({ isLoading: true });
      try {
        const supabaseData = await supabaseSync.loadUserData();
        if (supabaseData) {
          set({
            transactions: supabaseData.transactions || [],
            bills: supabaseData.bills || [],
            savingsGoals: supabaseData.savingsGoals || [],
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    // Transaction methods
    addTransaction: async (transaction) => {
      set((state) => ({ transactions: [transaction, ...state.transactions] }));
      await supabaseSync.syncTransaction(transaction, 'create');
    },
    updateTransaction: async (transaction) => {
      set(state => ({
        transactions: state.transactions.map(t => t.id === transaction.id ? transaction : t)
      }));
      await supabaseSync.syncTransaction(transaction, 'update');
    },
    deleteTransaction: async (transactionId) => {
      const state = get();
      const transaction = state.transactions.find(t => t.id === transactionId);
      if (transaction) {
        set(state => ({
          transactions: state.transactions.filter(t => t.id !== transactionId)
        }));
        await supabaseSync.syncTransaction(transaction, 'delete');
      }
    },

    // Bill methods
    addBill: async (bill) => {
      set((state) => ({ bills: [bill, ...state.bills] }));
      await supabaseSync.syncBill(bill, 'create');
    },
    updateBill: async (bill) => {
      set(state => ({
        bills: state.bills.map(b => b.id === bill.id ? bill : b)
      }));
      await supabaseSync.syncBill(bill, 'update');
    },
    deleteBill: async (billId) => {
      const state = get();
      const bill = state.bills.find(b => b.id === billId);
      if (bill) {
        set(state => ({
          bills: state.bills.filter(b => b.id !== billId)
        }));
        await supabaseSync.syncBill(bill, 'delete');
      }
    },

    // Goal methods
    addSavingsGoal: async (goal) => {
      set((state) => ({ savingsGoals: [goal, ...state.savingsGoals] }));
      await supabaseSync.syncSavingsGoal(goal, 'create');
    },
    updateSavingsGoal: async (goalId, amount) => {
      set((state) => ({
        savingsGoals: state.savingsGoals.map(g => 
          g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
        )
      }));
      const state = get();
      const goal = state.savingsGoals.find(g => g.id === goalId);
      if (goal) {
        const updatedGoal = { ...goal, currentAmount: goal.currentAmount + amount };
        await supabaseSync.syncSavingsGoal(updatedGoal, 'update');
        // Also create a transaction for the goal progress
        await supabaseSync.syncTransaction({ 
          id: new Date().getTime().toString(), 
          type: 'income', 
          amount, 
          description: `Goal progress: ${goal.name}`, 
          category: 'Goals', 
          workspace: goal.workspace, 
          date: new Date().toISOString().split('T')[0] 
        } as Transaction, 'create');
      }
    },
    updateSavingsGoalComplete: async (goal) => {
      set(state => ({
        savingsGoals: state.savingsGoals.map(g => g.id === goal.id ? goal : g)
      }));
      await supabaseSync.syncSavingsGoal(goal, 'update');
    },
    deleteSavingsGoal: async (goalId) => {
      const state = get();
      const goal = state.savingsGoals.find(g => g.id === goalId);
      if (goal) {
        set(state => ({
          savingsGoals: state.savingsGoals.filter(g => g.id !== goalId)
        }));
        await supabaseSync.syncSavingsGoal(goal, 'delete');
      }
    },

    // Client methods
    addClient: async (client) => {
      set((state) => ({ clients: [client, ...state.clients] }));
      await supabaseSync.syncClient(client, 'create');
    },
    updateClient: async (client) => {
      set(state => ({
        clients: state.clients.map(c => c.id === client.id ? client : c)
      }));
      await supabaseSync.syncClient(client, 'update');
    },
    deleteClient: async (clientId) => {
      const state = get();
      const client = state.clients.find(c => c.id === clientId);
      if (client) {
        set(state => ({
          clients: state.clients.filter(c => c.id !== clientId)
        }));
        await supabaseSync.syncClient(client, 'delete');
      }
    },

    // Product methods
    addProduct: async (product) => {
      set((state) => ({ products: [product, ...state.products] }));
      await supabaseSync.syncProduct(product, 'create');
    },
    updateProduct: async (product) => {
      set(state => ({
        products: state.products.map(p => p.id === product.id ? product : p)
      }));
      await supabaseSync.syncProduct(product, 'update');
    },
    deleteProduct: async (productId) => {
      const state = get();
      const product = state.products.find(p => p.id === productId);
      if (product) {
        set(state => ({
          products: state.products.filter(p => p.id !== productId)
        }));
        await supabaseSync.syncProduct(product, 'delete');
      }
    },

    // Quote methods
    addQuote: async (quote) => {
      set((state) => ({ quotes: [quote, ...state.quotes] }));
      await supabaseSync.syncQuote(quote, 'create');
    },
    updateQuote: async (quote) => {
      set(state => ({
        quotes: state.quotes.map(q => q.id === quote.id ? quote : q)
      }));
      await supabaseSync.syncQuote(quote, 'update');
    },
    deleteQuote: async (quoteId) => {
      const state = get();
      const quote = state.quotes.find(q => q.id === quoteId);
      if (quote) {
        set(state => ({
          quotes: state.quotes.filter(q => q.id !== quoteId)
        }));
        await supabaseSync.syncQuote(quote, 'delete');
      }
    },

    // Loan methods
    addLoan: async (loan) => {
      set((state) => ({ loans: [loan, ...state.loans] }));
      await supabaseSync.syncLoan(loan, 'create');
    },
    updateLoan: async (loan) => {
      set(state => ({
        loans: state.loans.map(l => l.id === loan.id ? loan : l)
      }));
      await supabaseSync.syncLoan(loan, 'update');
    },
    deleteLoan: async (loanId) => {
      const state = get();
      const loan = state.loans.find(l => l.id === loanId);
      if (loan) {
        set(state => ({
          loans: state.loans.filter(l => l.id !== loanId)
        }));
        await supabaseSync.syncLoan(loan, 'delete');
      }
    },

    // Category methods
    addCategory: async (category) => {
      const newCategory = { ...category, id: crypto.randomUUID() };
      set((state) => ({ categories: [...state.categories, newCategory] }));
      await supabaseSync.syncCategory(newCategory, 'create');
    },
    updateCategory: async (category) => {
      set(state => ({
        categories: state.categories.map(c => c.id === category.id ? category : c)
      }));
      await supabaseSync.syncCategory(category, 'update');
    },
    deleteCategory: async (categoryId: string) => {
      const state = get();
      const category = state.categories.find(c => c.id === categoryId);
      if (category) {
        set(state => ({
          categories: state.categories.filter(c => c.id !== categoryId)
        }));
        await supabaseSync.syncCategory(category, 'delete');
      }
    },

    // Sales Receipt methods
    addSalesReceipt: async (receipt) => {
      set((state) => ({ salesReceipts: [receipt, ...state.salesReceipts] }));
      // TODO: Add supabase sync for receipts when implemented
    },
    updateSalesReceipt: async (receipt) => {
      set(state => ({
        salesReceipts: state.salesReceipts.map(r => r.id === receipt.id ? receipt : r)
      }));
      // TODO: Add supabase sync for receipts when implemented
    },
    deleteSalesReceipt: async (receiptId) => {
      set(state => ({
        salesReceipts: state.salesReceipts.filter(r => r.id !== receiptId)
      }));
      // TODO: Add supabase sync for receipts when implemented
    },

    // Delivery Note methods
    addDeliveryNote: async (deliveryNote) => {
      set((state) => ({ deliveryNotes: [deliveryNote, ...state.deliveryNotes] }));
      // TODO: Add supabase sync for delivery notes when implemented
    },
    updateDeliveryNote: async (deliveryNote) => {
      set(state => ({
        deliveryNotes: state.deliveryNotes.map(d => d.id === deliveryNote.id ? deliveryNote : d)
      }));
      // TODO: Add supabase sync for delivery notes when implemented
    },
    deleteDeliveryNote: async (deliveryNoteId) => {
      set(state => ({
        deliveryNotes: state.deliveryNotes.filter(d => d.id !== deliveryNoteId)
      }));
      // TODO: Add supabase sync for delivery notes when implemented
    },

    // Business Budget methods
    addBusinessBudget: async (budget) => {
      const newBudget = { ...budget, id: crypto.randomUUID() };
      set((state) => ({ businessBudgets: [newBudget, ...state.businessBudgets] }));
      await supabaseSync.syncBusinessBudget(newBudget, 'create');
    },
    updateBusinessBudget: async (budget) => {
      set(state => ({
        businessBudgets: state.businessBudgets.map(b => b.id === budget.id ? budget : b)
      }));
      await supabaseSync.syncBusinessBudget(budget, 'update');
    },
    deleteBusinessBudget: async (budgetId) => {
      const budget = get().businessBudgets.find(b => b.id === budgetId);
      if(budget) {
          set(state => ({
            businessBudgets: state.businessBudgets.filter(b => b.id !== budgetId)
          }));
          await supabaseSync.syncBusinessBudget(budget, 'delete');
      }
    },

    // Business Revenue methods
    addBusinessRevenue: async (revenue) => {
      set((state) => ({ businessRevenues: [revenue, ...state.businessRevenues] }));
      // TODO: Add supabase sync for business revenues when implemented
    },
    updateBusinessRevenue: async (revenue) => {
      set(state => ({
        businessRevenues: state.businessRevenues.map(r => r.id === revenue.id ? revenue : r)
      }));
      // TODO: Add supabase sync for business revenues when implemented
    },
    deleteBusinessRevenue: async (revenueId) => {
      set(state => ({
        businessRevenues: state.businessRevenues.filter(r => r.id !== revenueId)
      }));
      // TODO: Add supabase sync for business revenues when implemented
    },

    // Business Expense methods
    addBusinessExpense: async (expense) => {
      set((state) => ({ businessExpenses: [expense, ...state.businessExpenses] }));
      // TODO: Add supabase sync for business expenses when implemented
    },
    updateBusinessExpense: async (expense) => {
      set(state => ({
        businessExpenses: state.businessExpenses.map(e => e.id === expense.id ? expense : e)
      }));
      // TODO: Add supabase sync for business expenses when implemented
    },
    deleteBusinessExpense: async (expenseId) => {
      set(state => ({
        businessExpenses: state.businessExpenses.filter(e => e.id !== expenseId)
      }));
      // TODO: Add supabase sync for business expenses when implemented
    },

    // Group Savings methods
    addSavingsGroup: async (group) => {
      set((state) => ({ savingsGroups: [group, ...state.savingsGroups] }));
      // TODO: Add supabase sync for savings groups when implemented
    },
    updateSavingsGroup: async (group) => {
      set(state => ({
        savingsGroups: state.savingsGroups.map(g => g.id === group.id ? group : g)
      }));
      // TODO: Add supabase sync for savings groups when implemented
    },
    deleteSavingsGroup: async (groupId) => {
      set(state => ({
        savingsGroups: state.savingsGroups.filter(g => g.id !== groupId)
      }));
      // TODO: Add supabase sync for savings groups when implemented
    },
    addGroupMember: async (member) => {
      set((state) => ({ groupMembers: [member, ...state.groupMembers] }));
      // TODO: Add supabase sync for group members when implemented
    },
    updateGroupMember: async (member) => {
      set(state => ({
        groupMembers: state.groupMembers.map(m => m.id === member.id ? member : m)
      }));
      // TODO: Add supabase sync for group members when implemented
    },
    removeGroupMember: async (memberId) => {
      set(state => ({
        groupMembers: state.groupMembers.filter(m => m.id !== memberId)
      }));
      // TODO: Add supabase sync for group members when implemented
    },
    addGroupInvitation: async (invitation) => {
      set((state) => ({ groupInvitations: [invitation, ...state.groupInvitations] }));
      // TODO: Add supabase sync for group invitations when implemented
    },
    updateGroupInvitation: async (invitation) => {
      set(state => ({
        groupInvitations: state.groupInvitations.map(i => i.id === invitation.id ? invitation : i)
      }));
      // TODO: Add supabase sync for group invitations when implemented
    },
    deleteGroupInvitation: async (invitationId) => {
      set(state => ({
        groupInvitations: state.groupInvitations.filter(i => i.id !== invitationId)
      }));
      // TODO: Add supabase sync for group invitations when implemented
    },
    addGroupContribution: async (contribution) => {
      set((state) => ({ groupContributions: [contribution, ...state.groupContributions] }));
      // TODO: Add supabase sync for group contributions when implemented
    },
    updateGroupContribution: async (contribution) => {
      set(state => ({
        groupContributions: state.groupContributions.map(c => c.id === contribution.id ? contribution : c)
      }));
      // TODO: Add supabase sync for group contributions when implemented
    },
    deleteGroupContribution: async (contributionId) => {
      set(state => ({
        groupContributions: state.groupContributions.filter(c => c.id !== contributionId)
      }));
      // TODO: Add supabase sync for group contributions when implemented
    },
    addGroupActivity: async (activity) => {
      set((state) => ({ groupActivities: [activity, ...state.groupActivities] }));
      // TODO: Add supabase sync for group activities when implemented
    },

    // CRM methods
    addProject: async (project) => {
      set((state) => ({ projects: [project, ...state.projects] }));
      // TODO: Add supabase sync for projects when implemented
    },
    updateProject: async (project) => {
      set(state => ({
        projects: state.projects.map(p => p.id === project.id ? project : p)
      }));
      // TODO: Add supabase sync for projects when implemented
    },
    deleteProject: async (projectId) => {
      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId)
      }));
      // TODO: Add supabase sync for projects when implemented
    },
    addInvoice: async (invoice) => {
      set((state) => ({ invoices: [invoice, ...state.invoices] }));
      // TODO: Add supabase sync for invoices when implemented
    },
    updateInvoice: async (invoice) => {
      set(state => ({
        invoices: state.invoices.map(i => i.id === invoice.id ? invoice : i)
      }));
      // TODO: Add supabase sync for invoices when implemented
    },
    deleteInvoice: async (invoiceId) => {
      set(state => ({
        invoices: state.invoices.filter(i => i.id !== invoiceId)
      }));
      // TODO: Add supabase sync for invoices when implemented
    },
    addPayment: async (payment) => {
      set((state) => ({ payments: [payment, ...state.payments] }));
      // TODO: Add supabase sync for payments when implemented
    },
    updatePayment: async (payment) => {
      set(state => ({
        payments: state.payments.map(p => p.id === payment.id ? payment : p)
      }));
      // TODO: Add supabase sync for payments when implemented
    },
    deletePayment: async (paymentId) => {
      set(state => ({
        payments: state.payments.filter(p => p.id !== paymentId)
      }));
      // TODO: Add supabase sync for payments when implemented
    },
    addExpense: async (expense) => {
      set((state) => ({ expenses: [expense, ...state.expenses] }));
      // TODO: Add supabase sync for expenses when implemented
    },
    updateExpense: async (expense) => {
      set(state => ({
        expenses: state.expenses.map(e => e.id === expense.id ? expense : e)
      }));
      // TODO: Add supabase sync for expenses when implemented
    },
    deleteExpense: async (expenseId) => {
      set(state => ({
        expenses: state.expenses.filter(e => e.id !== expenseId)
      }));
      // TODO: Add supabase sync for expenses when implemented
    },
    addCommunicationLog: async (log) => {
      set((state) => ({ communications: [log, ...state.communications] }));
      // TODO: Add supabase sync for communications when implemented
    },
    updateCommunicationLog: async (log) => {
      set(state => ({
        communications: state.communications.map(c => c.id === log.id ? log : c)
      }));
      // TODO: Add supabase sync for communications when implemented
    },
    deleteCommunicationLog: async (logId) => {
      set(state => ({
        communications: state.communications.filter(c => c.id !== logId)
      }));
      // TODO: Add supabase sync for communications when implemented
    },
    addTaskNote: async (task) => {
      set((state) => ({ tasks: [task, ...state.tasks] }));
      // TODO: Add supabase sync for tasks when implemented
    },
    updateTaskNote: async (task) => {
      set(state => ({
        tasks: state.tasks.map(t => t.id === task.id ? task : t)
      }));
      // TODO: Add supabase sync for tasks when implemented
    },
    deleteTaskNote: async (taskId) => {
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      }));
      // TODO: Add supabase sync for tasks when implemented
    },

    // Sync methods
    setSyncData: (key, data) => {
      set({ [key]: data });
    },
  };
});