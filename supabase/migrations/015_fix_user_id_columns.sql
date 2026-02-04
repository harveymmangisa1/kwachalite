-- Fix Missing user_id Columns Migration
-- Adds user_id columns to tables that are missing them for sync compatibility

-- Update user_id columns to reference auth.users instead of public.users
-- This fixes sync compatibility issues

-- Categories table - already has user_id but needs to reference auth.users
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE public.categories ADD CONSTRAINT categories_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Transactions table - already has user_id but needs to reference auth.users
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Bills table - already has user_id but needs to reference auth.users
ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_user_id_fkey;
ALTER TABLE public.bills ADD CONSTRAINT bills_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Savings Goals table - already has user_id but needs to reference auth.users
ALTER TABLE public.savings_goals DROP CONSTRAINT IF EXISTS savings_goals_user_id_fkey;
ALTER TABLE public.savings_goals ADD CONSTRAINT savings_goals_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Loans table - already has user_id but needs to reference auth.users
ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_user_id_fkey;
ALTER TABLE public.loans ADD CONSTRAINT loans_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Clients table - already has user_id but needs to reference auth.users
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;
ALTER TABLE public.clients ADD CONSTRAINT clients_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Products table - already has user_id but needs to reference auth.users
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_user_id_fkey;
ALTER TABLE public.products ADD CONSTRAINT products_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Quotes table - already has user_id but needs to reference auth.users
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_user_id_fkey;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to use auth.uid() properly

-- Categories policies
DROP POLICY IF EXISTS "Users can manage own categories" ON public.categories;
CREATE POLICY "Users can manage own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

-- Transactions policies
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- Bills policies
DROP POLICY IF EXISTS "Users can manage own bills" ON public.bills;
CREATE POLICY "Users can manage own bills" ON public.bills
    FOR ALL USING (auth.uid() = user_id);

-- Savings goals policies  
DROP POLICY IF EXISTS "Users can manage own goals" ON public.savings_goals;
CREATE POLICY "Users can manage own goals" ON public.savings_goals
    FOR ALL USING (auth.uid() = user_id);

-- Loans policies
DROP POLICY IF EXISTS "Users can manage own loans" ON public.loans;
CREATE POLICY "Users can manage own loans" ON public.loans
    FOR ALL USING (auth.uid() = user_id);

-- Clients policies
DROP POLICY IF EXISTS "Users can manage own clients" ON public.clients;
CREATE POLICY "Users can manage own clients" ON public.clients
    FOR ALL USING (auth.uid() = user_id);

-- Products policies
DROP POLICY IF EXISTS "Users can manage own products" ON public.products;
CREATE POLICY "Users can manage own products" ON public.products
    FOR ALL USING (auth.uid() = user_id);

-- Quotes policies
DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;
CREATE POLICY "Users can manage own quotes" ON public.quotes
    FOR ALL USING (auth.uid() = user_id);

-- Users table policies for profile management
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);