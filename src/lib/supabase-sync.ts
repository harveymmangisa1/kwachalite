'use client';

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
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
  TaskNote
} from '@/lib/types';
import { Briefcase } from 'lucide-react';
import { initialCategories } from './data';

// Temporary type assertion to bypass TypeScript issues
const db = supabase as any;

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
}

export class SupabaseSync {
  private user: User | null = null;
  private subscriptions: (() => void)[] = [];
  private syncState: SyncState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
  };
  private syncStateCallbacks: ((state: SyncState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.updateSyncState({ isOnline: true });
    // Sync any pending changes when coming back online
    this.syncOfflineChanges();
    
    // Also trigger a full sync to ensure data consistency across devices
    if (this.user) {
      this.updateStoreData('transactions', []);
      this.updateStoreData('bills', []);
      this.updateStoreData('savingsGoals', []);
    }
  };

  private handleOffline = () => {
    this.updateSyncState({ isOnline: false });
  };

  private updateSyncState(updates: Partial<SyncState>) {
    this.syncState = { ...this.syncState, ...updates };
    this.syncStateCallbacks.forEach(callback => callback(this.syncState));
  }

  onSyncStateChange(callback: (state: SyncState) => void): () => void {
    this.syncStateCallbacks.push(callback);
    return () => {
      const index = this.syncStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncStateCallbacks.splice(index, 1);
      }
    };
  }

  setUser(user: User | null) {
    this.user = user;
    if (user) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  // Start listening to Supabase real-time subscriptions
  private startListening() {
    if (!this.user) return;

    this.stopListening(); // Clean up existing subscriptions

    try {
      // Listen to transactions
      const transactionsSubscription = db
        .channel('transactions_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateTransactions();
          }
        )
        .subscribe();

      // Listen to bills
      const billsSubscription = db
        .channel('bills_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bills',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateBills();
          }
        )
        .subscribe();

      // Listen to savings goals
      const goalsSubscription = db
        .channel('savings_goals_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'savings_goals',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateSavingsGoals();
          }
        )
        .subscribe();

      // Listen to categories
      const categoriesSubscription = db
        .channel('categories_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'categories',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateCategories();
          }
        )
        .subscribe();

      // Listen to clients
      const clientsSubscription = db
        .channel('clients_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateClients();
          }
        )
        .subscribe();

      // Listen to products
      const productsSubscription = db
        .channel('products_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateProducts();
          }
        )
        .subscribe();

      // Listen to quotes
      const quotesSubscription = db
        .channel('quotes_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quotes',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateQuotes();
          }
        )
        .subscribe();

      // Listen to loans
      const loansSubscription = db
        .channel('loans_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loans',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateLoans();
          }
        )
        .subscribe();

      // Listen to business budgets
      const businessBudgetsSubscription = db
        .channel('business_budgets_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_budgets',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateBusinessBudgets();
          }
        )
        .subscribe();

      this.subscriptions = [
        () => db.removeChannel(transactionsSubscription),
        () => db.removeChannel(billsSubscription),
        () => db.removeChannel(goalsSubscription),
        () => db.removeChannel(categoriesSubscription),
        () => db.removeChannel(clientsSubscription),
        () => db.removeChannel(productsSubscription),
        () => db.removeChannel(quotesSubscription),
        () => db.removeChannel(loansSubscription),
        () => db.removeChannel(businessBudgetsSubscription),
      ];

      // Initial data fetch
      this.performInitialDataFetch();

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error('Error starting Supabase listeners:', error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async performInitialDataFetch() {
    try {
      await Promise.all([
        this.fetchAndUpdateTransactions(),
        this.fetchAndUpdateBills(),
        this.fetchAndUpdateSavingsGoals(),
        this.fetchAndUpdateCategories(),
        this.fetchAndUpdateClients(),
        this.fetchAndUpdateProducts(),
        this.fetchAndUpdateQuotes(),
        this.fetchAndUpdateLoans(),
        this.fetchAndUpdateBusinessBudgets(),
      ]);
    } catch (error) {
      console.error('Error in initial data fetch:', error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Failed to fetch initial data',
      });
    }
  }

  private async fetchAndUpdateTransactions() {
    if (!this.user) return;

    const { data, error } = await (db as any)
      .from('transactions')
      .select('*')
      .eq('user_id', this.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const transactions: Transaction[] = (data as any[]).map(item => ({
      id: item.id,
      date: item.date,
      description: item.description,
      amount: item.amount,
      type: (item.type as 'income' | 'expense') || 'expense',
      category: item.category || 'Other',
      workspace: (item.workspace as 'personal' | 'business') || 'personal',
    }));

    this.updateStoreData('transactions', transactions);
  }

  private async fetchAndUpdateBills() {
    if (!this.user) return;

    const { data, error } = await db
      .from('bills')
      .select('*')
      .eq('user_id', this.user.id)
      .order('due_date', { ascending: true }) as { data: Database['public']['Tables']['bills']['Row'][] | null, error: any };

    if (error) {
      console.error('Error fetching bills:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const bills: Bill[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      dueDate: item.due_date,
      status: (item.status as 'paid' | 'unpaid') || 'unpaid',
      isRecurring: item.is_recurring || false,
      recurringFrequency: item.recurring_frequency || 'monthly',
      workspace: (item.workspace as 'personal' | 'business') || 'personal',
    }));

    this.updateStoreData('bills', bills);
  }

  private async fetchAndUpdateSavingsGoals() {
    if (!this.user) return;

    const { data, error } = await db
      .from('savings_goals')
      .select('*')
      .eq('user_id', this.user.id)
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Error fetching savings goals:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const savingsGoals: SavingsGoal[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      targetAmount: item.target_amount,
      currentAmount: item.current_amount,
      deadline: item.deadline,
      type: (item.type as 'individual' | 'group') || 'individual',
      members: item.members || [],
      workspace: (item.workspace as 'personal' | 'business') || 'personal',
      items: item.items || [],
    }));

    this.updateStoreData('savingsGoals', savingsGoals);
  }

  private async fetchAndUpdateCategories(isRetry = false) {
    if (!this.user) return;

    const { data, error } = await db
      .from('categories')
      .select('*')
      .eq('user_id', this.user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    if (data && data.length === 0 && !isRetry) {
      // No categories for this user, let's seed them from initialCategories
      const newCategories = initialCategories.map(c => ({
        id: c.id,
        name: c.name,
        icon: 'folder',
        color: c.color,
        type: c.type,
        workspace: c.workspace,
        budget: c.budget,
        budget_frequency: c.budgetFrequency,
        user_id: this.user!.id,
      }));

      const { error: insertError } = await db.from('categories').insert(newCategories);

      if (insertError) {
        console.error('Error seeding categories:', insertError);
        this.updateSyncState({ syncError: insertError.message });
        return;
      }
      
      // Re-fetch after seeding
      await this.fetchAndUpdateCategories(true);
      return;
    }

    const categories: Category[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      icon: Briefcase, // Default icon - in a real app, you'd map icon names to components
      color: item.color || '#0066cc',
      type: (item.type as 'income' | 'expense') || 'expense',
      workspace: (item.workspace as 'personal' | 'business') || 'personal',
      budget: item.budget || undefined,
      budgetFrequency: item.budget_frequency || 'monthly',
    }));

    this.updateStoreData('categories', categories);
  }

  private async fetchAndUpdateClients() {
    if (!this.user) return;

    const { data, error } = await db
      .from('clients')
      .select('*')
      .eq('user_id', this.user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching clients:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const clients: Client[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || undefined,
      address: item.address || undefined,
    }));

    this.updateStoreData('clients', clients);
  }

  private async fetchAndUpdateProducts() {
    if (!this.user) return;

    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('user_id', this.user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const products: Product[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      price: item.price,
      costPrice: item.cost_price,
    }));

    this.updateStoreData('products', products);
  }

  private async fetchAndUpdateQuotes() {
    if (!this.user) return;

    const { data, error } = await db
      .from('quotes')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const quotes: Quote[] = (data || []).map((item: any) => ({
      id: item.id,
      quoteNumber: item.quote_number,
      clientId: item.client_id,
      date: item.quote_date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      expiryDate: item.valid_until,
      items: item.items || [],
      status: (item.status as 'draft' | 'sent' | 'accepted' | 'rejected') || 'draft',
    }));

    this.updateStoreData('quotes', quotes);
  }

  private async fetchAndUpdateLoans() {
    if (!this.user) return;

    const { data, error } = await db
      .from('loans')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loans:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const loans: Loan[] = (data || []).map((item: any) => ({
      id: item.id,
      lender: item.name || 'Unknown Lender',
      principal: item.principal_amount || 0,
      remainingAmount: item.remaining_amount || 0,
      interestRate: item.interest_rate || 0,
      term: item.term_months || 12,
      startDate: item.start_date,
      status: item.status === 'paid_off' ? 'paid' : 'active',
      workspace: (item.workspace as 'personal' | 'business') || 'personal',
    }));

    this.updateStoreData('loans', loans);
  }

  private async fetchAndUpdateBusinessBudgets() {
    if (!this.user) return;

    const { data, error } = await db
      .from('business_budgets')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching business budgets:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const budgets: BusinessBudget[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      budgetAmount: item.budget_amount,
      period: item.period,
      startDate: item.start_date,
      endDate: item.end_date,
      currentSpent: item.current_spent,
      workspace: 'business',
    }));

    this.updateStoreData('businessBudgets', budgets);
  }

  private stopListening() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }

  private updateStoreData(key: string, data: any) {
    // Update Zustand store directly if available, otherwise use custom event
    if (typeof window !== 'undefined') {
      try {
        // Try to get store dynamically to avoid circular imports
        const store = (window as any).__KWACHALITE_STORE__;
        if (store && store.setSyncData) {
          store.setSyncData(key, data);
          return;
        }
      } catch (error) {
        console.error('Error updating store directly:', error);
      }
      
      // Fallback to custom event
      window.dispatchEvent(
        new CustomEvent('supabase-sync-update', {
          detail: { key, data }
        })
      );
    }
  }

  // Sync methods for different data types
  async syncTransaction(transaction: Transaction, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('transactions', transaction.id, transaction, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('transactions')
          .delete()
          .eq('id', transaction.id)
          .eq('user_id', this.user.id);
        
        if (error) throw error;
      } else {
        const syncData = {
          ...transaction,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('transactions')
          .upsert(syncData, { onConflict: 'id' });
        
        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} transaction:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('transactions', transaction.id, transaction, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncBill(bill: Bill, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('bills', bill.id, bill, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('bills')
          .delete()
          .eq('id', bill.id)
          .eq('user_id', this.user.id);
        
        if (error) throw error;
      } else {
        const syncData = {
          id: bill.id,
          name: bill.name,
          amount: bill.amount,
          due_date: bill.dueDate,
          status: bill.status,
          is_recurring: bill.isRecurring,
          recurring_frequency: bill.recurringFrequency,
          workspace: bill.workspace,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('bills')
          .upsert(syncData, { onConflict: 'id' });
        
        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} bill:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('bills', bill.id, bill, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncSavingsGoal(goal: SavingsGoal, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('savings_goals', goal.id, goal, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('savings_goals')
          .delete()
          .eq('id', goal.id)
          .eq('user_id', this.user.id);
        
        if (error) throw error;
      } else {
        const syncData = {
          id: goal.id,
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline,
          type: goal.type,
          members: goal.members,
          workspace: goal.workspace,
          items: goal.items,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('savings_goals')
          .upsert(syncData, { onConflict: 'id' });
        
        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} savings goal:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('savings_goals', goal.id, goal, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncClient(client: Client, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('clients', client.id, client, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('clients')
          .delete()
          .eq('id', client.id)
          .eq('user_id', this.user.id);
        
        if (error) throw error;
      } else {
        const syncData = {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone || null,
          address: client.address || null,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('clients')
          .upsert(syncData, { onConflict: 'id' });
        
        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} client:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('clients', client.id, client, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncProduct(product: Product, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('products', product.id, product, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('products')
          .delete()
          .eq('id', product.id)
          .eq('user_id', this.user.id);
        
        if (error) throw error;
      } else {
        const syncData = {
          id: product.id,
          name: product.name,
          description: product.description || null,
          price: product.price,
          cost_price: product.cost_price || 0,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('products')
          .upsert(syncData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });
        
        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} product:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('products', product.id, product, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncQuote(quote: Quote, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('quotes', quote.id, quote, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('quotes')
          .delete()
          .eq('id', quote.id)
          .eq('user_id', this.user.id);
        
        if (error) throw error;
      } else {
        const totalAmount = quote.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const syncData = {
          id: quote.id,
          quote_number: quote.quoteNumber,
          client_id: quote.clientId,
          valid_until: quote.expiryDate,
          quote_date: quote.date,
          items: quote.items,
          total_amount: totalAmount,
          status: quote.status,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('quotes')
          .upsert(syncData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });
        
        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} quote:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('quotes', quote.id, quote, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncLoan(loan: Loan, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('loans', loan.id, loan, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('loans')
          .delete()
          .eq('id', loan.id)
          .eq('user_id', this.user.id);
        
        if (error) throw error;
      } else {
        const syncData = {
          id: loan.id,
          name: loan.lender,
          principal_amount: loan.principal,
          remaining_amount: loan.remainingAmount,
          interest_rate: loan.interestRate,
          term_months: loan.term,
          start_date: loan.startDate,
          status: loan.status === 'paid' ? 'paid_off' : 'active',
          workspace: loan.workspace,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('loans')
          .upsert(syncData, { onConflict: 'id' });
        
        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} loan:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('loans', loan.id, loan, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncCategory(category: Category, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('categories', category.id, category, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('categories')
          .delete()
          .eq('id', category.id)
          .eq('user_id', this.user.id);
        
        if (error) throw error;
      } else {
        const syncData = {
          id: category.id,
          name: category.name,
          icon: 'folder', // Store default icon name as string
          color: category.color,
          type: category.type,
          workspace: category.workspace,
          budget: category.budget || null,
          budget_frequency: category.budgetFrequency || 'monthly',
          user_id: this.user.id,
        };

        const { error } = await db
          .from('categories')
          .upsert(syncData, { onConflict: 'id' });
        
        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} category:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('categories', category.id, category, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncBusinessBudget(budget: BusinessBudget, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('business_budgets', budget.id, budget, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('business_budgets')
          .delete()
          .eq('id', budget.id)
          .eq('user_id', this.user.id);
        
        if (error) throw error;
      } else {
        const syncData = {
          id: budget.id,
          name: budget.name,
          category: budget.category,
          budget_amount: budget.budgetAmount,
          period: budget.period,
          start_date: budget.startDate,
          end_date: budget.endDate,
          current_spent: budget.currentSpent,
          workspace: budget.workspace,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('business_budgets')
          .upsert(syncData, { onConflict: 'id' });
        
        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} business budget:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('business_budgets', budget.id, budget, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  // Offline support
  private offlineQueue: Array<{
    collection: string;
    id: string;
    data: any;
    operation: 'create' | 'update' | 'delete';
    timestamp: Date;
  }> = [];

  private queueOfflineOperation(
    collection: string,
    id: string,
    data: any,
    operation: 'create' | 'update' | 'delete'
  ) {
    this.offlineQueue.push({
      collection,
      id,
      data,
      operation,
      timestamp: new Date(),
    });

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('db-sync-queue', JSON.stringify(this.offlineQueue));
    }
  }

  private async syncOfflineChanges() {
    if (!this.user || this.offlineQueue.length === 0) return;

    this.updateSyncState({ isSyncing: true });

    try {
      // Process offline queue operations
      for (const operation of this.offlineQueue) {
        if (operation.collection === 'transactions') {
          await this.syncTransaction(operation.data, operation.operation);
        } else if (operation.collection === 'bills') {
          await this.syncBill(operation.data, operation.operation);
        } else if (operation.collection === 'quotes') {
          await this.syncQuote(operation.data, operation.operation);
        } else if (operation.collection === 'categories') {
          await this.syncCategory(operation.data, operation.operation);
        } else if (operation.collection === 'business_budgets') {
          await this.syncBusinessBudget(operation.data, operation.operation);
        } else if (operation.collection === 'savings_goals') {
            await this.syncSavingsGoal(operation.data, operation.operation);
        }
        // Add other collection types as needed
      }

      // Clear the queue
      this.offlineQueue = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('db-sync-queue');
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error('Error syncing offline changes:', error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Failed to sync offline changes',
      });
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  // Load offline queue from localStorage
  loadOfflineQueue() {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('db-sync-queue');
    if (saved) {
      try {
        this.offlineQueue = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading offline queue:', error);
        localStorage.removeItem('db-sync-queue');
      }
    }
  }

  // Data loading functions for multi-device sync
  async loadUserData() {
    if (!this.user) return null;

    try {
      // Focus on core data types first
      const [
        transactionsData,
        billsData,
        savingsGoalsData
      ] = await Promise.all([
        db.from('transactions').select('*').eq('user_id', this.user.id),
        db.from('bills').select('*').eq('user_id', this.user.id),
        db.from('savings_goals').select('*').eq('user_id', this.user.id)
      ]);

      return {
        transactions: this.transformTransactions(transactionsData.data || []),
        bills: this.transformBills(billsData.data || []),
        savingsGoals: this.transformSavingsGoals(savingsGoalsData.data || [])
      };
    } catch (error) {
      console.error('Error loading user data from Supabase:', error);
      return null;
    }
  }

  // Transform functions to convert Supabase data to app format
  private transformTransactions(data: any[]): Transaction[] {
    return data.map(item => ({
      id: item.id,
      type: item.type,
      amount: item.amount,
      description: item.description,
      category: item.category,
      workspace: item.workspace,
      date: item.date,
      created_at: item.created_at
    }));
  }

  private transformBills(data: any[]): Bill[] {
    return data.map(item => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      dueDate: item.due_date,
      status: item.status || 'unpaid',
      isRecurring: item.is_recurring || false,
      recurringFrequency: item.recurring_frequency,
      workspace: item.workspace || 'personal'
    }));
  }

  private transformSavingsGoals(data: any[]): SavingsGoal[] {
    return data.map(item => ({
      id: item.id,
      name: item.name,
      targetAmount: item.target_amount,
      currentAmount: item.current_amount,
      deadline: item.deadline,
      type: item.type,
      members: item.members,
      workspace: item.workspace,
      items: item.items
    }));
  }

  // Clean up
  destroy() {
    this.stopListening();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  getSyncState(): SyncState {
    return { ...this.syncState };
  }
}

// Singleton instance
let supabaseSyncInstance: SupabaseSync | null = null;

export const supabaseSync = (() => {
  if (supabaseSyncInstance) return supabaseSyncInstance;
  supabaseSyncInstance = new SupabaseSync();
  return supabaseSyncInstance;
})();

export const dbSync = supabaseSync;
