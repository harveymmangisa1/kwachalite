-- RLS Policies for CRM Enhancement Tables
-- Execute this SQL in your Supabase SQL Editor AFTER running 007_crm_enhancement.sql

-- Enable RLS on new CRM tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- Projects table policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Project Milestones table policies
CREATE POLICY "Users can view own project milestones" ON public.project_milestones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project milestones" ON public.project_milestones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project milestones" ON public.project_milestones
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project milestones" ON public.project_milestones
    FOR DELETE USING (auth.uid() = user_id);

-- Client Payments table policies
CREATE POLICY "Users can view own client payments" ON public.client_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client payments" ON public.client_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client payments" ON public.client_payments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client payments" ON public.client_payments
    FOR DELETE USING (auth.uid() = user_id);

-- Client Expenses table policies
CREATE POLICY "Users can view own client expenses" ON public.client_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client expenses" ON public.client_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client expenses" ON public.client_expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client expenses" ON public.client_expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Invoices table policies
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON public.invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON public.invoices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON public.invoices
    FOR DELETE USING (auth.uid() = user_id);

-- Communication Logs table policies
CREATE POLICY "Users can view own communication logs" ON public.communication_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own communication logs" ON public.communication_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own communication logs" ON public.communication_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own communication logs" ON public.communication_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Task Notes table policies
CREATE POLICY "Users can view own task notes" ON public.task_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task notes" ON public.task_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task notes" ON public.task_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own task notes" ON public.task_notes
    FOR DELETE USING (auth.uid() = user_id);