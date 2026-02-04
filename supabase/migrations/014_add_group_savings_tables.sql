-- Fixed Group Savings Tables Migration
-- Creates tables for group savings functionality with correct syntax

-- Types for group savings
DO $$ BEGIN
    CREATE TYPE group_status AS ENUM ('active', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contribution_status AS ENUM ('pending', 'confirmed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Savings Groups table
CREATE TABLE IF NOT EXISTS public.savings_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    status group_status DEFAULT 'active',
    currency TEXT DEFAULT 'USD',
    contribution_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group Members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT now(),
    total_contributed DECIMAL(15,2) DEFAULT 0 CHECK (total_contributed >= 0),
    last_contribution_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Group Invitations table
CREATE TABLE IF NOT EXISTS public.group_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    status invitation_status DEFAULT 'pending',
    message TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group Contributions table
CREATE TABLE IF NOT EXISTS public.group_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.group_members(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    contributed_at TIMESTAMPTZ DEFAULT now(),
    method TEXT,
    status contribution_status DEFAULT 'pending',
    confirmed_by UUID REFERENCES auth.users(id),
    confirmed_at TIMESTAMPTZ,
    proof_file TEXT,
    proof_url TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group Activities table
CREATE TABLE IF NOT EXISTS public.group_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_savings_groups_created_by ON public.savings_groups(created_by, status);
CREATE INDEX IF NOT EXISTS idx_savings_groups_status ON public.savings_groups(status);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id, status);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_email ON public.group_invitations(invited_email, status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON public.group_invitations(token);
CREATE INDEX IF NOT EXISTS idx_group_contributions_group ON public.group_contributions(group_id, status);
CREATE INDEX IF NOT EXISTS idx_group_contributions_member ON public.group_contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_group ON public.group_activities(group_id, created_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_savings_groups_updated_at ON public.savings_groups;
CREATE TRIGGER update_savings_groups_updated_at 
    BEFORE UPDATE ON public.savings_groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_members_updated_at ON public.group_members;
CREATE TRIGGER update_group_members_updated_at 
    BEFORE UPDATE ON public.group_members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_invitations_updated_at ON public.group_invitations;
CREATE TRIGGER update_group_invitations_updated_at 
    BEFORE UPDATE ON public.group_invitations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_contributions_updated_at ON public.group_contributions;
CREATE TRIGGER update_group_contributions_updated_at 
    BEFORE UPDATE ON public.group_contributions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.savings_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_activities ENABLE ROW LEVEL SECURITY;

-- Savings Groups Policies
DROP POLICY IF EXISTS "Users can read public savings groups" ON public.savings_groups;
CREATE POLICY "Users can read public savings groups" ON public.savings_groups
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert savings groups" ON public.savings_groups;
CREATE POLICY "Users can insert savings groups" ON public.savings_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own savings groups" ON public.savings_groups;
CREATE POLICY "Users can update own savings groups" ON public.savings_groups
    FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete own savings groups" ON public.savings_groups;
CREATE POLICY "Users can delete own savings groups" ON public.savings_groups
    FOR DELETE USING (auth.uid() = created_by);

-- Group Members Policies
DROP POLICY IF EXISTS "Users can read group members of groups they belong to" ON public.group_members;
CREATE POLICY "Users can read group members of groups they belong to" ON public.group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_members.group_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert group members" ON public.group_members;
CREATE POLICY "Users can insert group members" ON public.group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Group admins can update group members" ON public.group_members;
CREATE POLICY "Group admins can update group members" ON public.group_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Group admins can delete group members" ON public.group_members;
CREATE POLICY "Group admins can delete group members" ON public.group_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

-- Group Invitations Policies
DROP POLICY IF EXISTS "Users can read invitations they sent or received" ON public.group_invitations;
CREATE POLICY "Users can read invitations they sent or received" ON public.group_invitations
    FOR SELECT USING (
        auth.uid() = invited_by OR invited_email = auth.email()
    );

DROP POLICY IF EXISTS "Users can insert invitations" ON public.group_invitations;
CREATE POLICY "Users can insert invitations" ON public.group_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update invitations they sent" ON public.group_invitations;
CREATE POLICY "Users can update invitations they sent" ON public.group_invitations
    FOR UPDATE USING (auth.uid() = invited_by);

DROP POLICY IF EXISTS "Users can delete invitations they sent" ON public.group_invitations;
CREATE POLICY "Users can delete invitations they sent" ON public.group_invitations
    FOR DELETE USING (auth.uid() = invited_by);

-- Group Contributions Policies
DROP POLICY IF EXISTS "Users can read contributions of groups they belong to" ON public.group_contributions;
CREATE POLICY "Users can read contributions of groups they belong to" ON public.group_contributions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_contributions.group_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Group members can insert contributions" ON public.group_contributions;
CREATE POLICY "Group members can insert contributions" ON public.group_contributions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_contributions.group_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Contributors can update own contributions" ON public.group_contributions;
CREATE POLICY "Contributors can update own contributions" ON public.group_contributions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.id = member_id 
            AND gm.user_id = auth.uid()
        )
    );

-- Group Activities Policies
DROP POLICY IF EXISTS "Users can read activities of groups they belong to" ON public.group_activities;
CREATE POLICY "Users can read activities of groups they belong to" ON public.group_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_activities.group_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Group members can insert activities" ON public.group_activities;
CREATE POLICY "Group members can insert activities" ON public.group_activities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_activities.group_id 
            AND user_id = auth.uid()
        )
    );

-- Function to update group current amount when contribution is confirmed
CREATE OR REPLACE FUNCTION update_group_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE public.savings_groups 
        SET current_amount = current_amount + NEW.amount
        WHERE id = NEW.group_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update group amount
DROP TRIGGER IF EXISTS update_group_amount_on_contribution ON public.group_contributions;
CREATE TRIGGER update_group_amount_on_contribution
    AFTER UPDATE ON public.group_contributions
    FOR EACH ROW
    WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
    EXECUTE FUNCTION update_group_current_amount();