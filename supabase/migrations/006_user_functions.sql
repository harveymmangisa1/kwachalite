-- Create a function to check if user exists
CREATE OR REPLACE FUNCTION public.user_exists(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id
        LIMIT 1
    );
END;
$$;