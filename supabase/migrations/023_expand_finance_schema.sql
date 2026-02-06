-- Expand finance-related tables to match app types (non-destructive)

-- sales_receipts: add richer fields expected by app
alter table public.sales_receipts
  add column if not exists invoice_id uuid references public.invoices(id) on delete set null,
  add column if not exists quote_id uuid references public.quotes(id) on delete set null,
  add column if not exists date date default current_date,
  add column if not exists reference_number text,
  add column if not exists notes text,
  add column if not exists status text default 'confirmed';

-- delivery_notes: add richer fields expected by app
alter table public.delivery_notes
  add column if not exists delivery_note_number text,
  add column if not exists invoice_id uuid references public.invoices(id) on delete set null,
  add column if not exists quote_id uuid references public.quotes(id) on delete set null,
  add column if not exists date date default current_date,
  add column if not exists delivery_address text,
  add column if not exists delivery_method text,
  add column if not exists tracking_number text,
  add column if not exists received_at timestamptz;

-- business_revenues: add richer fields expected by app
alter table public.business_revenues
  add column if not exists source text,
  add column if not exists source_id uuid,
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists date date default current_date,
  add column if not exists status text,
  add column if not exists payment_method text;

-- business_expenses: add richer fields expected by app
alter table public.business_expenses
  add column if not exists date date default current_date,
  add column if not exists receipt_url text,
  add column if not exists tax_deductible boolean default false,
  add column if not exists status text,
  add column if not exists payment_method text;

-- business_budgets: add optional name + current_spent to match app
alter table public.business_budgets
  add column if not exists name text,
  add column if not exists current_spent numeric default 0;

-- Backfill date columns from existing *_date columns where present
update public.sales_receipts set date = coalesce(date, sale_date) where date is null;
update public.delivery_notes set date = coalesce(date, delivery_date) where date is null;
update public.business_revenues set date = coalesce(date, revenue_date) where date is null;
update public.business_expenses set date = coalesce(date, expense_date) where date is null;

