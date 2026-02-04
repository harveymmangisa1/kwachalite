-- This script drops all tables in the public schema.
-- It is a destructive operation and will result in data loss.
-- The auth.users table is not affected.

DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.bills CASCADE;
DROP TABLE IF EXISTS public.savings_goals CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.user_metadata CASCADE;
DROP TABLE IF EXISTS public.sales_receipts CASCADE;
DROP TABLE IF EXISTS public.delivery_notes CASCADE;
DROP TABLE IF EXISTS public.business_profiles CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.project_milestones CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.client_payments CASCADE;
DROP TABLE IF EXISTS public.client_expenses CASCADE;
DROP TABLE IF EXISTS public.communication_logs CASCADE;
DROP TABLE IF EXISTS public.task_notes CASCADE;
DROP TABLE IF EXISTS public.business_budgets CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
