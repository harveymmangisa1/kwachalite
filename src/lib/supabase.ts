import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const fetchConcurrency = 2;
let activeFetches = 0;
const fetchWaiters: Array<() => void> = [];

const limitedFetch: typeof fetch = async (...args) => {
  if (activeFetches >= fetchConcurrency) {
    await new Promise<void>(resolve => fetchWaiters.push(resolve));
  }
  activeFetches += 1;
  try {
    return await fetch(...args);
  } finally {
    activeFetches -= 1;
    const next = fetchWaiters.shift();
    if (next) next();
  }
};

// Global singleton to prevent multiple instances
declare global {
  interface Window {
    __KWACHALITE_SUPABASE_INSTANCE__?: ReturnType<typeof createClient<Database>>;
  }
}

export const supabase = (() => {
  // Check for existing instance in global scope
  if (typeof window !== 'undefined' && window.__KWACHALITE_SUPABASE_INSTANCE__) {
    return window.__KWACHALITE_SUPABASE_INSTANCE__;
  }
  
  const instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'kwachalite-auth',
      flowType: 'pkce', // Use PKCE flow for better security
    },
    realtime: {
      params: {
        eventsPerSecond: 2, // Reduce to prevent connection issues
      },
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      fetch: limitedFetch,
    },
  });
  
  // Store in global scope
  if (typeof window !== 'undefined') {
    window.__KWACHALITE_SUPABASE_INSTANCE__ = instance;
  }
  
  return instance;
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

  
