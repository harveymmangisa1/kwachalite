
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { supabaseSync } from '@/lib/supabase-sync';
import { useAppStore } from '@/lib/data';
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

// Global tracking to prevent duplicate profile creation attempts
declare global {
  interface Window {
    __PROFILE_CREATION_IN_PROGRESS__?: Set<string>;
  }
}

export const useAuth = () => {
  const { user, loading, session, isInitialized, setUser, setLoading, setSession, setInitialized } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;
    
    // Initialize global tracking
    if (typeof window !== 'undefined' && !window.__PROFILE_CREATION_IN_PROGRESS__) {
      window.__PROFILE_CREATION_IN_PROGRESS__ = new Set();
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout')), 10000);
        });

        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Initialize sync if user exists
          if (session?.user) {
            supabaseSync.setUser(session.user);
            // Add timeout to profile creation as well
            try {
              await Promise.race([
                ensureUserProfile(session.user),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Profile creation timeout')), 5000))
              ]);
            } catch (profileError) {
              console.error('Profile creation failed or timed out:', profileError);
              // Continue anyway - the app should work even if profile creation fails
            }
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
      // Prevent duplicate profile creation attempts
      if (typeof window !== 'undefined' && window.__PROFILE_CREATION_IN_PROGRESS__?.has(user.id)) {
        console.log('Profile creation already in progress for user:', user.id);
        return;
      }

      try {
        // Mark as in progress
        if (typeof window !== 'undefined') {
          window.__PROFILE_CREATION_IN_PROGRESS__?.add(user.id);
        }

        // First try to check if user exists using direct query
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid 406 errors

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error checking user profile:', checkError);
          return;
        }

        if (!existingUser) {
          await createUserProfile(user);
        } else {
          console.log('User profile already exists');
        }
      } catch (error) {
        console.error('Error in ensureUserProfile:', error);
      } finally {
        // Clear progress flag
        if (typeof window !== 'undefined') {
          window.__PROFILE_CREATION_IN_PROGRESS__?.delete(user.id);
        }
      }
    };

    // Helper function to create user profile
    const createUserProfile = async (user: User) => {
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          throw insertError;
        } else {
          console.log('User profile created successfully');
        }
      } catch (error) {
        console.error('Error in createUserProfile:', error);
        throw error;
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
        try {
          await Promise.race([
            ensureUserProfile(session.user),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Profile creation timeout')), 5000))
          ]);
        } catch (profileError) {
          console.error('Profile creation on sign-in failed:', profileError);
          // Continue anyway - don't block sign in
        }
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
