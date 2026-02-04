-- 021_add_revenue_expense_and_streak_tables.sql

-- Ensure helper function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* -------------------------------------------------------------------------- */
/* Business Revenue / Expense Tracking                    */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS public.business_revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    source TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    received_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    vendor TEXT,
    category TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'USD',
    incurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    receipt_url TEXT,
    tax_deductible BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_revenues_user_date ON public.business_revenues(user_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_expenses_user_date ON public.business_expenses(user_id, incurred_at DESC);

-- RLS
ALTER TABLE public.business_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own business_revenues" ON public.business_revenues;
CREATE POLICY "Users manage own business_revenues" ON public.business_revenues
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own business_expenses" ON public.business_expenses;
CREATE POLICY "Users manage own business_expenses" ON public.business_expenses
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers
DO $$ BEGIN
    CREATE TRIGGER trg_business_revenues_updated_at BEFORE UPDATE ON public.business_revenues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_business_expenses_updated_at BEFORE UPDATE ON public.business_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* -------------------------------------------------------------------------- */
/* Streak System Tables                           */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    total_active_days INTEGER NOT NULL DEFAULT 0 CHECK (total_active_days >= 0),
    streak_freeze_count INTEGER NOT NULL DEFAULT 0 CHECK (streak_freeze_count >= 0),
    last_activity_date DATE,
    last_activity_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activities JSONB DEFAULT '[]'::jsonb,
    transactions_count INTEGER DEFAULT 0,
    savings_count INTEGER DEFAULT 0,
    bills_paid_count INTEGER DEFAULT 0,
    goals_updated_count INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, activity_date)
);

CREATE TABLE IF NOT EXISTS public.streak_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL,
    milestone_value INTEGER NOT NULL CHECK (milestone_value > 0),
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reward_type TEXT,
    reward_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.streak_freeze_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('earned', 'used')),
    amount INTEGER NOT NULL DEFAULT 1 CHECK (amount > 0),
    related_milestone UUID REFERENCES public.streak_milestones(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS & Indexes (Simplified)
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freeze_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_daily_activities_composite ON public.daily_activities(user_id, activity_date DESC);

/* -------------------------------------------------------------------------- */
/* Logic: update_user_streak                              */
/* -------------------------------------------------------------------------- */



CREATE OR REPLACE FUNCTION public.update_user_streak(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_date DATE DEFAULT CURRENT_DATE,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    streak_record public.user_streaks;
    days_difference INTEGER;
    new_current INTEGER;
    milestone_id UUID;
    milestone_record_json JSONB;
BEGIN
    SELECT * INTO streak_record FROM public.user_streaks WHERE user_id = p_user_id;

    IF streak_record IS NULL THEN
        INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, total_active_days, last_activity_date, last_activity_type)
        VALUES (p_user_id, 1, 1, 1, p_activity_date, p_activity_type)
        RETURNING * INTO streak_record;
        new_current := 1;
    ELSE
        days_difference := p_activity_date - streak_record.last_activity_date;

        IF days_difference <= 0 THEN
            -- Activity on same day or past day: maintain current streak
            new_current := streak_record.current_streak;
        ELSIF days_difference = 1 THEN
            -- Next day: increment
            new_current := streak_record.current_streak + 1;
        ELSE
            -- Break in streak: reset
            new_current := 1;
        END IF;

        UPDATE public.user_streaks
        SET current_streak = new_current,
            longest_streak = GREATEST(streak_record.longest_streak, new_current),
            total_active_days = total_active_days + (CASE WHEN days_difference = 0 THEN 0 ELSE 1 END),
            last_activity_date = p_activity_date,
            last_activity_type = p_activity_type,
            updated_at = now()
        WHERE user_id = p_user_id
        RETURNING * INTO streak_record;
    END IF;

    -- Upsert daily activity
    INSERT INTO public.daily_activities (user_id, activity_date, activities)
    VALUES (p_user_id, p_activity_date, jsonb_build_array(jsonb_build_object('type', p_activity_type, 'recorded_at', now())))
    ON CONFLICT (user_id, activity_date) DO UPDATE SET
        activities = daily_activities.activities || jsonb_build_array(jsonb_build_object('type', p_activity_type, 'recorded_at', now())),
        updated_at = now();

    -- Milestone Logic
    milestone_record_json := NULL;
    IF streak_record.current_streak IN (7, 30, 90, 365) THEN
        -- Check if already achieved to prevent double-insert
        IF NOT EXISTS (SELECT 1 FROM public.streak_milestones WHERE user_id = p_user_id AND milestone_value = streak_record.current_streak) THEN
            
            INSERT INTO public.streak_milestones (user_id, milestone_type, milestone_value, reward_type)
            VALUES (p_user_id, 'streak_target', streak_record.current_streak, 'badge')
            RETURNING id INTO milestone_id;

            -- Award Freezes
            IF streak_record.current_streak IN (7, 30, 90) THEN
                UPDATE public.user_streaks SET streak_freeze_count = streak_freeze_count + 1 WHERE user_id = p_user_id;
                INSERT INTO public.streak_freeze_history (user_id, action, amount, related_milestone, notes)
                VALUES (p_user_id, 'earned', 1, milestone_id, 'Milestone reward');
            END IF;

            SELECT row_to_json(m)::jsonb INTO milestone_record_json FROM public.streak_milestones m WHERE id = milestone_id;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'current_streak', streak_record.current_streak,
        'freeze_count', streak_record.streak_freeze_count,
        'milestone_achieved', milestone_record_json
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;