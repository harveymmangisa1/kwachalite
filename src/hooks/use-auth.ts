
'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
}

const useAuthStore = create<AuthState>(() => ({
  user: null,
  loading: true,
}));

export const useAuth = () => {
  const { user, loading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      useAuthStore.setState({ user, loading: false });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { user, loading };
};
