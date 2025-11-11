export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bills: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          is_recurring: boolean
          name: string
          recurring_frequency:
            | Database["public"]["Enums"]["recurring_frequency"]
            | null
          status: Database["public"]["Enums"]["bill_status"]
          updated_at: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          is_recurring?: boolean
          name: string
          recurring_frequency?:
            | Database["public"]["Enums"]["recurring_frequency"]
            | null
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          is_recurring?: boolean
          name?: string
          recurring_frequency?:
            | Database["public"]["Enums"]["recurring_frequency"]
            | null
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string | null
          user_id?: string
          workspace?: Database["public"]["Enums"]["workspace_type"]
        }
        Relationships: [
          {
            foreignKeyName: "bills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          account_name: string | null
          account_number: string | null
          address: string | null
          bank_name: string | null
          created_at: string | null
          email: string
          id: string
          logo_url: string | null
          name: string
          payment_details: string | null
          phone: string | null
          registration_number: string | null
          routing_number: string | null
          swift_code: string | null
          tax_id: string | null
          terms_and_conditions: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          logo_url?: string | null
          name: string
          payment_details?: string | null
          phone?: string | null
          registration_number?: string | null
          routing_number?: string | null
          swift_code?: string | null
          tax_id?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          name?: string
          payment_details?: string | null
          phone?: string | null
          registration_number?: string | null
          routing_number?: string | null
          swift_code?: string | null
          tax_id?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          budget: number | null
          budget_frequency:
            | Database["public"]["Enums"]["budget_frequency"]
            | null
          color: string
          created_at: string | null
          icon: string
          id: string
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Insert: {
          budget?: number | null
          budget_frequency?:
            | Database["public"]["Enums"]["budget_frequency"]
            | null
          color: string
          created_at?: string | null
          icon: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Update: {
          budget?: number | null
          budget_frequency?:
            | Database["public"]["Enums"]["budget_frequency"]
            | null
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
          workspace?: Database["public"]["Enums"]["workspace_type"]
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_expenses: {
        Row: {
          amount: number
          category: string
          client_id: string
          created_at: string | null
          description: string
          expense_date: string
          id: string
          is_billable: boolean | null
          project_id: string | null
          receipt_url: string | null
          updated_at: string | null
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category: string
          client_id: string
          created_at?: string | null
          description: string
          expense_date: string
          id?: string
          is_billable?: boolean | null
          project_id?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          client_id?: string
          created_at?: string | null
          description?: string
          expense_date?: string
          id?: string
          is_billable?: boolean | null
          project_id?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          invoice_id: string | null
          payment_date: string
          payment_method: string | null
          project_id: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          payment_date: string
          payment_method?: string | null
          project_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          payment_date?: string
          payment_method?: string | null
          project_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          company: string | null
          created_at: string | null
          created_source: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          created_source?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          created_source?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          client_id: string
          communication_date: string
          content: string
          created_at: string | null
          direction: string | null
          duration_minutes: number | null
          id: string
          next_follow_up: string | null
          project_id: string | null
          subject: string | null
          type: Database["public"]["Enums"]["communication_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          communication_date?: string
          content: string
          created_at?: string | null
          direction?: string | null
          duration_minutes?: number | null
          id?: string
          next_follow_up?: string | null
          project_id?: string | null
          subject?: string | null
          type: Database["public"]["Enums"]["communication_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          communication_date?: string
          content?: string
          created_at?: string | null
          direction?: string | null
          duration_minutes?: number | null
          id?: string
          next_follow_up?: string | null
          project_id?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["communication_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notes: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          delivery_address: string
          delivery_date: string
          delivery_method: string
          delivery_note_number: string
          id: string
          invoice_id: string | null
          items: Json
          notes: string | null
          quote_id: string | null
          received_at: string | null
          received_by: string | null
          status: string
          tracking_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date?: string
          delivery_address: string
          delivery_date: string
          delivery_method: string
          delivery_note_number: string
          id?: string
          invoice_id?: string | null
          items: Json
          notes?: string | null
          quote_id?: string | null
          received_at?: string | null
          received_by?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          delivery_address?: string
          delivery_date?: string
          delivery_method?: string
          delivery_note_number?: string
          id?: string
          invoice_id?: string | null
          items?: Json
          notes?: string | null
          quote_id?: string | null
          received_at?: string | null
          received_by?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          items: Json
          notes: string | null
          paid_amount: number | null
          project_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          items: Json
          notes?: string | null
          paid_amount?: number | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          paid_amount?: number | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          interest_rate: number
          monthly_payment: number
          name: string
          principal_amount: number
          remaining_amount: number
          start_date: string
          status: Database["public"]["Enums"]["loan_status"]
          term_months: number
          updated_at: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          interest_rate: number
          monthly_payment: number
          name: string
          principal_amount: number
          remaining_amount: number
          start_date: string
          status?: Database["public"]["Enums"]["loan_status"]
          term_months: number
          updated_at?: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          interest_rate?: number
          monthly_payment?: number
          name?: string
          principal_amount?: number
          remaining_amount?: number
          start_date?: string
          status?: Database["public"]["Enums"]["loan_status"]
          term_months?: number
          updated_at?: string | null
          user_id?: string
          workspace?: Database["public"]["Enums"]["workspace_type"]
        }
        Relationships: [
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          cost_price: number
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cost_price: number
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cost_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          completed_date: string | null
          created_at: string | null
          deliverables: string[] | null
          description: string | null
          due_date: string
          id: string
          name: string
          project_id: string
          status: Database["public"]["Enums"]["milestone_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          deliverables?: string[] | null
          description?: string | null
          due_date: string
          id?: string
          name: string
          project_id: string
          status?: Database["public"]["Enums"]["milestone_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          deliverables?: string[] | null
          description?: string | null
          due_date?: string
          id?: string
          name?: string
          project_id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          budget: number | null
          client_id: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          priority: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          budget?: number | null
          client_id: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          priority?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          budget?: number | null
          client_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          priority?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          items: Json
          notes: string | null
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"]
          total_amount: number
          updated_at: string | null
          user_id: string
          valid_until: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          items: Json
          notes?: string | null
          quote_number: string
          status?: Database["public"]["Enums"]["quote_status"]
          total_amount: number
          updated_at?: string | null
          user_id: string
          valid_until: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          items?: Json
          notes?: string | null
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          total_amount?: number
          updated_at?: string | null
          user_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_receipts: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          date: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_method: string
          quote_id: string | null
          receipt_number: string
          reference_number: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method: string
          quote_id?: string | null
          receipt_number: string
          reference_number?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string
          quote_id?: string | null
          receipt_number?: string
          reference_number?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_receipts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_receipts_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string | null
          current_amount: number
          deadline: string
          id: string
          items: Json | null
          members: string[] | null
          name: string
          target_amount: number
          type: Database["public"]["Enums"]["goal_type"]
          updated_at: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Insert: {
          created_at?: string | null
          current_amount?: number
          deadline: string
          id?: string
          items?: Json | null
          members?: string[] | null
          name: string
          target_amount: number
          type?: Database["public"]["Enums"]["goal_type"]
          updated_at?: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Update: {
          created_at?: string | null
          current_amount?: number
          deadline?: string
          id?: string
          items?: Json | null
          members?: string[] | null
          name?: string
          target_amount?: number
          type?: Database["public"]["Enums"]["goal_type"]
          updated_at?: string | null
          user_id?: string
          workspace?: Database["public"]["Enums"]["workspace_type"]
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_notes: {
        Row: {
          client_id: string
          completed_date: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string
          id: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description: string
          id?: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
          workspace: Database["public"]["Enums"]["workspace_type"]
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
          workspace?: Database["public"]["Enums"]["workspace_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_metadata: {
        Row: {
          created_at: string | null
          id: string
          key: string
          metadata: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          metadata: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          metadata?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_metadata_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      user_exists: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      bill_status: "paid" | "unpaid"
      budget_frequency: "weekly" | "monthly"
      communication_type: "email" | "phone" | "meeting" | "note" | "other"
      goal_type: "individual" | "group"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      loan_status: "active" | "paid_off" | "defaulted"
      milestone_status: "pending" | "in_progress" | "completed" | "overdue"
      payment_status: "pending" | "paid" | "overdue" | "cancelled"
      project_status:
        | "planning"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "cancelled"
      quote_status: "draft" | "sent" | "accepted" | "rejected"
      recurring_frequency:
        | "daily"
        | "weekly"
        | "bi-weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
      transaction_type: "income" | "expense"
      workspace_type: "personal" | "business"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bill_status: ["paid", "unpaid"],
      budget_frequency: ["weekly", "monthly"],
      communication_type: ["email", "phone", "meeting", "note", "other"],
      goal_type: ["individual", "group"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      loan_status: ["active", "paid_off", "defaulted"],
      milestone_status: ["pending", "in_progress", "completed", "overdue"],
      payment_status: ["pending", "paid", "overdue", "cancelled"],
      project_status: [
        "planning",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
      ],
      quote_status: ["draft", "sent", "accepted", "rejected"],
      recurring_frequency: [
        "daily",
        "weekly",
        "bi-weekly",
        "monthly",
        "quarterly",
        "yearly",
      ],
      transaction_type: ["income", "expense"],
      workspace_type: ["personal", "business"],
    },
  },
} as const
