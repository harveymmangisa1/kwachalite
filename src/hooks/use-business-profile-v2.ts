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
const TIMEOUT_MS = 30000;

// Create a promise that rejects after timeout
function withTimeout<T>(promise: Promise<T> | any, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), ms);
    })
  ]);
}

function loadProfileFromLocalStorage(userId: string): BusinessProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const localStorageKey = `business_profile_${userId}`;
    const savedProfile = localStorage.getItem(localStorageKey);
    if (!savedProfile) return null;
    return JSON.parse(savedProfile) as BusinessProfile;
  } catch (error) {
    console.warn('Failed to load business profile from localStorage:', error);
    return null;
  }
}

function getPendingSyncFlag(userId: string) {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`business_profile_pending_sync_${userId}`) === '1';
  } catch {
    return false;
  }
}

function setPendingSyncFlag(userId: string, value: boolean) {
  if (typeof window === 'undefined') return;
  try {
    const key = `business_profile_pending_sync_${userId}`;
    if (value) {
      localStorage.setItem(key, '1');
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Failed to update business profile pending sync flag:', error);
  }
}

export function useBusinessProfile() {
  const { user, loading: authLoading } = useAuth();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState(false);
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
        setPendingSync(false);
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
      
      // Try to load from Supabase first (primary source)
      // Only load from localStorage if offline or for initial loading state
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      
      if (isOffline) {
        const profileFromLocal = loadProfileFromLocalStorage(user.id);
        if (profileFromLocal) {
          console.log('Business profile loaded from localStorage (offline mode)');
          if (mounted.current) {
            setBusinessProfile(profileFromLocal);
            setIsLoading(false);
            setError(null);
            setPendingSync(getPendingSyncFlag(user.id));
          }
          return; // Don't try Supabase if offline
        }
      }
      
      // Try to load from Supabase (using dedicated table) - PRIMARY SOURCE
      try {
        console.log('Attempting to load from Supabase business_profiles table...');
        
        const { data, error: queryError } = await withTimeout(
          supabase
            .from('business_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          TIMEOUT_MS
        );
        
        // Check if component is still mounted and request wasn't aborted
        if (!mounted.current || currentController.signal.aborted) {
          return;
        }

        if (queryError) {
          if (queryError.code === 'PGRST116') {
            // Record not found - this is ok, we already have localStorage data
            console.log('No business profile found in Supabase business_profiles table');
          } else if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
            // Table doesn't exist - we'll use localStorage
            console.warn('business_profiles table does not exist:', queryError.message);
          } else {
            // Other error - log but don't fail
            console.warn(`Supabase error (using localStorage): ${queryError.message}`);
          }
          const profileFromLocal = loadProfileFromLocalStorage(user.id);
          if (profileFromLocal && mounted.current) {
            setBusinessProfile(profileFromLocal);
            setError(null);
            setPendingSync(getPendingSyncFlag(user.id));
          }
        } else if (data) {
          // Successfully loaded from Supabase
          const supabaseProfile: BusinessProfile = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            logo_url: data.logo_url || undefined,
            website: data.website || undefined,
            taxId: data.tax_id || undefined,
            registrationNumber: data.registration_number || undefined,
            termsAndConditions: data.terms_and_conditions || undefined,
            paymentDetails: data.payment_details || undefined,
            bankDetails: data.payment_details || undefined, // Note: bank_details field doesn't exist in schema
            bankName: data.bank_name || undefined,
            accountName: data.account_name || undefined,
            accountNumber: data.account_number || undefined,
            routingNumber: data.routing_number || undefined,
            swiftCode: data.swift_code || undefined,
          };
          
          console.log('Business profile loaded successfully from Supabase');
          if (mounted.current) {
            setBusinessProfile(supabaseProfile);
            setError(null);
            setPendingSync(false);
            setPendingSyncFlag(user.id, false);
            
            // Update localStorage with latest data
            try {
              const localStorageKey = `business_profile_${user.id}`;
              localStorage.setItem(localStorageKey, JSON.stringify(supabaseProfile));
            } catch (e) {
              console.warn('Failed to update localStorage:', e);
            }
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase load failed, using localStorage fallback:', supabaseError);
        const profileFromLocal = loadProfileFromLocalStorage(user.id);
        if (profileFromLocal && mounted.current) {
          setBusinessProfile(profileFromLocal);
          setError(null);
          setPendingSync(getPendingSyncFlag(user.id));
          return;
        }
      }
      
      // If we don't have any data from any source, set to null
      if (mounted.current && !businessProfile) {
        console.log('No business profile found in Supabase or localStorage');
        setBusinessProfile(null);
      }
      
    } catch (error) {
      // Don't set error if component unmounted or request was aborted
      if (!mounted.current || currentController.signal.aborted) {
        return;
      }
      
      console.error('Error loading business profile:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load business profile';
      const profileFromLocal = user ? loadProfileFromLocalStorage(user.id) : null;
      if (profileFromLocal && mounted.current) {
        setBusinessProfile(profileFromLocal);
        setError(null);
        setPendingSync(getPendingSyncFlag(user.id));
      } else if (mounted.current) {
        setError(errorMessage);
        setBusinessProfile(null);
        setPendingSync(false);
      }
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
      
 // Try to save to Supabase FIRST (primary storage)
      try {
        console.log('Attempting to save to Supabase business_profiles table (PRIMARY)...');
        
        // Check if record exists first
        const { data: existingData } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        let supabaseError;
        
        if (existingData) {
          // Update existing record
          const { error } = await supabase
            .from('business_profiles')
            .update({
              name: updatedProfile.name,
              email: updatedProfile.email,
              phone: updatedProfile.phone,
              address: updatedProfile.address,
              logo_url: updatedProfile.logo_url || null,
              website: updatedProfile.website || null,
              tax_id: updatedProfile.taxId || null,
              registration_number: updatedProfile.registrationNumber || null,
              terms_and_conditions: updatedProfile.termsAndConditions || null,
              payment_details: updatedProfile.paymentDetails || null,
              bank_name: updatedProfile.bankName || null,
              account_name: updatedProfile.accountName || null,
              account_number: updatedProfile.accountNumber || null,
              routing_number: updatedProfile.routingNumber || null,
              swift_code: updatedProfile.swiftCode || null,
            })
            .eq('user_id', user.id);
          supabaseError = error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('business_profiles')
            .insert({
              user_id: user.id,
              name: updatedProfile.name,
              email: updatedProfile.email,
              phone: updatedProfile.phone,
              address: updatedProfile.address,
              logo_url: updatedProfile.logo_url || null,
              website: updatedProfile.website || null,
              tax_id: updatedProfile.taxId || null,
              registration_number: updatedProfile.registrationNumber || null,
              terms_and_conditions: updatedProfile.termsAndConditions || null,
              payment_details: updatedProfile.paymentDetails || null,
              bank_name: updatedProfile.bankName || null,
              account_name: updatedProfile.accountName || null,
              account_number: updatedProfile.accountNumber || null,
              routing_number: updatedProfile.routingNumber || null,
              swift_code: updatedProfile.swiftCode || null,
            });
          supabaseError = error;
        }
        
        if (supabaseError) {
          console.warn('Database schema issue during save, falling back to localStorage:', supabaseError);
          throw new Error(`Failed to save business profile to Supabase: ${supabaseError.message}`);
        }
        
        console.log('Successfully saved business profile to Supabase (PRIMARY)');
        setPendingSyncFlag(user.id, false);
        if (mounted.current) {
          setPendingSync(false);
        }
        
        // Update localStorage cache from successful Supabase save
        try {
          const localStorageKey = `business_profile_${user.id}`;
          localStorage.setItem(localStorageKey, JSON.stringify(updatedProfile));
          console.log('Business profile cached to localStorage from Supabase save');
        } catch (e) {
          console.warn('Failed to update localStorage cache:', e);
        }
        
        // Update local state immediately
        if (mounted.current) {
          setBusinessProfile(updatedProfile);
        }
        
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, falling back to localStorage:', supabaseError);
        
        // Fallback: save to localStorage ONLY if Supabase fails
        try {
          const localStorageKey = `business_profile_${user.id}`;
          localStorage.setItem(localStorageKey, JSON.stringify(updatedProfile));
          console.log('Successfully saved business profile to localStorage (fallback)');
          setPendingSyncFlag(user.id, true);
          
          // Update local state immediately
          if (mounted.current) {
            setBusinessProfile(updatedProfile);
            setPendingSync(true);
          }
          
          // Don't throw - we already saved to localStorage
          console.warn('Supabase save failed, but localStorage save successful');
        } catch (localError) {
          console.error('Failed to save to localStorage as well:', localError);
          throw new Error('Failed to save business profile. Please try again.');
        }
      }
      try {
        console.log('Attempting to save to Supabase business_profiles table...');
        
        // Check if record exists first
        const { data: existingData } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        const supabaseData = {
          user_id: user.id,
          name: updatedProfile.name,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          address: updatedProfile.address,
          logo_url: updatedProfile.logo_url || null,
          website: updatedProfile.website || null,
          tax_id: updatedProfile.taxId || null,
          registration_number: updatedProfile.registrationNumber || null,
          terms_and_conditions: updatedProfile.termsAndConditions || null,
          payment_details: updatedProfile.paymentDetails || null,
          bank_name: updatedProfile.bankName || null,
          account_name: updatedProfile.accountName || null,
          account_number: updatedProfile.accountNumber || null,
          routing_number: updatedProfile.routingNumber || null,
          swift_code: updatedProfile.swiftCode || null,
        };
        
        let result;
        if (existingData) {
          // Update existing record
          result = await supabase
            .from('business_profiles')
            .update(supabaseData)
            .eq('user_id', user.id);
        } else {
          // Insert new record
          result = await supabase
            .from('business_profiles')
            .insert(supabaseData);
        }

        if (result.error) {
          throw new Error(`Database error: ${result.error.message}`);
        }
        
        console.log('Successfully saved business profile to Supabase');
      } catch (supabaseError) {
        // Don't throw - we already saved to localStorage
        console.warn('Failed to save to Supabase (localStorage save successful):', supabaseError);
        setPendingSyncFlag(user.id, true);
        if (mounted.current) {
          setPendingSync(true);
        }
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
    pendingSync,
    updateBusinessProfile,
    getDisplayName,
    getBusinessInitials,
    isProfileComplete,
    refreshProfile,
    // Convenience getters
    hasProfile: !!businessProfile,
  };
}
