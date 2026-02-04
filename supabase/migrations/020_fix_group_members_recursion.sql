-- Fix infinite recursion in group_members RLS policies
-- The previous SELECT policy was querying the same table causing infinite recursion

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can read group members of groups they belong to" ON public.group_members;
DROP POLICY IF EXISTS "Users can insert group members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can update group members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can delete group members" ON public.group_members;

-- Fixed Group Members Policies
-- Users can read group members if they are either:
-- 1. The member themselves (their own membership)
-- 2. The creator of the savings group
CREATE POLICY "Users can read group members" ON public.group_members
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

-- Users can insert group members if they are the group creator
CREATE POLICY "Users can insert group members" ON public.group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

-- Group creators can update group members
CREATE POLICY "Group admins can update group members" ON public.group_members
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

-- Group creators can delete group members (or users can delete themselves)
CREATE POLICY "Group admins can delete group members" ON public.group_members
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );