-- First, let's check if user_metadata table exists and fix it
DO $$ 
BEGIN
  -- Check if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_metadata') THEN
    -- Table exists, check if it has the right columns
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_metadata' AND column_name = 'user_id') THEN
      -- Add missing user_id column if it doesn't exist
      ALTER TABLE user_metadata ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_metadata' AND column_name = 'key') THEN
      ALTER TABLE user_metadata ADD COLUMN key TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_metadata' AND column_name = 'metadata') THEN
      ALTER TABLE user_metadata ADD COLUMN metadata JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_metadata' AND column_name = 'created_at') THEN
      ALTER TABLE user_metadata ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_metadata' AND column_name = 'updated_at') THEN
      ALTER TABLE user_metadata ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
  ELSE
    -- Table doesn't exist, create it
    CREATE TABLE user_metadata (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      metadata JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Create unique index on user_id and key (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'user_metadata_user_key_idx') THEN
    CREATE UNIQUE INDEX user_metadata_user_key_idx ON user_metadata(user_id, key);
  END IF;
END $$;

-- Enable RLS (Row Level Security)
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access only their own metadata
DROP POLICY IF EXISTS "Users can manage their own metadata" ON user_metadata;
CREATE POLICY "Users can manage their own metadata" 
ON user_metadata FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_metadata_updated_at ON user_metadata;
CREATE TRIGGER user_metadata_updated_at
    BEFORE UPDATE ON user_metadata
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create other essential tables if they don't exist
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    workspace TEXT NOT NULL DEFAULT 'personal' CHECK (workspace IN ('personal', 'business')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT DEFAULT 'monthly',
    workspace TEXT NOT NULL DEFAULT 'personal' CHECK (workspace IN ('personal', 'business')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    type TEXT NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'group')),
    members JSONB DEFAULT '[]'::jsonb,
    items JSONB DEFAULT '[]'::jsonb,
    workspace TEXT NOT NULL DEFAULT 'personal' CHECK (workspace IN ('personal', 'business')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT '#0066cc',
    type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
    workspace TEXT NOT NULL DEFAULT 'personal' CHECK (workspace IN ('personal', 'business')),
    budget DECIMAL(10,2),
    budget_frequency TEXT DEFAULT 'monthly',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_number TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    valid_until DATE,
    items JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    principal_amount DECIMAL(10,2) NOT NULL,
    remaining_amount DECIMAL(10,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INTEGER NOT NULL,
    start_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid_off')),
    workspace TEXT NOT NULL DEFAULT 'personal' CHECK (workspace IN ('personal', 'business')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;
CREATE POLICY "Users can manage their own transactions" 
ON transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own bills" ON bills;
CREATE POLICY "Users can manage their own bills" 
ON bills FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own savings_goals" ON savings_goals;
CREATE POLICY "Users can manage their own savings_goals" 
ON savings_goals FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
CREATE POLICY "Users can manage their own categories" 
ON categories FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own clients" ON clients;
CREATE POLICY "Users can manage their own clients" 
ON clients FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own products" ON products;
CREATE POLICY "Users can manage their own products" 
ON products FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own quotes" ON quotes;
CREATE POLICY "Users can manage their own quotes" 
ON quotes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own loans" ON loans;
CREATE POLICY "Users can manage their own loans" 
ON loans FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS transactions_user_id_date_idx ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS bills_user_id_due_date_idx ON bills(user_id, due_date);
CREATE INDEX IF NOT EXISTS savings_goals_user_id_idx ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);
CREATE INDEX IF NOT EXISTS quotes_user_id_idx ON quotes(user_id);
CREATE INDEX IF NOT EXISTS loans_user_id_idx ON loans(user_id);