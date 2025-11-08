
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { supabaseSync } from '@/lib/supabase-sync';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  session: Session | null;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setSession: (session: Session | null) => void;
  setInitialized: (initialized: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setSession: (session) => set({ session }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
}));

export const useAuth = () => {
  const { user, loading, session, isInitialized, setUser, setLoading, setSession, setInitialized } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Initialize sync if user exists
          if (session?.user) {
            supabaseSync.setUser(session.user);
            await ensureUserProfile(session.user);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Ensure user profile exists
    const ensureUserProfile = async (user: User) => {
      try {
        // Use RPC to bypass TypeScript issues
        const { data: existingUser, error } = await (supabase as any)
          .rpc('user_exists', { user_id: user.id });

        if (error) {
          console.error('Error checking user profile:', error);
          return;
        }

        if (!existingUser) {
          // Create user profile if it doesn't exist
          const { error: insertError } = await (supabase as any)
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
              avatar_url: user.user_metadata?.avatar_url,
            });

          if (insertError) {
            console.error('Error creating user profile:', insertError);
          } else {
            console.log('User profile created successfully');
          }
        }
      } catch (error) {
        console.error('Error in ensureUserProfile:', error);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('Auth state change:', event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);

      // Update Supabase sync with user
      supabaseSync.setUser(session?.user ?? null);

      // Handle user profile creation on sign up
      if (event === 'SIGNED_IN' && session?.user) {
        await ensureUserProfile(session.user);
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        supabaseSync.setUser(null);
      }
    });

    subscription = authSubscription.data.subscription;

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [setUser, setLoading, setSession, setInitialized]);

  const login = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error during sign-in:', error);
      setLoading(false);
      throw error;
    }
  }, [setLoading]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error during email sign-in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verification`,
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error during email sign-up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign-out:', error);
        throw error;
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error during sign-out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser, setSession]);

  return useMemo(() => ({ 
    user, 
    loading, 
    session,
    isInitialized,
    login, 
    loginWithEmail, 
    signUpWithEmail, 
    logout 
  }), [user, loading, session, isInitialized, login, loginWithEmail, signUpWithEmail, logout]);
};
