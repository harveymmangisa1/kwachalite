export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_metadata: {
        Row: {
          id: string
          user_id: string
          key: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          key: string
          metadata: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          key?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          username: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
          type: 'income' | 'expense'
          workspace: 'personal' | 'business'
          budget: number | null
          budget_frequency: 'weekly' | 'monthly' | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          color: string
          type: 'income' | 'expense'
          workspace: 'personal' | 'business'
          budget?: number | null
          budget_frequency?: 'weekly' | 'monthly' | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
          type?: 'income' | 'expense'
          workspace?: 'personal' | 'business'
          budget?: number | null
          budget_frequency?: 'weekly' | 'monthly' | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          date: string
          description: string
          amount: number
          type: 'income' | 'expense'
          category: string
          workspace: 'personal' | 'business'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          description: string
          amount: number
          type: 'income' | 'expense'
          category: string
          workspace: 'personal' | 'business'
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          description?: string
          amount?: number
          type?: 'income' | 'expense'
          category?: string
          workspace?: 'personal' | 'business'
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          name: string
          amount: number
          due_date: string
          status: 'paid' | 'unpaid'
          is_recurring: boolean
          recurring_frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          workspace: 'personal' | 'business'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          amount: number
          due_date: string
          status: 'paid' | 'unpaid'
          is_recurring: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          workspace: 'personal' | 'business'
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          amount?: number
          due_date?: string
          status?: 'paid' | 'unpaid'
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          workspace?: 'personal' | 'business'
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          name: string
          target_amount: number
          current_amount: number
          deadline: string
          type: 'individual' | 'group'
          members: string[] | null
          workspace: 'personal' | 'business'
          items: Json | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          target_amount: number
          current_amount: number
          deadline: string
          type: 'individual' | 'group'
          members?: string[] | null
          workspace: 'personal' | 'business'
          items?: Json | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          deadline?: string
          type?: 'individual' | 'group'
          members?: string[] | null
          workspace?: 'personal' | 'business'
          items?: Json | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          name: string
          principal_amount: number
          remaining_amount: number
          interest_rate: number
          term_months: number
          monthly_payment: number
          start_date: string
          end_date: string
          status: 'active' | 'paid_off' | 'defaulted'
          workspace: 'personal' | 'business'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          principal_amount: number
          remaining_amount: number
          interest_rate: number
          term_months: number
          monthly_payment: number
          start_date: string
          end_date: string
          status: 'active' | 'paid_off' | 'defaulted'
          workspace: 'personal' | 'business'
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          principal_amount?: number
          remaining_amount?: number
          interest_rate?: number
          term_months?: number
          monthly_payment?: number
          start_date?: string
          end_date?: string
          status?: 'active' | 'paid_off' | 'defaulted'
          workspace?: 'personal' | 'business'
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          cost_price: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          cost_price: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          cost_price?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          quote_number: string
          client_id: string
          items: Json
          total_amount: number
          status: 'draft' | 'sent' | 'accepted' | 'rejected'
          valid_until: string
          notes: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_number: string
          client_id: string
          items: Json
          total_amount: number
          status: 'draft' | 'sent' | 'accepted' | 'rejected'
          valid_until: string
          notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_number?: string
          client_id?: string
          items?: Json
          total_amount?: number
          status?: 'draft' | 'sent' | 'accepted' | 'rejected'
          valid_until?: string
          notes?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      workspace_type: 'personal' | 'business'
      transaction_type: 'income' | 'expense'
      bill_status: 'paid' | 'unpaid'
      loan_status: 'active' | 'paid_off' | 'defaulted'
      quote_status: 'draft' | 'sent' | 'accepted' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}