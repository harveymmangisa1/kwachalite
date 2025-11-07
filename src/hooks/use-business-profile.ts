import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

export interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url?: string;
  // Additional fields for documents
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  termsAndConditions?: string;
  paymentDetails?: string;
  bankDetails?: string;
  // Banking details
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
}

// Timeout for database operations (10 seconds)
const TIMEOUT_MS = 10000;

// Create a promise that rejects after timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), ms);
    })
  ]);
}

export function useBusinessProfile() {
  const { user, loading: authLoading } = useAuth();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mounted = useRef(true);

  // Cleanup function
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadBusinessProfile = useCallback(async () => {
    // Don't load if auth is still loading
    if (authLoading) {
      return;
    }

    // If no user, set loading to false and return
    if (!user) {
      if (mounted.current) {
        setIsLoading(false);
        setBusinessProfile(null);
        setError(null);
      }
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    try {
      if (mounted.current) {
        setIsLoading(true);
        setError(null);
      }
      
      console.log('Loading business profile for user:', user.id);
      
      // Test database connection first
      try {
        console.log('Testing Supabase connection...');
        const testConnection = await supabase.from('user_metadata').select('count', { count: 'exact', head: true });
        console.log('Supabase connection test:', testConnection);
      } catch (connError) {
        console.warn('Supabase connection test failed:', connError);
      }
      
      // Create the database query promise
      const queryPromise = supabase
        .from('user_metadata')
        .select('metadata')
        .eq('user_id', user.id)
        .eq('key', 'business_profile')
        .single()
        ;

      // Add timeout to the query
      const { data, error: queryError } = await (supabase as any)
        .from('user_metadata')
        .select('metadata')
        .eq('user_id', user.id)
        .eq('key', 'business_profile')
        .single();
      
      // Check if component is still mounted and request wasn't aborted
      if (!mounted.current || currentController.signal.aborted) {
        return;
      }

      if (queryError) {
        if (queryError.code === 'PGRST116') {
          // Record not found - this is ok, try localStorage fallback
          console.log('No business profile found in Supabase (PGRST116), trying localStorage...');
        } else if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
          // Table doesn't exist - fall back to localStorage
          console.warn('user_metadata table does not exist, using localStorage fallback:', queryError.message);
        } else if (queryError.code === '42703' || queryError.message?.includes('column') || queryError.message?.includes('user_id')) {
          // Column doesn't exist (42703) or column-related error - fall back to localStorage
          console.warn('Database schema issue (missing columns), using localStorage fallback:', queryError.message);
        } else {
          // Other error - try localStorage fallback
          console.warn(`Supabase error, trying localStorage fallback: ${queryError.message}`);
        }
        
        // Try to load from localStorage
        try {
          const localStorageKey = `business_profile_${user.id}`;
          const savedProfile = localStorage.getItem(localStorageKey);
          if (savedProfile) {
            console.log('Business profile loaded from localStorage');
            setBusinessProfile(JSON.parse(savedProfile) as BusinessProfile);
            return;
          }
        } catch (localError) {
          console.warn('Failed to load from localStorage as well:', localError);
        }
        
        // If localStorage also fails and it's a critical error, throw
        if (queryError.code !== 'PGRST116' && !queryError.message?.includes('does not exist')) {
          throw new Error(`Failed to load business profile: ${queryError.message}`);
        }
      }

      if (data && data.metadata) {
        console.log('Business profile loaded successfully from Supabase');
        setBusinessProfile(data.metadata as BusinessProfile);
      } else {
        // No data in Supabase, try localStorage
        try {
          const localStorageKey = `business_profile_${user.id}`;
          const savedProfile = localStorage.getItem(localStorageKey);
          if (savedProfile) {
            console.log('Business profile loaded from localStorage (no Supabase data)');
            setBusinessProfile(JSON.parse(savedProfile) as BusinessProfile);
          } else {
            console.log('No business profile found in Supabase or localStorage');
            setBusinessProfile(null);
          }
        } catch (localError) {
          console.warn('Failed to load from localStorage:', localError);
          setBusinessProfile(null);
        }
      }
    } catch (error) {
      // Don't set error if component unmounted or request was aborted
      if (!mounted.current || currentController.signal.aborted) {
        return;
      }
      
      console.error('Error loading business profile:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load business profile';
      setError(errorMessage);
      setBusinessProfile(null);
    } finally {
      // Only update loading state if component is still mounted
      if (mounted.current && !currentController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadBusinessProfile();
  }, [loadBusinessProfile]);

  const updateBusinessProfile = useCallback(async (updatedProfile: BusinessProfile) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('Attempting to update business profile...');
      
      // First, try to save to Supabase
      let supabaseSuccess = false;
      
      try {
        // Check if we need to insert or update
        const existingQuery = supabase
          .from('user_metadata')
          .select('id')
          .eq('user_id', user.id)
          .eq('key', 'business_profile')
          .single();
        
        const { data: existingData } = await (supabase as any)
          .from('user_metadata')
          .select('id')
          .eq('user_id', user.id)
          .eq('key', 'business_profile')
          .single();

        let result;
        
        if (existingData) {
          // Update existing record
          result = await (supabase as any)
            .from('user_metadata')
            .update({
              metadata: updatedProfile,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('key', 'business_profile');
        } else {
          // Insert new record
          result = await (supabase as any)
            .from('user_metadata')
            .insert({
              user_id: user.id,
              key: 'business_profile',
              metadata: updatedProfile
            });
        }

        if (result.error) {
          throw new Error(`Database error: ${result.error.message}`);
        }
        
        console.log('Successfully saved business profile to Supabase');
        supabaseSuccess = true;
      } catch (supabaseError) {
        const errorMessage = supabaseError instanceof Error ? supabaseError.message : String(supabaseError);
        if (errorMessage.includes('42703') || errorMessage.includes('column') || errorMessage.includes('user_id')) {
          console.warn('Database schema issue during save, falling back to localStorage:', supabaseError);
        } else {
          console.warn('Failed to save to Supabase, falling back to localStorage:', supabaseError);
        }
        
        // Fallback: save to localStorage
        try {
          const localStorageKey = `business_profile_${user.id}`;
          localStorage.setItem(localStorageKey, JSON.stringify(updatedProfile));
          console.log('Successfully saved business profile to localStorage');
        } catch (localError) {
          console.error('Failed to save to localStorage as well:', localError);
          throw new Error('Failed to save business profile. Please try again.');
        }
      }

      // Update local state
      if (mounted.current) {
        setBusinessProfile(updatedProfile);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
  }, [user]);
  
  // Refresh function to reload data manually
  const refreshProfile = useCallback(() => {
    loadBusinessProfile();
  }, [loadBusinessProfile]);

  // Helper function to get display name
  const getDisplayName = () => {
    if (businessProfile?.name) {
      return businessProfile.name;
    }
    return user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Business';
  };

  // Helper function to get business initials for avatar
  const getBusinessInitials = () => {
    if (businessProfile?.name) {
      return businessProfile.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'BIZ';
  };

  // Check if business profile is complete enough for documents
  const isProfileComplete = () => {
    return !!(businessProfile?.name && businessProfile?.email && businessProfile?.address);
  };

  return {
    businessProfile,
    isLoading,
    error,
    updateBusinessProfile,
    getDisplayName,
    getBusinessInitials,
    isProfileComplete,
    refreshProfile,
    // Convenience getters
    hasProfile: !!businessProfile,
  };
}