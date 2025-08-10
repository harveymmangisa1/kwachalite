
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Transaction, Bill, SavingsGoal, Client, Product, Quote, Loan, Category } from './types';
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

// Define the initial categories, which are static and don't need to be in the store.
export const initialCategories: Category[] = [
  // Personal Expense Categories
  { id: 'groceries', name: 'Groceries', icon: ShoppingBasket, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: 75000, budgetFrequency: 'monthly' },
  { id: 'transport', name: 'Transport', icon: Car, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal', budget: 30000, budgetFrequency: 'monthly' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'personal', budget: 150000, budgetFrequency: 'monthly' },
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal', budget: 100000, budgetFrequency: 'monthly' },
  { id: 'health', name: 'Health', icon: Heart, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'personal' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: 50000, budgetFrequency: 'monthly' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal' },
  { id: 'gifts', name: 'Gifts', icon: Gift, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal' },
  
  // Personal Income Categories
  { id: 'salary', name: 'Salary', icon: Landmark, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'freelance_personal', name: 'Freelance', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'investment', name: 'Investment', icon: TrendingUp, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'side_hustle', name: 'Side Hustle', icon: PiggyBank, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },

  // Business Expense Categories
  { id: 'office_supplies', name: 'Office Supplies', icon: Briefcase, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business', budget: 50000, budgetFrequency: 'monthly' },
  { id: 'software', name: 'Software & Subscriptions', icon: Computer, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'business', budget: 25000, budgetFrequency: 'monthly' },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'business' },
  { id: 'travel', name: 'Business Travel', icon: Car, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'business' },
  { id: 'client_expenses', name: 'Client Expenses', icon: Users, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'business' },
  { id: 'shipping', name: 'Shipping & Delivery', icon: Truck, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business' },

  // Business Income Categories
  { id: 'client_payments', name: 'Client Payments', icon: CreditCard, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'product_sales', name: 'Product Sales', icon: ShoppingBasket, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
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
  addTransaction: (transaction: Transaction) => void;
  addBill: (bill: Bill) => void;
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (goalId: string, amount: number) => void;
  addClient: (client: Client) => void;
  addProduct: (product: Product) => void;
  addQuote: (quote: Quote) => void;
  addLoan: (loan: Loan) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addCategory: (category: Category) => void;
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
      addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions] })),
      addBill: (bill) => set((state) => ({ bills: [bill, ...state.bills] })),
      addSavingsGoal: (goal) => set((state) => ({ savingsGoals: [goal, ...state.savingsGoals] })),
      updateSavingsGoal: (goalId, amount) => set((state) => ({
        savingsGoals: state.savingsGoals.map(g => 
          g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
        )
      })),
      addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
      addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
      addQuote: (quote) => set((state) => ({ quotes: [quote, ...state.quotes] })),
      addLoan: (loan) => set((state) => ({ loans: [loan, ...state.loans] })),
      addCategory: (category) => set(state => ({ categories: [...state.categories, category] })),
      updateCategory: (category) => set(state => ({
        categories: state.categories.map(c => c.id === category.id ? category : c)
      })),
      deleteCategory: (categoryId: string) => set(state => ({
        categories: state.categories.filter(c => c.id !== categoryId)
      })),
    }),
    {
      name: 'kwachalite-storage', // name of the item in storage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
