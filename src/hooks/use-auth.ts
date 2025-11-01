
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { supabaseSync } from '@/lib/supabase-sync';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  session: Session | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setSession: (session: Session | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setSession: (session) => set({ session }),
}));

export const useAuth = () => {
  const { user, loading, session, setUser, setLoading, setSession } = useAuthStore();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Update Supabase sync with user
      supabaseSync.setUser(session?.user ?? null);

      // Handle user profile creation on sign up
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingUser) {
          // Create user profile if it doesn't exist
          const { error } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
              avatar_url: session.user.user_metadata?.avatar_url,
            });

          if (error) {
            console.error('Error creating user profile:', error);
          }
        }
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        supabaseSync.setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setSession]);

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
      setLoading(false);
      throw error;
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
      setLoading(false);
      throw error;
    }
  }, [setLoading]);

  const logout = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during sign-out:', error);
    }
    setUser(null);
    setSession(null);
    setLoading(false);
  }, [setLoading, setUser, setSession]);

  return useMemo(() => ({ 
    user, 
    loading, 
    session, 
    login, 
    loginWithEmail, 
    signUpWithEmail, 
    logout 
  }), [user, loading, session, login, loginWithEmail, signUpWithEmail, logout]);
};
