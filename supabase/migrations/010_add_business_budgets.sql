CREATE TABLE public.business_budgets (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    budget_amount numeric NOT NULL,
    period text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    current_spent numeric NOT NULL DEFAULT 0,
    workspace text NOT NULL DEFAULT 'business',
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT business_budgets_pkey PRIMARY KEY (id)
);

ALTER TABLE public.business_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for users based on user_id" ON public.business_budgets FOR ALL USING (auth.uid() = user_id);
