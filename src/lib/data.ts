
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabaseSync } from './supabase-sync';
import { appConfig } from './config';
import type { Transaction, Bill, SavingsGoal, Client, Product, Quote, Loan, Category, SalesReceipt, DeliveryNote, BusinessBudget, BusinessRevenue, BusinessExpense } from './types';
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
  { id: 'groceries', name: 'Groceries', icon: ShoppingBasket, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.groceries, budgetFrequency: 'monthly' },
  { id: 'transport', name: 'Transport', icon: Car, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.transport, budgetFrequency: 'monthly' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.housing, budgetFrequency: 'monthly' },
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.food, budgetFrequency: 'monthly' },
  { id: 'health', name: 'Health', icon: Heart, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'personal' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: appConfig.defaults.budgets.entertainment, budgetFrequency: 'monthly' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal' },
  { id: 'gifts', name: 'Gifts', icon: Gift, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal' },
  
  // Personal Income Categories
  { id: 'salary', name: 'Salary', icon: Landmark, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'freelance_personal', name: 'Freelance', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'investment', name: 'Investment', icon: TrendingUp, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'side_hustle', name: 'Side Hustle', icon: PiggyBank, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },

  // Business Expense Categories
  { id: 'office_supplies', name: 'Office Supplies', icon: Briefcase, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business', budget: appConfig.defaults.budgets.office, budgetFrequency: 'monthly' },
  { id: 'software', name: 'Software & Subscriptions', icon: Computer, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'business', budget: appConfig.defaults.budgets.software, budgetFrequency: 'monthly' },
  { id: 'marketing', name: 'Marketing & Advertising', icon: TrendingUp, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'business', budget: 500, budgetFrequency: 'monthly' },
  { id: 'travel', name: 'Business Travel', icon: Car, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'business' },
  { id: 'client_expenses', name: 'Client Expenses', icon: Users, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'business' },
  { id: 'shipping', name: 'Shipping & Delivery', icon: Truck, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business' },
  { id: 'utilities', name: 'Utilities', icon: Home, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'business', budget: 300, budgetFrequency: 'monthly' },
  { id: 'rent', name: 'Rent & Facilities', icon: Home, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'business', budget: 1500, budgetFrequency: 'monthly' },
  { id: 'equipment', name: 'Equipment & Assets', icon: Computer, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'business' },
  { id: 'insurance', name: 'Insurance', icon: Heart, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business' },
  { id: 'professional_services', name: 'Professional Services', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'business' },
  { id: 'inventory', name: 'Inventory & Supplies', icon: ShoppingBasket, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'business' },

  // Business Income Categories
  { id: 'client_payments', name: 'Client Payments', icon: CreditCard, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'product_sales', name: 'Product Sales', icon: ShoppingBasket, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'service_revenue', name: 'Service Revenue', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'subscription_revenue', name: 'Subscription Revenue', icon: Computer, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'consulting', name: 'Consulting Revenue', icon: Users, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
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
  addCategory: (category: Category) => void;
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
  // Sync methods
  setSyncData: (key: keyof AppState, data: any) => void;
  initializeSupabaseSync: () => void;
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
      addCategory: (category) => set(state => ({ categories: [...state.categories, category] })),
      updateCategory: (category) => set(state => ({
        categories: state.categories.map(c => c.id === category.id ? category : c)
      })),
      deleteCategory: (categoryId: string) => set(state => ({
        categories: state.categories.filter(c => c.id !== categoryId)
      })),
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
        set((state) => ({ businessBudgets: [budget, ...state.businessBudgets] }));
        // TODO: Add supabase sync for business budgets when implemented
      },
      updateBusinessBudget: (budget) => {
        set(state => ({
          businessBudgets: state.businessBudgets.map(b => b.id === budget.id ? budget : b)
        }));
        // TODO: Add supabase sync for business budgets when implemented
      },
      deleteBusinessBudget: (budgetId) => {
        set(state => ({
          businessBudgets: state.businessBudgets.filter(b => b.id !== budgetId)
        }));
        // TODO: Add supabase sync for business budgets when implemented
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
      // Sync methods
      setSyncData: (key, data) => {
        set({ [key]: data });
      },
      initializeSupabaseSync: () => {
        // Set up Supabase sync event listeners
        if (typeof window !== 'undefined') {
          const handleSupabaseUpdate = (event: CustomEvent) => {
            const { key, data } = event.detail;
            get().setSyncData(key, data);
          };
          
          window.addEventListener('supabase-sync-update', handleSupabaseUpdate as EventListener);
          
          // Load offline queue
          supabaseSync.loadOfflineQueue();
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
