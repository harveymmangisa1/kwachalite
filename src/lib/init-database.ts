'use client';

import { supabase } from './supabase';

// Initialize the database tables
export async function initializeDatabase() {
  console.log('Initializing database tables...');

  try {
    // Try to create user_metadata table
    const { error: createTableError } = await (supabase as any).rpc('exec_sql', {
      sql: `
        -- Create user_metadata table if it doesn't exist
        CREATE TABLE IF NOT EXISTS user_metadata (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          key TEXT NOT NULL,
          metadata JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, key)
        );
        
        -- Enable RLS
        ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;
        
        -- Create policy if it doesn't exist
        DO $$ BEGIN
          CREATE POLICY "Users can manage their own metadata" 
          ON user_metadata FOR ALL USING (auth.uid() = user_id);
        EXCEPTION 
          WHEN duplicate_object THEN NULL;
        END $$;
      `
    });

    if (createTableError) {
      console.warn('Failed to create tables via RPC, this is expected if not using service role key:', createTableError);
      return false;
    }

    console.log('Database tables initialized successfully!');
    return true;
  } catch (error) {
    console.warn('Database initialization failed, using localStorage fallback:', error);
    return false;
  }
}

// Simple function to test database connectivity
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('Testing database connection...');
    
    // Try to make a simple query
    const { data, error } = await supabase.from('user_metadata').select('count', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      // Table doesn't exist - this is expected
      console.log('user_metadata table does not exist yet');
      return false;
    } else if (error) {
      console.warn('Database connection test failed:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.warn('Database connection failed:', error);
    return false;
  }
}