import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'kwachalite-auth',
    },
  });
  
  return supabaseInstance;
})();

// Prevent multiple instances warning in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Multiple GoTrueClient instances detected')) {
      return; // Suppress this specific warning
    }
    originalWarn.apply(console, args);
  };
}

// Type-safe client for server-side operations (if needed)
let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null;

export const supabaseAdmin = (() => {
  if (supabaseAdminInstance) return supabaseAdminInstance;
  
  if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdminInstance = createClient<Database>(
      supabaseUrl,
      import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  
  return supabaseAdminInstance;
})();

  