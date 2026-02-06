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
// // import { Briefcase } from 'lucide-react'; // Using default icon
import { initialCategories } from './data';

// Import crypto for ID generation
const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

// Temporary type assertion to bypass TypeScript issues
const db = supabase as any;

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
}

export class SupabaseSync {
  private readonly storeKeyToCollection: Record<string, string> = {
    transactions: 'transactions',
    bills: 'bills',
    savingsGoals: 'savings_goals',
    categories: 'categories',
    clients: 'clients',
    products: 'products',
    quotes: 'quotes',
    loans: 'loans',
    businessBudgets: 'business_budgets',
    salesReceipts: 'sales_receipts',
    deliveryNotes: 'delivery_notes',
    businessRevenues: 'business_revenues',
    businessExpenses: 'business_expenses',
    savingsGroups: 'savings_groups',
    groupMembers: 'group_members',
    groupInvitations: 'group_invitations',
    groupContributions: 'group_contributions',
    groupActivities: 'group_activities',
    projects: 'projects',
    invoices: 'invoices',
    clientPayments: 'client_payments',
    clientExpenses: 'client_expenses',
    communicationLogs: 'communication_logs',
    tasks: 'task_notes',
  };
  private user: User | null = null;
  private missingTables = new Set<string>();
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
      this.loadOfflineQueue();
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
      this.loadOfflineQueue();
      void this.startListening();
    } else {
      this.stopListening();
    }
  }

  // Start listening to Supabase real-time subscriptions
  private async startListening() {
    if (!this.user) return;

    this.stopListening(); // Clean up existing subscriptions

    try {
      await this.syncOfflineChanges();
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

      // Listen to sales receipts
      const salesReceiptsSubscription = db
        .channel('sales_receipts_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sales_receipts',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateSalesReceipts();
          }
        )
        .subscribe();

      // Listen to delivery notes
      const deliveryNotesSubscription = db
        .channel('delivery_notes_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'delivery_notes',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateDeliveryNotes();
          }
        )
        .subscribe();

      // Listen to business revenues
      const businessRevenuesSubscription = db
        .channel('business_revenues_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_revenues',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateBusinessRevenues();
          }
        )
        .subscribe();

      // Listen to business expenses
      const businessExpensesSubscription = db
        .channel('business_expenses_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_expenses',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateBusinessExpenses();
          }
        )
        .subscribe();

      // Listen to savings groups
      const savingsGroupsSubscription = db
        .channel('savings_groups_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'savings_groups',
          },
          async () => {
            await this.fetchAndUpdateSavingsGroups();
          }
        )
        .subscribe();
      
      // Listen to group members
      const groupMembersSubscription = db
        .channel('group_members_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_members',
          },
          async () => {
            await this.fetchAndUpdateGroupMembers();
          }
        )
        .subscribe();

      // Listen to group invitations
      const groupInvitationsSubscription = db
        .channel('group_invitations_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_invitations',
          },
          async () => {
            await this.fetchAndUpdateGroupInvitations();
          }
        )
        .subscribe();

      // Listen to group contributions
      const groupContributionsSubscription = db
        .channel('group_contributions_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_contributions',
          },
          async () => {
            await this.fetchAndUpdateGroupContributions();
          }
        )
        .subscribe();
      
      // Listen to group activities
      const groupActivitiesSubscription = db
        .channel('group_activities_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_activities',
          },
          async () => {
            await this.fetchAndUpdateGroupActivities();
          }
        )
        .subscribe();

      // Listen to projects
      const projectsSubscription = db
        .channel('projects_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateProjects();
          }
        )
        .subscribe();

      // Listen to invoices
      const invoicesSubscription = db
        .channel('invoices_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invoices',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateInvoices();
          }
        )
        .subscribe();

      // Listen to client payments
      const clientPaymentsSubscription = db
        .channel('client_payments_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'client_payments',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateClientPayments();
          }
        )
        .subscribe();
      
      // Listen to client expenses
      const clientExpensesSubscription = db
        .channel('client_expenses_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'client_expenses',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateClientExpenses();
          }
        )
        .subscribe();

      // Listen to communication logs
      const communicationLogsSubscription = db
        .channel('communication_logs_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'communication_logs',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateCommunicationLogs();
          }
        )
        .subscribe();

      // Listen to task notes
      const taskNotesSubscription = db
        .channel('task_notes_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'task_notes',
            filter: `user_id=eq.${this.user.id}`,
          },
          async () => {
            await this.fetchAndUpdateTaskNotes();
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
        () => db.removeChannel(salesReceiptsSubscription),
        () => db.removeChannel(deliveryNotesSubscription),
        () => db.removeChannel(businessRevenuesSubscription),
        () => db.removeChannel(businessExpensesSubscription),
        () => db.removeChannel(savingsGroupsSubscription),
        () => db.removeChannel(groupMembersSubscription),
        () => db.removeChannel(groupInvitationsSubscription),
        () => db.removeChannel(groupContributionsSubscription),
        () => db.removeChannel(groupActivitiesSubscription),
        () => db.removeChannel(projectsSubscription),
        () => db.removeChannel(invoicesSubscription),
        () => db.removeChannel(clientPaymentsSubscription),
        () => db.removeChannel(clientExpensesSubscription),
        () => db.removeChannel(communicationLogsSubscription),
        () => db.removeChannel(taskNotesSubscription),
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
        this.fetchAndUpdateSalesReceipts(),
        this.fetchAndUpdateDeliveryNotes(),
        this.fetchAndUpdateBusinessRevenues(),
        this.fetchAndUpdateBusinessExpenses(),
        this.fetchAndUpdateSavingsGroups(),
        this.fetchAndUpdateGroupMembers(),
        this.fetchAndUpdateGroupInvitations(),
        this.fetchAndUpdateGroupContributions(),
        this.fetchAndUpdateGroupActivities(),
        this.fetchAndUpdateProjects(),
        this.fetchAndUpdateInvoices(),
        this.fetchAndUpdateClientPayments(),
        this.fetchAndUpdateClientExpenses(),
        this.fetchAndUpdateCommunicationLogs(),
        this.fetchAndUpdateTaskNotes(),
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
    if (this.shouldSkipTable('transactions')) return;

    const { data, error } = await (db as any)
      .from('transactions')
      .select('*')
      .eq('user_id', this.user.id)
      .order('date', { ascending: false });

    if (error) {
      if (this.handleMissingTableError('transactions', error)) {
        return;
      }
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
      category_id: item.category_id || '',
    }));

    this.updateStoreData('transactions', transactions);
  }

  private async fetchAndUpdateBills() {
    if (!this.user) return;
    if (this.shouldSkipTable('bills')) return;

    const { data, error } = await db
      .from('bills')
      .select('*')
      .eq('user_id', this.user.id)
      .order('due_date', { ascending: true }) as { data: Database['public']['Tables']['bills']['Row'][] | null, error: any };

    if (error) {
      if (this.handleMissingTableError('bills', error)) {
        return;
      }
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
    if (this.shouldSkipTable('savings_goals')) return;

    const { data, error } = await db
      .from('savings_goals')
      .select('*')
      .eq('user_id', this.user.id)
      .order('deadline', { ascending: true });

    if (error) {
      if (this.handleMissingTableError('savings_goals', error)) {
        return;
      }
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
    if (this.shouldSkipTable('categories')) return;

    const { data, error } = await db
      .from('categories')
      .select('*')
      .eq('user_id', this.user.id)
      .order('name', { ascending: true });

    if (error) {
      if (this.handleMissingTableError('categories', error)) {
        return;
      }
      console.error('Error fetching categories:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    if (data && data.length === 0 && !isRetry) {
      // No categories for this user, let's seed them from initialCategories
      const newCategories = initialCategories.map(c => ({
        id: createId(),
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
      icon: 'folder', // Default icon - in a real app, you'd map icon names to components
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
    if (this.shouldSkipTable('clients')) return;

    const { data, error } = await db
      .from('clients')
      .select('*')
      .eq('user_id', this.user.id)
      .order('name', { ascending: true });

    if (error) {
      if (this.handleMissingTableError('clients', error)) {
        return;
      }
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
    if (this.shouldSkipTable('products')) return;

    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('user_id', this.user.id)
      .order('name', { ascending: true });

    if (error) {
      if (this.handleMissingTableError('products', error)) {
        return;
      }
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
    if (this.shouldSkipTable('quotes')) return;

    const { data, error } = await db
      .from('quotes')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (this.handleMissingTableError('quotes', error)) {
        return;
      }
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
    if (this.shouldSkipTable('loans')) return;

    const { data, error } = await db
      .from('loans')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (this.handleMissingTableError('loans', error)) {
        return;
      }
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
    if (this.shouldSkipTable('business_budgets')) return;

    const { data, error } = await db
      .from('business_budgets')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (this.handleMissingTableError('business_budgets', error)) {
        return;
      }
      console.error('Error fetching business budgets:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const budgets: BusinessBudget[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name ?? item.category,
      category: item.category,
      budgetAmount: item.budget_amount,
      period: item.period,
      startDate: item.start_date,
      endDate: item.end_date,
      currentSpent: item.current_spent ?? item.spent_amount ?? 0,
      workspace: 'business',
    }));

    this.updateStoreData('businessBudgets', budgets);
  }


  private async fetchAndUpdateSalesReceipts() {
    if (!this.user) return;
    if (this.shouldSkipTable('sales_receipts')) return;
    const { data, error } = await db
      .from('sales_receipts')
      .select('*')
      .eq('user_id', this.user.id)
      .order('date', { ascending: false });
    if (error) {
      if (this.handleMissingTableError('sales_receipts', error)) {
        return;
      }
      console.error('Error fetching sales receipts:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const receipts: SalesReceipt[] = (data || []).map((item: any) => ({
      id: item.id,
      receiptNumber: item.receipt_number,
      invoiceId: item.invoice_id,
      quoteId: item.quote_id,
      clientId: item.client_id,
      date: item.date ?? item.sale_date,
      amount: item.amount,
      paymentMethod: item.payment_method || 'other',
      referenceNumber: item.reference_number,
      notes: item.notes ?? item.description,
      status: item.status || 'confirmed',
    }));
    this.updateStoreData('salesReceipts', receipts);
  }

  private async fetchAndUpdateDeliveryNotes() {
    if (!this.user) return;
    if (this.shouldSkipTable('delivery_notes')) return;
    const { data, error } = await db
      .from('delivery_notes')
      .select('*')
      .eq('user_id', this.user.id)
      .order('date', { ascending: false });
    if (error) {
      if (this.handleMissingTableError('delivery_notes', error)) {
        return;
      }
      console.error('Error fetching delivery notes:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const notes: DeliveryNote[] = (data || []).map((item: any) => ({
      id: item.id,
      deliveryNoteNumber: item.delivery_note_number || item.delivery_number,
      invoiceId: item.invoice_id,
      quoteId: item.quote_id,
      clientId: item.client_id,
      date: item.date ?? item.delivery_date,
      deliveryDate: item.delivery_date,
      deliveryAddress: item.delivery_address || '',
      items: item.items,
      deliveryMethod: item.delivery_method || 'delivery',
      trackingNumber: item.tracking_number,
      notes: item.notes,
      status: item.status || 'delivered',
      receivedBy: item.received_by,
      receivedAt: item.received_at,
    }));
    this.updateStoreData('deliveryNotes', notes);
  }

  private async fetchAndUpdateBusinessRevenues() {
    if (!this.user) return;
    if (this.shouldSkipTable('business_revenues')) return;
    const { data, error } = await db
      .from('business_revenues')
      .select('*')
      .eq('user_id', this.user.id)
      .order('date', { ascending: false });
    if (error) {
      if (this.handleMissingTableError('business_revenues', error)) {
        return;
      }
      console.error('Error fetching business revenues:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const revenues: BusinessRevenue[] = (data || []).map((item: any) => ({
      id: item.id,
      source: item.source || 'direct',
      sourceId: item.source_id,
      clientId: item.client_id,
      amount: item.amount,
      date: item.date ?? item.revenue_date,
      description: item.description,
      category: item.category,
      status: item.status || 'received',
      paymentMethod: item.payment_method,
    }));
    this.updateStoreData('businessRevenues', revenues);
  }

  private async fetchAndUpdateBusinessExpenses() {
    if (!this.user) return;
    if (this.shouldSkipTable('business_expenses')) return;
    const { data, error } = await db
      .from('business_expenses')
      .select('*')
      .eq('user_id', this.user.id)
      .order('date', { ascending: false });
    if (error) {
      if (this.handleMissingTableError('business_expenses', error)) {
        return;
      }
      console.error('Error fetching business expenses:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const expenses: BusinessExpense[] = (data || []).map((item: any) => ({
      id: item.id,
      vendor: item.vendor,
      amount: item.amount,
      date: item.date ?? item.expense_date,
      description: item.description,
      category: item.category,
      receiptUrl: item.receipt_url,
      taxDeductible: item.tax_deductible ?? false,
      status: item.status || 'paid',
      paymentMethod: item.payment_method,
    }));
    this.updateStoreData('businessExpenses', expenses);
  }

  private async fetchAndUpdateSavingsGroups() {
    if (!this.user) return;
    if (this.shouldSkipTable('savings_groups')) return;
    // This needs to fetch groups where the user is a member, not just the creator
    const { data, error } = await db
      .rpc('get_user_savings_groups');
    if (error) {
      if (this.handleMissingTableError('savings_groups', error)) {
        return;
      }
      console.error('Error fetching savings groups:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }

    const groups: SavingsGroup[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      targetAmount: item.target_amount,
      currentAmount: item.current_amount,
      deadline: item.deadline,
      createdBy: item.created_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      isPublic: item.is_public,
      status: item.status,
      currency: item.currency,
      contributionRules: item.contribution_rules,
    }));
    
    this.updateStoreData('savingsGroups', groups);
  }

  private async fetchAndUpdateGroupMembers() {
    if (!this.user) return;
    if (this.shouldSkipTable('group_members')) return;
     const { data, error } = await db
      .from('group_members')
      .select('*')
    if (error) {
      if (this.handleMissingTableError('group_members', error)) {
        return;
      }
      console.error('Error fetching group members:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const members: GroupMember[] = (data || []).map((item: any) => ({
      id: item.id,
      groupId: item.group_id,
      userId: item.user_id,
      name: item.name,
      email: item.email,
      role: item.role,
      joinedAt: item.joined_at,
      totalContributed: item.total_contributed,
      lastContributionAt: item.last_contribution_at,
      status: item.status,
    }));
    this.updateStoreData('groupMembers', members);
  }

  private async fetchAndUpdateGroupInvitations() {
    if (!this.user) return;
    if (this.shouldSkipTable('group_invitations')) return;
    const { data, error } = await db
      .from('group_invitations')
      .select('*')
      .or(`invited_by.eq.${this.user.id},invited_email.eq.${this.user.email}`);
    if (error) {
      if (this.handleMissingTableError('group_invitations', error)) {
        return;
      }
      console.error('Error fetching group invitations:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const invitations: GroupInvitation[] = (data || []).map((item: any) => ({
        id: item.id,
        groupId: item.group_id,
        invitedBy: item.invited_by,
        invitedEmail: item.invited_email,
        token: item.token,
        status: item.status,
        message: item.message,
        expiresAt: item.expires_at,
        acceptedAt: item.accepted_at,
    }));
    this.updateStoreData('groupInvitations', invitations);
  }

  private async fetchAndUpdateGroupContributions() {
    if (!this.user) return;
    if (this.shouldSkipTable('group_contributions')) return;
    // This is tricky, we need to get contributions for groups the user is in.
    // Let's assume an RPC or a more complex query is needed. For now, fetch all in user's groups.
     const { data: groupIds, error: groupIdsError } = await db
      .from('group_members')
      .select('group_id')
      .eq('user_id', this.user.id);
    if (groupIdsError) {
      console.error('Error fetching user group IDs:', groupIdsError);
      return;
     }
     const ids = groupIds.map((g: any) => g.group_id);
     const { data, error } = await db
       .from('group_contributions')
       .select('*')
       .in('group_id', ids)
    if (error) {
      if (this.handleMissingTableError('group_contributions', error)) {
        return;
      }
      console.error('Error fetching group contributions:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const contributions: GroupContribution[] = (data || []).map((item: any) => ({
      id: item.id,
      groupId: item.group_id,
      memberId: item.member_id,
      amount: item.amount,
      description: item.description,
      contributedAt: item.contributed_at,
      method: item.method,
      status: item.status,
      confirmedBy: item.confirmed_by,
      confirmedAt: item.confirmed_at,
      proofFile: item.proof_file,
      proofUrl: item.proof_url,
      rejectionReason: item.rejection_reason,
    }));
    this.updateStoreData('groupContributions', contributions);
  }

    private async fetchAndUpdateGroupActivities() {
    if (!this.user) return;
    if (this.shouldSkipTable('group_activities')) return;
    const { data: groupIds, error: groupIdsError } = await db
      .from('group_members')
      .select('group_id')
      .eq('user_id', this.user.id);
    if (groupIdsError) {
      console.error('Error fetching user group IDs for activities:', groupIdsError);
      return;
     }
     const ids = groupIds.map((g: any) => g.group_id);
     const { data, error } = await db
       .from('group_activities')
       .select('*')
       .in('group_id', ids);

    if (error) {
      if (this.handleMissingTableError('group_activities', error)) {
        return;
      }
      console.error('Error fetching group activities:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const activities: GroupActivity[] = (data || []).map((item: any) => ({
        id: item.id,
        groupId: item.group_id,
        type: item.type,
        userId: item.user_id,
        description: item.description,
        metadata: item.metadata,
    }));
    this.updateStoreData('groupActivities', activities);
  }

  private async fetchAndUpdateProjects() {
    if (!this.user) return;
    if (this.shouldSkipTable('projects')) return;
    const { data, error } = await db
      .from('projects')
      .select('*')
      .eq('user_id', this.user.id);
    if (error) {
      if (this.handleMissingTableError('projects', error)) {
        return;
      }
      console.error('Error fetching projects:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const projects: Project[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      client_id: item.client_id,
      status: item.status,
      start_date: item.start_date,
      end_date: item.end_date,
      budget: item.budget,
      actual_cost: item.actual_cost,
      priority: item.priority,
    }));
    this.updateStoreData('projects', projects);
  }

  private async fetchAndUpdateInvoices() {
    if (!this.user) return;
    if (this.shouldSkipTable('invoices')) return;
    const { data, error } = await db
      .from('invoices')
      .select('*')
      .eq('user_id', this.user.id);
    if (error) {
      if (this.handleMissingTableError('invoices', error)) {
        return;
      }
      console.error('Error fetching invoices:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const invoices: Invoice[] = (data || []).map((item: any) => ({
        id: item.id,
        invoice_number: item.invoice_number,
        client_id: item.client_id,
        project_id: item.project_id,
        issue_date: item.issue_date,
        due_date: item.due_date,
        status: item.status,
        subtotal: item.subtotal,
        tax_rate: item.tax_rate,
        tax_amount: item.tax_amount,
        total_amount: item.total_amount,
        paid_amount: item.paid_amount,
        notes: item.notes,
        items: item.items,
    }));
    this.updateStoreData('invoices', invoices);
  }

  private async fetchAndUpdateClientPayments() {
    if (!this.user) return;
    if (this.shouldSkipTable('client_payments')) return;
    const { data, error } = await db
      .from('client_payments')
      .select('*')
      .eq('user_id', this.user.id);
    if (error) {
      if (this.handleMissingTableError('client_payments', error)) {
        return;
      }
      console.error('Error fetching client payments:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const payments: ClientPayment[] = (data || []).map((item: any) => ({
        id: item.id,
        client_id: item.client_id,
        project_id: item.project_id,
        invoice_id: item.invoice_id,
        amount: item.amount,
        payment_date: item.payment_date,
        status: item.status,
        payment_method: item.payment_method,
        reference_number: item.reference_number,
        description: item.description,
    }));
    this.updateStoreData('payments', payments);
  }

  private async fetchAndUpdateClientExpenses() {
    if (!this.user) return;
    if (this.shouldSkipTable('client_expenses')) return;
    const { data, error } = await db
      .from('client_expenses')
      .select('*')
      .eq('user_id', this.user.id);
    if (error) {
      if (this.handleMissingTableError('client_expenses', error)) {
        return;
      }
      console.error('Error fetching client expenses:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const expenses: ClientExpense[] = (data || []).map((item: any) => ({
        id: item.id,
        client_id: item.client_id,
        project_id: item.project_id,
        amount: item.amount,
        expense_date: item.expense_date,
        category: item.category,
        description: item.description,
        vendor: item.vendor,
        receipt_url: item.receipt_url,
        is_billable: item.is_billable,
    }));
    this.updateStoreData('expenses', expenses);
  }

  private async fetchAndUpdateCommunicationLogs() {
    if (!this.user) return;
    if (this.shouldSkipTable('communication_logs')) return;
    const { data, error } = await db
      .from('communication_logs')
      .select('*')
      .eq('user_id', this.user.id);
    if (error) {
      if (this.handleMissingTableError('communication_logs', error)) {
        return;
      }
      console.error('Error fetching communication logs:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const logs: CommunicationLog[] = (data || []).map((item: any) => ({
        id: item.id,
        client_id: item.client_id,
        project_id: item.project_id,
        type: item.type,
        subject: item.subject,
        content: item.content,
        communication_date: item.communication_date,
        direction: item.direction,
        duration_minutes: item.duration_minutes,
        next_follow_up: item.next_follow_up,
    }));
    this.updateStoreData('communications', logs);
  }

  private async fetchAndUpdateTaskNotes() {
    if (!this.user) return;
    if (this.shouldSkipTable('task_notes')) return;
    const { data, error } = await db
      .from('task_notes')
      .select('*')
      .eq('user_id', this.user.id);
    if (error) {
      if (this.handleMissingTableError('task_notes', error)) {
        return;
      }
      console.error('Error fetching task notes:', error);
      this.updateSyncState({ syncError: error.message });
      return;
    }
    const tasks: TaskNote[] = (data || []).map((item: any) => ({
        id: item.id,
        client_id: item.client_id,
        project_id: item.project_id,
        title: item.title,
        description: item.description,
        priority: item.priority,
        status: item.status,
        due_date: item.due_date,
        completed_date: item.completed_date,
    }));
    this.updateStoreData('tasks', tasks);
  }

  private stopListening() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }

  private shouldSkipTable(table: string) {
    return this.missingTables.has(table);
  }

  private handleMissingTableError(table: string, error: any) {
    const message = error?.message ?? '';
    if (error?.code === '42P01' || message.includes('does not exist')) {
      this.missingTables.add(table);
      console.warn(`Skipping sync for missing table: ${table}`, error);
      return true;
    }
    return false;
  }

  private updateStoreData(key: string, data: any) {
    // Update Zustand store directly if available, otherwise use custom event
    if (typeof window !== 'undefined') {
      try {
        if (Array.isArray(data) && data.length === 0) {
          const collection = this.storeKeyToCollection[key];
          if (collection && this.hasPendingOperationsFor(collection)) {
            return;
          }
        }

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

  private hasPendingOperationsFor(collection: string) {
    return this.offlineQueue.some(operation => operation.collection === collection);
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
          name: budget.name || null,
          category: budget.category,
          budget_amount: budget.budgetAmount,
          period: budget.period,
          start_date: budget.startDate,
          end_date: budget.endDate,
          current_spent: budget.currentSpent,
          spent_amount: budget.currentSpent,
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

  // ============================================
  // SALES RECEIPTS SYNC
  // ============================================
  async syncSalesReceipt(receipt: SalesReceipt, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('sales_receipts', receipt.id, receipt, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('sales_receipts')
          .delete()
          .eq('id', receipt.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: receipt.id,
          receipt_number: receipt.receiptNumber,
          invoice_id: receipt.invoiceId || null,
          quote_id: receipt.quoteId || null,
          client_id: receipt.clientId,
          date: receipt.date,
          sale_date: receipt.date,
          amount: receipt.amount,
          payment_method: receipt.paymentMethod,
          reference_number: receipt.referenceNumber || null,
          notes: receipt.notes || null,
          status: receipt.status,
          description: receipt.notes || null,
          category: null,
          items: null,
          workspace: 'business',
          user_id: this.user.id,
        };

        const { error } = await db
          .from('sales_receipts')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} sales receipt:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('sales_receipts', receipt.id, receipt, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  // ============================================
  // DELIVERY NOTES SYNC
  // ============================================
  async syncDeliveryNote(deliveryNote: DeliveryNote, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('delivery_notes', deliveryNote.id, deliveryNote, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('delivery_notes')
          .delete()
          .eq('id', deliveryNote.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: deliveryNote.id,
          delivery_note_number: deliveryNote.deliveryNoteNumber,
          delivery_number: deliveryNote.deliveryNoteNumber,
          invoice_id: deliveryNote.invoiceId || null,
          quote_id: deliveryNote.quoteId || null,
          client_id: deliveryNote.clientId,
          date: deliveryNote.date,
          delivery_date: deliveryNote.deliveryDate,
          delivery_address: deliveryNote.deliveryAddress,
          items: deliveryNote.items,
          delivery_method: deliveryNote.deliveryMethod,
          tracking_number: deliveryNote.trackingNumber || null,
          notes: deliveryNote.notes || null,
          status: deliveryNote.status,
          received_by: deliveryNote.receivedBy || null,
          received_at: deliveryNote.receivedAt || null,
          workspace: 'business',
          user_id: this.user.id,
        };

        const { error } = await db
          .from('delivery_notes')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} delivery note:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('delivery_notes', deliveryNote.id, deliveryNote, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  // ============================================
  // BUSINESS REVENUE SYNC
  // ============================================
  async syncBusinessRevenue(revenue: BusinessRevenue, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('business_revenues', revenue.id, revenue, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('business_revenues')
          .delete()
          .eq('id', revenue.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: revenue.id,
          source: revenue.source,
          source_id: revenue.sourceId || null,
          client_id: revenue.clientId || null,
          amount: revenue.amount,
          date: revenue.date,
          revenue_date: revenue.date,
          description: revenue.description,
          category: revenue.category,
          status: revenue.status,
          payment_method: revenue.paymentMethod || null,
          workspace: 'business',
          user_id: this.user.id,
        };

        const { error } = await db
          .from('business_revenues')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} business revenue:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('business_revenues', revenue.id, revenue, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  // ============================================
  // BUSINESS EXPENSE SYNC
  // ============================================
  async syncBusinessExpense(expense: BusinessExpense, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('business_expenses', expense.id, expense, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('business_expenses')
          .delete()
          .eq('id', expense.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: expense.id,
          vendor: expense.vendor || null,
          amount: expense.amount,
          date: expense.date,
          expense_date: expense.date,
          description: expense.description,
          category: expense.category,
          receipt_url: expense.receiptUrl || null,
          tax_deductible: expense.taxDeductible,
          status: expense.status,
          payment_method: expense.paymentMethod || null,
          workspace: 'business',
          user_id: this.user.id,
        };

        const { error } = await db
          .from('business_expenses')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} business expense:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('business_expenses', expense.id, expense, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  // ============================================
  // GROUP SAVINGS SYNC
  // ============================================
  async syncSavingsGroup(group: SavingsGroup, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('savings_groups', group.id, group, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('savings_groups')
          .delete()
          .eq('id', group.id)
          .eq('created_by', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: group.id,
          name: group.name,
          description: group.description || null,
          target_amount: group.targetAmount,
          current_amount: group.currentAmount,
          deadline: group.deadline || null,
          created_by: group.createdBy,
          is_public: group.isPublic,
          status: group.status,
          currency: group.currency || 'USD',
          contribution_rules: group.contributionRules || null,
        };

        const { error } = await db
          .from('savings_groups')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} savings group:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('savings_groups', group.id, group, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncGroupMember(member: GroupMember, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('group_members', member.id, member, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('group_members')
          .delete()
          .eq('id', member.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: member.id,
          group_id: member.groupId,
          user_id: member.userId,
          name: member.name,
          email: member.email,
          role: member.role,
          joined_at: member.joinedAt,
          total_contributed: member.totalContributed,
          last_contribution_at: member.lastContributionAt || null,
          status: member.status,
        };

        const { error } = await db
          .from('group_members')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} group member:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('group_members', member.id, member, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncGroupInvitation(invitation: GroupInvitation, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('group_invitations', invitation.id, invitation, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('group_invitations')
          .delete()
          .eq('id', invitation.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: invitation.id,
          group_id: invitation.groupId,
          invited_by: invitation.invitedBy,
          invited_email: invitation.invitedEmail,
          token: invitation.token,
          status: invitation.status,
          message: invitation.message || null,
          expires_at: invitation.expiresAt,
          accepted_at: invitation.acceptedAt || null,
        };

        const { error } = await db
          .from('group_invitations')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} group invitation:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('group_invitations', invitation.id, invitation, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncGroupContribution(contribution: GroupContribution, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('group_contributions', contribution.id, contribution, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('group_contributions')
          .delete()
          .eq('id', contribution.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: contribution.id,
          group_id: contribution.groupId,
          member_id: contribution.memberId,
          amount: contribution.amount,
          description: contribution.description || null,
          contributed_at: contribution.contributedAt,
          method: contribution.method,
          status: contribution.status,
          confirmed_by: contribution.confirmedBy || null,
          confirmed_at: contribution.confirmedAt || null,
          proof_file: contribution.proofFile || null,
          proof_url: contribution.proofUrl || null,
          rejection_reason: contribution.rejectionReason || null,
        };

        const { error } = await db
          .from('group_contributions')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} group contribution:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('group_contributions', contribution.id, contribution, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncGroupActivity(activity: GroupActivity, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('group_activities', activity.id, activity, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('group_activities')
          .delete()
          .eq('id', activity.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: activity.id,
          group_id: activity.groupId,
          type: activity.type,
          user_id: activity.userId,
          description: activity.description,
          metadata: activity.metadata || null,
        };

        const { error } = await db
          .from('group_activities')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} group activity:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('group_activities', activity.id, activity, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  // ============================================
  // CRM SYNC METHODS
  // ============================================
  async syncProject(project: Project, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('projects', project.id, project, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('projects')
          .delete()
          .eq('id', project.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: project.id,
          name: project.name,
          description: project.description || null,
          client_id: project.client_id,
          status: project.status,
          start_date: project.start_date || null,
          end_date: project.end_date || null,
          budget: project.budget || null,
          actual_cost: project.actual_cost || 0,
          priority: project.priority || null,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('projects')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} project:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('projects', project.id, project, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncInvoice(invoice: Invoice, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('invoices', invoice.id, invoice, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('invoices')
          .delete()
          .eq('id', invoice.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          client_id: invoice.client_id,
          project_id: invoice.project_id || null,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          status: invoice.status,
          subtotal: invoice.subtotal,
          tax_rate: invoice.tax_rate || 0,
          tax_amount: invoice.tax_amount || 0,
          total_amount: invoice.total_amount,
          paid_amount: invoice.paid_amount || 0,
          notes: invoice.notes || null,
          items: invoice.items,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('invoices')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} invoice:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('invoices', invoice.id, invoice, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncClientPayment(payment: ClientPayment, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('client_payments', payment.id, payment, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('client_payments')
          .delete()
          .eq('id', payment.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: payment.id,
          client_id: payment.client_id,
          project_id: payment.project_id || null,
          invoice_id: payment.invoice_id || null,
          amount: payment.amount,
          payment_date: payment.payment_date,
          status: payment.status,
          payment_method: payment.payment_method || null,
          reference_number: payment.reference_number || null,
          description: payment.description || null,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('client_payments')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} client payment:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('client_payments', payment.id, payment, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncClientExpense(expense: ClientExpense, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('client_expenses', expense.id, expense, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('client_expenses')
          .delete()
          .eq('id', expense.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: expense.id,
          client_id: expense.client_id,
          project_id: expense.project_id || null,
          amount: expense.amount,
          expense_date: expense.expense_date,
          category: expense.category,
          description: expense.description,
          vendor: expense.vendor || null,
          receipt_url: expense.receipt_url || null,
          is_billable: expense.is_billable || false,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('client_expenses')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} client expense:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('client_expenses', expense.id, expense, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncCommunicationLog(log: CommunicationLog, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('communication_logs', log.id, log, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('communication_logs')
          .delete()
          .eq('id', log.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: log.id,
          client_id: log.client_id,
          project_id: log.project_id || null,
          type: log.type,
          subject: log.subject || null,
          content: log.content,
          communication_date: log.communication_date,
          direction: log.direction || null,
          duration_minutes: log.duration_minutes || null,
          next_follow_up: log.next_follow_up || null,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('communication_logs')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} communication log:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('communication_logs', log.id, log, operation);
    } finally {
      this.updateSyncState({ isSyncing: false });
    }
  }

  async syncTaskNote(task: TaskNote, operation: 'create' | 'update' | 'delete') {
    if (!this.user || !this.syncState.isOnline) {
      this.queueOfflineOperation('task_notes', task.id, task, operation);
      return;
    }

    this.updateSyncState({ isSyncing: true });

    try {
      if (operation === 'delete') {
        const { error } = await db
          .from('task_notes')
          .delete()
          .eq('id', task.id)
          .eq('user_id', this.user.id);

        if (error) throw error;
      } else {
        const syncData = {
          id: task.id,
          client_id: task.client_id,
          project_id: task.project_id || null,
          title: task.title,
          description: task.description || null,
          priority: task.priority || null,
          status: task.status,
          due_date: task.due_date || null,
          completed_date: task.completed_date || null,
          user_id: this.user.id,
        };

        const { error } = await db
          .from('task_notes')
          .upsert(syncData, { onConflict: 'id' });

        if (error) throw error;
      }

      this.updateSyncState({
        lastSyncTime: new Date(),
        syncError: null,
      });
    } catch (error) {
      console.error(`Error ${operation} task note:`, error);
      this.updateSyncState({
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
      this.queueOfflineOperation('task_notes', task.id, task, operation);
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
    if (!this.user || this.offlineQueue.length === 0 || !this.syncState.isOnline) return;

    this.updateSyncState({ isSyncing: true });

    try {
      // Process offline queue operations
      for (const operation of this.offlineQueue) {
        switch (operation.collection) {
          case 'transactions':
            await this.syncTransaction(operation.data, operation.operation);
            break;
          case 'bills':
            await this.syncBill(operation.data, operation.operation);
            break;
          case 'savings_goals':
            await this.syncSavingsGoal(operation.data, operation.operation);
            break;
          case 'categories':
            await this.syncCategory(operation.data, operation.operation);
            break;
          case 'clients':
            await this.syncClient(operation.data, operation.operation);
            break;
          case 'products':
            await this.syncProduct(operation.data, operation.operation);
            break;
          case 'quotes':
            await this.syncQuote(operation.data, operation.operation);
            break;
          case 'loans':
            await this.syncLoan(operation.data, operation.operation);
            break;
          case 'business_budgets':
            await this.syncBusinessBudget(operation.data, operation.operation);
            break;
          case 'sales_receipts':
            await this.syncSalesReceipt(operation.data, operation.operation);
            break;
          case 'delivery_notes':
            await this.syncDeliveryNote(operation.data, operation.operation);
            break;
          case 'business_revenues':
            await this.syncBusinessRevenue(operation.data, operation.operation);
            break;
          case 'business_expenses':
            await this.syncBusinessExpense(operation.data, operation.operation);
            break;
          case 'savings_groups':
            await this.syncSavingsGroup(operation.data, operation.operation);
            break;
          case 'group_members':
            await this.syncGroupMember(operation.data, operation.operation);
            break;
          case 'group_invitations':
            await this.syncGroupInvitation(operation.data, operation.operation);
            break;
          case 'group_contributions':
            await this.syncGroupContribution(operation.data, operation.operation);
            break;
          case 'group_activities':
            await this.syncGroupActivity(operation.data, operation.operation);
            break;
          case 'projects':
            await this.syncProject(operation.data, operation.operation);
            break;
          case 'invoices':
            await this.syncInvoice(operation.data, operation.operation);
            break;
          case 'client_payments':
            await this.syncClientPayment(operation.data, operation.operation);
            break;
          case 'client_expenses':
            await this.syncClientExpense(operation.data, operation.operation);
            break;
          case 'communication_logs':
            await this.syncCommunicationLog(operation.data, operation.operation);
            break;
          case 'task_notes':
            await this.syncTaskNote(operation.data, operation.operation);
            break;
        }
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
      created_at: item.created_at,
      category_id: item.category_id || ''
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
