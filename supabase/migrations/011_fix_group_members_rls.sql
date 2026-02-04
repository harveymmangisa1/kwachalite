-- Step 1: Create a SECURITY DEFINER function to check for group admin/owner status
CREATE OR REPLACE FUNCTION is_group_admin_or_owner(p_group_id uuid, p_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND role IN ('owner', 'admin')
  );
END;
$$;

-- Step 2: Drop the old recursive SELECT policy
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN
        SELECT policyname FROM pg_policies WHERE tablename = 'group_members' AND cmd = 'SELECT'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.group_members';
    END LOOP;
END;
$$;

-- Step 3: Create new, non-recursive policies for group_members

-- Policy for SELECT:
-- Allows a user to see their own membership.
-- Allows an admin or owner to see all members of their group.
CREATE POLICY "Enable read access for group members"
ON public.group_members
FOR SELECT
USING (user_id = auth.uid() OR is_group_admin_or_owner(group_id, auth.uid()));

-- Policy for INSERT:
-- Allows a user to insert their own membership (join a group).
CREATE POLICY "Enable insert for group members"
ON public.group_members
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy for UPDATE:
-- Allows a user to update their own membership (e.g. change their role if they are admin).
-- Note: A more granular policy might be needed for role changes.
CREATE POLICY "Enable update for group members"
ON public.group_members
FOR UPDATE
USING (user_id = auth.uid());

-- Policy for DELETE:
-- Allows a user to delete their own membership (leave a group).
CREATE POLICY "Enable delete for group members"
ON public.group_members
FOR DELETE
USING (user_id = auth.uid());
