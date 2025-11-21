
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  // Transaction methods
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  // Bill methods
  addBill: (bill: Bill) => void;
  updateBill: (bill: Bill) => void;
  deleteBill: (billId: string) => void;
  // Goal methods
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (goalId: string, amount: number) => void;
  updateSavingsGoalComplete: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (goalId: string) => void;
  // Client methods
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  // Product methods
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  // Quote methods
  addQuote: (quote: Quote) => void;
  updateQuote: (quote: Quote) => void;
  deleteQuote: (quoteId: string) => void;
  // Loan methods
  addLoan: (loan: Loan) => void;
  updateLoan: (loan: Loan) => void;
  deleteLoan: (loanId: string) => void;
  // Category methods
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  // Sales Receipt methods
  addSalesReceipt: (receipt: SalesReceipt) => void;
  updateSalesReceipt: (receipt: SalesReceipt) => void;
  deleteSalesReceipt: (receiptId: string) => void;
  // Delivery Note methods
  addDeliveryNote: (deliveryNote: DeliveryNote) => void;
  updateDeliveryNote: (deliveryNote: DeliveryNote) => void;
  deleteDeliveryNote: (deliveryNoteId: string) => void;
  // Business Budget methods
  addBusinessBudget: (budget: BusinessBudget) => void;
  updateBusinessBudget: (budget: BusinessBudget) => void;
  deleteBusinessBudget: (budgetId: string) => void;
  // Business Revenue methods
  addBusinessRevenue: (revenue: BusinessRevenue) => void;
  updateBusinessRevenue: (revenue: BusinessRevenue) => void;
  deleteBusinessRevenue: (revenueId: string) => void;
  // Business Expense methods
  addBusinessExpense: (expense: BusinessExpense) => void;
  updateBusinessExpense: (expense: BusinessExpense) => void;
  deleteBusinessExpense: (expenseId: string) => void;
  // Group Savings methods
  addSavingsGroup: (group: SavingsGroup) => void;
  updateSavingsGroup: (group: SavingsGroup) => void;
  deleteSavingsGroup: (groupId: string) => void;
  addGroupMember: (member: GroupMember) => void;
  updateGroupMember: (member: GroupMember) => void;
  removeGroupMember: (memberId: string) => void;
  addGroupInvitation: (invitation: GroupInvitation) => void;
  updateGroupInvitation: (invitation: GroupInvitation) => void;
  deleteGroupInvitation: (invitationId: string) => void;
  addGroupContribution: (contribution: GroupContribution) => void;
  updateGroupContribution: (contribution: GroupContribution) => void;
  deleteGroupContribution: (contributionId: string) => void;
  addGroupActivity: (activity: GroupActivity) => void;
  // CRM methods
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (invoiceId: string) => void;
  addPayment: (payment: ClientPayment) => void;
  updatePayment: (payment: ClientPayment) => void;
  deletePayment: (paymentId: string) => void;
  addExpense: (expense: ClientExpense) => void;
  updateExpense: (expense: ClientExpense) => void;
  deleteExpense: (expenseId: string) => void;
  addCommunicationLog: (log: CommunicationLog) => void;
  updateCommunicationLog: (log: CommunicationLog) => void;
  deleteCommunicationLog: (logId: string) => void;
  addTaskNote: (task: TaskNote) => void;
  updateTaskNote: (task: TaskNote) => void;
  deleteTaskNote: (taskId: string) => void;
  // Sync methods
  setSyncData: (key: keyof AppState, data: any) => void;
  initializeSupabaseSync: () => Promise<void>;
  syncFromSupabase: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      // Transaction methods
      addTransaction: (transaction) => {
        set((state) => ({ transactions: [transaction, ...state.transactions] }));
        supabaseSync.syncTransaction(transaction, 'create');
      },
      updateTransaction: (transaction) => {
        set(state => ({
          transactions: state.transactions.map(t => t.id === transaction.id ? transaction : t)
        }));
        supabaseSync.syncTransaction(transaction, 'update');
      },
      deleteTransaction: (transactionId) => {
        const state = get();
        const transaction = state.transactions.find(t => t.id === transactionId);
        if (transaction) {
          set(state => ({
            transactions: state.transactions.filter(t => t.id !== transactionId)
          }));
          supabaseSync.syncTransaction(transaction, 'delete');
        }
      },
      // Bill methods
      addBill: (bill) => {
        set((state) => ({ bills: [bill, ...state.bills] }));
        supabaseSync.syncBill(bill, 'create');
      },
      updateBill: (bill) => {
        set(state => ({
          bills: state.bills.map(b => b.id === bill.id ? bill : b)
        }));
        supabaseSync.syncBill(bill, 'update');
      },
      deleteBill: (billId) => {
        const state = get();
        const bill = state.bills.find(b => b.id === billId);
        if (bill) {
          set(state => ({
            bills: state.bills.filter(b => b.id !== billId)
          }));
          supabaseSync.syncBill(bill, 'delete');
        }
      },
      // Goal methods
      addSavingsGoal: (goal) => {
        set((state) => ({ savingsGoals: [goal, ...state.savingsGoals] }));
        supabaseSync.syncSavingsGoal(goal, 'create');
      },
      updateSavingsGoal: (goalId, amount) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map(g => 
            g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
          )
        }));
        const state = get();
        const goal = state.savingsGoals.find(g => g.id === goalId);
        if (goal) {
          const updatedGoal = { ...goal, currentAmount: goal.currentAmount + amount };
          supabaseSync.syncSavingsGoal(updatedGoal, 'update');
          // Also create a transaction for the goal progress
          supabaseSync.syncTransaction({ 
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
      updateSavingsGoalComplete: (goal) => {
        set(state => ({
          savingsGoals: state.savingsGoals.map(g => g.id === goal.id ? goal : g)
        }));
        supabaseSync.syncSavingsGoal(goal, 'update');
      },
      deleteSavingsGoal: (goalId) => {
        const state = get();
        const goal = state.savingsGoals.find(g => g.id === goalId);
        if (goal) {
          set(state => ({
            savingsGoals: state.savingsGoals.filter(g => g.id !== goalId)
          }));
          supabaseSync.syncSavingsGoal(goal, 'delete');
        }
      },
      // Client methods
      addClient: (client) => {
        set((state) => ({ clients: [client, ...state.clients] }));
        supabaseSync.syncClient(client, 'create');
      },
      updateClient: (client) => {
        set(state => ({
          clients: state.clients.map(c => c.id === client.id ? client : c)
        }));
        supabaseSync.syncClient(client, 'update');
      },
      deleteClient: (clientId) => {
        const state = get();
        const client = state.clients.find(c => c.id === clientId);
        if (client) {
          set(state => ({
            clients: state.clients.filter(c => c.id !== clientId)
          }));
          supabaseSync.syncClient(client, 'delete');
        }
      },
      // Product methods
      addProduct: (product) => {
        set((state) => ({ products: [product, ...state.products] }));
        supabaseSync.syncProduct(product, 'create');
      },
      updateProduct: (product) => {
        set(state => ({
          products: state.products.map(p => p.id === product.id ? product : p)
        }));
        supabaseSync.syncProduct(product, 'update');
      },
      deleteProduct: (productId) => {
        const state = get();
        const product = state.products.find(p => p.id === productId);
        if (product) {
          set(state => ({
            products: state.products.filter(p => p.id !== productId)
          }));
          supabaseSync.syncProduct(product, 'delete');
        }
      },
      // Quote methods
      addQuote: (quote) => {
        set((state) => ({ quotes: [quote, ...state.quotes] }));
        supabaseSync.syncQuote(quote, 'create');
      },
      updateQuote: (quote) => {
        set(state => ({
          quotes: state.quotes.map(q => q.id === quote.id ? quote : q)
        }));
        supabaseSync.syncQuote(quote, 'update');
      },
      deleteQuote: (quoteId) => {
        const state = get();
        const quote = state.quotes.find(q => q.id === quoteId);
        if (quote) {
          set(state => ({
            quotes: state.quotes.filter(q => q.id !== quoteId)
          }));
          supabaseSync.syncQuote(quote, 'delete');
        }
      },
      // Loan methods
      addLoan: (loan) => {
        set((state) => ({ loans: [loan, ...state.loans] }));
        supabaseSync.syncLoan(loan, 'create');
      },
      updateLoan: (loan) => {
        set(state => ({
          loans: state.loans.map(l => l.id === loan.id ? loan : l)
        }));
        supabaseSync.syncLoan(loan, 'update');
      },
      deleteLoan: (loanId) => {
        const state = get();
        const loan = state.loans.find(l => l.id === loanId);
        if (loan) {
          set(state => ({
            loans: state.loans.filter(l => l.id !== loanId)
          }));
          supabaseSync.syncLoan(loan, 'delete');
        }
      },
      // Category methods
      addCategory: (category) => {
        const newCategory = { ...category, id: crypto.randomUUID() };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        supabaseSync.syncCategory(newCategory, 'create');
      },
      updateCategory: (category) => {
        set(state => ({
          categories: state.categories.map(c => c.id === category.id ? category : c)
        }));
        supabaseSync.syncCategory(category, 'update');
      },
      deleteCategory: (categoryId: string) => {
        const state = get();
        const category = state.categories.find(c => c.id === categoryId);
        if (category) {
          set(state => ({
            categories: state.categories.filter(c => c.id !== categoryId)
          }));
          supabaseSync.syncCategory(category, 'delete');
        }
      },
      // Sales Receipt methods
      addSalesReceipt: (receipt) => {
        set((state) => ({ salesReceipts: [receipt, ...state.salesReceipts] }));
        // TODO: Add supabase sync for receipts when implemented
      },
      updateSalesReceipt: (receipt) => {
        set(state => ({
          salesReceipts: state.salesReceipts.map(r => r.id === receipt.id ? receipt : r)
        }));
        // TODO: Add supabase sync for receipts when implemented
      },
      deleteSalesReceipt: (receiptId) => {
        set(state => ({
          salesReceipts: state.salesReceipts.filter(r => r.id !== receiptId)
        }));
        // TODO: Add supabase sync for receipts when implemented
      },
      // Delivery Note methods
      addDeliveryNote: (deliveryNote) => {
        set((state) => ({ deliveryNotes: [deliveryNote, ...state.deliveryNotes] }));
        // TODO: Add supabase sync for delivery notes when implemented
      },
      updateDeliveryNote: (deliveryNote) => {
        set(state => ({
          deliveryNotes: state.deliveryNotes.map(d => d.id === deliveryNote.id ? deliveryNote : d)
        }));
        // TODO: Add supabase sync for delivery notes when implemented
      },
      // Business Budget methods
      addBusinessBudget: (budget) => {
        const newBudget = { ...budget, id: crypto.randomUUID() };
        set((state) => ({ businessBudgets: [newBudget, ...state.businessBudgets] }));
        supabaseSync.syncBusinessBudget(newBudget, 'create');
      },
      updateBusinessBudget: (budget) => {
        set(state => ({
          businessBudgets: state.businessBudgets.map(b => b.id === budget.id ? budget : b)
        }));
        supabaseSync.syncBusinessBudget(budget, 'update');
      },
      deleteBusinessBudget: (budgetId) => {
        const budget = get().businessBudgets.find(b => b.id === budgetId);
        if(budget) {
            set(state => ({
              businessBudgets: state.businessBudgets.filter(b => b.id !== budgetId)
            }));
            supabaseSync.syncBusinessBudget(budget, 'delete');
        }
      },
      // Business Revenue methods
      addBusinessRevenue: (revenue) => {
        set((state) => ({ businessRevenues: [revenue, ...state.businessRevenues] }));
        // TODO: Add supabase sync for business revenues when implemented
      },
      updateBusinessRevenue: (revenue) => {
        set(state => ({
          businessRevenues: state.businessRevenues.map(r => r.id === revenue.id ? revenue : r)
        }));
        // TODO: Add supabase sync for business revenues when implemented
      },
      deleteBusinessRevenue: (revenueId) => {
        set(state => ({
          businessRevenues: state.businessRevenues.filter(r => r.id !== revenueId)
        }));
        // TODO: Add supabase sync for business revenues when implemented
      },
      // Business Expense methods
      addBusinessExpense: (expense) => {
        set((state) => ({ businessExpenses: [expense, ...state.businessExpenses] }));
        // TODO: Add supabase sync for business expenses when implemented
      },
      updateBusinessExpense: (expense) => {
        set(state => ({
          businessExpenses: state.businessExpenses.map(e => e.id === expense.id ? expense : e)
        }));
        // TODO: Add supabase sync for business expenses when implemented
      },
      deleteBusinessExpense: (expenseId) => {
        set(state => ({
          businessExpenses: state.businessExpenses.filter(e => e.id !== expenseId)
        }));
        // TODO: Add supabase sync for business expenses when implemented
      },
      deleteDeliveryNote: (deliveryNoteId) => {
        set(state => ({
          deliveryNotes: state.deliveryNotes.filter(d => d.id !== deliveryNoteId)
        }));
        // TODO: Add supabase sync for delivery notes when implemented
      },
      // Group Savings methods
      addSavingsGroup: (group) => {
        set((state) => ({ savingsGroups: [group, ...state.savingsGroups] }));
        // TODO: Add supabase sync for savings groups when implemented
      },
      updateSavingsGroup: (group) => {
        set(state => ({
          savingsGroups: state.savingsGroups.map(g => g.id === group.id ? group : g)
        }));
        // TODO: Add supabase sync for savings groups when implemented
      },
      deleteSavingsGroup: (groupId) => {
        set(state => ({
          savingsGroups: state.savingsGroups.filter(g => g.id !== groupId)
        }));
        // TODO: Add supabase sync for savings groups when implemented
      },
      addGroupMember: (member) => {
        set((state) => ({ groupMembers: [member, ...state.groupMembers] }));
        // TODO: Add supabase sync for group members when implemented
      },
      updateGroupMember: (member) => {
        set(state => ({
          groupMembers: state.groupMembers.map(m => m.id === member.id ? member : m)
        }));
        // TODO: Add supabase sync for group members when implemented
      },
      removeGroupMember: (memberId) => {
        set(state => ({
          groupMembers: state.groupMembers.filter(m => m.id !== memberId)
        }));
        // TODO: Add supabase sync for group members when implemented
      },
      addGroupInvitation: (invitation) => {
        set((state) => ({ groupInvitations: [invitation, ...state.groupInvitations] }));
        // TODO: Add supabase sync for group invitations when implemented
      },
      updateGroupInvitation: (invitation) => {
        set(state => ({
          groupInvitations: state.groupInvitations.map(i => i.id === invitation.id ? invitation : i)
        }));
        // TODO: Add supabase sync for group invitations when implemented
      },
      deleteGroupInvitation: (invitationId) => {
        set(state => ({
          groupInvitations: state.groupInvitations.filter(i => i.id !== invitationId)
        }));
        // TODO: Add supabase sync for group invitations when implemented
      },
      addGroupContribution: (contribution) => {
        set((state) => ({ groupContributions: [contribution, ...state.groupContributions] }));
        // TODO: Add supabase sync for group contributions when implemented
      },
      updateGroupContribution: (contribution) => {
        set(state => ({
          groupContributions: state.groupContributions.map(c => c.id === contribution.id ? contribution : c)
        }));
        // TODO: Add supabase sync for group contributions when implemented
      },
      deleteGroupContribution: (contributionId) => {
        set(state => ({
          groupContributions: state.groupContributions.filter(c => c.id !== contributionId)
        }));
        // TODO: Add supabase sync for group contributions when implemented
      },
      addGroupActivity: (activity) => {
        set((state) => ({ groupActivities: [activity, ...state.groupActivities] }));
        // TODO: Add supabase sync for group activities when implemented
      },
      // CRM methods
      addProject: (project) => {
        set((state) => ({ projects: [project, ...state.projects] }));
        // TODO: Add supabase sync for projects when implemented
      },
      updateProject: (project) => {
        set(state => ({
          projects: state.projects.map(p => p.id === project.id ? project : p)
        }));
        // TODO: Add supabase sync for projects when implemented
      },
      deleteProject: (projectId) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== projectId)
        }));
        // TODO: Add supabase sync for projects when implemented
      },
      addInvoice: (invoice) => {
        set((state) => ({ invoices: [invoice, ...state.invoices] }));
        // TODO: Add supabase sync for invoices when implemented
      },
      updateInvoice: (invoice) => {
        set(state => ({
          invoices: state.invoices.map(i => i.id === invoice.id ? invoice : i)
        }));
        // TODO: Add supabase sync for invoices when implemented
      },
      deleteInvoice: (invoiceId) => {
        set(state => ({
          invoices: state.invoices.filter(i => i.id !== invoiceId)
        }));
        // TODO: Add supabase sync for invoices when implemented
      },
      addPayment: (payment) => {
        set((state) => ({ payments: [payment, ...state.payments] }));
        // TODO: Add supabase sync for payments when implemented
      },
      updatePayment: (payment) => {
        set(state => ({
          payments: state.payments.map(p => p.id === payment.id ? payment : p)
        }));
        // TODO: Add supabase sync for payments when implemented
      },
      deletePayment: (paymentId) => {
        set(state => ({
          payments: state.payments.filter(p => p.id !== paymentId)
        }));
        // TODO: Add supabase sync for payments when implemented
      },
      addExpense: (expense) => {
        set((state) => ({ expenses: [expense, ...state.expenses] }));
        // TODO: Add supabase sync for expenses when implemented
      },
      updateExpense: (expense) => {
        set(state => ({
          expenses: state.expenses.map(e => e.id === expense.id ? expense : e)
        }));
        // TODO: Add supabase sync for expenses when implemented
      },
      deleteExpense: (expenseId) => {
        set(state => ({
          expenses: state.expenses.filter(e => e.id !== expenseId)
        }));
        // TODO: Add supabase sync for expenses when implemented
      },
      addCommunicationLog: (log) => {
        set((state) => ({ communications: [log, ...state.communications] }));
        // TODO: Add supabase sync for communications when implemented
      },
      updateCommunicationLog: (log) => {
        set(state => ({
          communications: state.communications.map(c => c.id === log.id ? log : c)
        }));
        // TODO: Add supabase sync for communications when implemented
      },
      deleteCommunicationLog: (logId) => {
        set(state => ({
          communications: state.communications.filter(c => c.id !== logId)
        }));
        // TODO: Add supabase sync for communications when implemented
      },
      addTaskNote: (task) => {
        set((state) => ({ tasks: [task, ...state.tasks] }));
        // TODO: Add supabase sync for tasks when implemented
      },
      updateTaskNote: (task) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === task.id ? task : t)
        }));
        // TODO: Add supabase sync for tasks when implemented
      },
      deleteTaskNote: (taskId) => {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== taskId)
        }));
        // TODO: Add supabase sync for tasks when implemented
      },
      // Sync methods
      setSyncData: (key, data) => {
        // Only update if data is not empty to prevent overriding local data during initialization
        if (Array.isArray(data) && data.length === 0) {
          return; // Don't override local data with empty arrays
        }
        set({ [key]: data });
      },
      initializeSupabaseSync: async () => {
        // Set up Supabase sync event listeners
        if (typeof window !== 'undefined') {
          const handleSupabaseUpdate = (event: CustomEvent) => {
            const { key, data } = event.detail;
            get().setSyncData(key, data);
          };
          
          window.addEventListener('supabase-sync-update', handleSupabaseUpdate as EventListener);
          
          // Load offline queue
          supabaseSync.loadOfflineQueue();
          
          // Load data from Supabase for multi-device sync
          await get().syncFromSupabase();
        }
      },
      syncFromSupabase: async () => {
        const supabaseData = await supabaseSync.loadUserData();
        if (supabaseData) {
          // Merge Supabase data with local data, preferring Supabase for conflicts
          const currentState = get();
          
          // For each data type, merge with preference for Supabase data
          const dataKeys: Array<keyof typeof supabaseData> = ['transactions', 'bills', 'savingsGoals'];
          dataKeys.forEach((key) => {
            const supabaseArray = supabaseData[key];
            const localArray = currentState[key];
            
            if (Array.isArray(supabaseArray) && Array.isArray(localArray)) {
              // Create a map of local items by ID for quick lookup
              const localMap = new Map(localArray.map((item: any) => [item.id, item]));
              
              // Merge arrays: use Supabase data, but keep local-only items
              const mergedData = supabaseArray.map((supabaseItem: any) => {
                const localItem = localMap.get(supabaseItem.id);
                if (localItem) {
                  // Compare timestamps for conflict resolution
                  const localTime = new Date(localItem.updated_at || localItem.created_at || 0);
                  const supabaseTime = new Date(supabaseItem.updated_at || supabaseItem.created_at || 0);
                  
                  // If local item is newer, use local data but add sync flag
                  if (localTime > supabaseTime) {
                    return {
                      ...localItem,
                      _needsSync: true // Mark for sync to Supabase
                    };
                  }
                  // Otherwise use Supabase data
                  return supabaseItem;
                }
                return supabaseItem;
              });
              
              // Add local-only items (items not in Supabase)
              const supabaseIds = new Set(supabaseArray.map((item: any) => item.id));
              const localOnlyItems = localArray.filter((item: any) => !supabaseIds.has(item.id));
              
              // Update state with merged data
              get().setSyncData(key, [...mergedData, ...localOnlyItems]);
            }
          });
        }
      },
    }),
    {
      name: 'kwachalite-storage', // name of the item in storage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Initialize Supabase sync after rehydration
        if (state) {
          state.initializeSupabaseSync();
        }
      },
    }
  )
);
