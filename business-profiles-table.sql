-- Create dedicated business_profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    bank_details TEXT,
    bank_name TEXT,
    account_name TEXT,
    account_number TEXT,
    routing_number TEXT,
    swift_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on user_id (one business profile per user)
CREATE UNIQUE INDEX IF NOT EXISTS business_profiles_user_id_idx ON business_profiles(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access only their own business profile
DROP POLICY IF EXISTS "Users can manage their own business profile" ON business_profiles;
CREATE POLICY "Users can manage their own business profile" 
ON business_profiles FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_business_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS business_profiles_updated_at ON business_profiles;
CREATE TRIGGER business_profiles_updated_at
    BEFORE UPDATE ON business_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_business_profiles_updated_at();