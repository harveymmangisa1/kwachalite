-- Add business_profiles table
CREATE TABLE public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    website TEXT,
    tax_id TEXT,
    registration_number TEXT,
    terms_and_conditions TEXT,
    payment_details TEXT,
    bank_name TEXT,
    account_name TEXT,
    account_number TEXT,
    routing_number TEXT,
    swift_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own business profile
CREATE POLICY "Users can read own business profile" ON public.business_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own business profile
CREATE POLICY "Users can insert own business profile" ON public.business_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own business profile
CREATE POLICY "Users can update own business profile" ON public.business_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own business profile
CREATE POLICY "Users can delete own business profile" ON public.business_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_business_profiles_updated_at 
    BEFORE UPDATE ON public.business_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();