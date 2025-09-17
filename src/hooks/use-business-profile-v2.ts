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
      
      // Try to load from localStorage first (fastest)
      const localStorageKey = `business_profile_${user.id}`;
      let profileFromLocal = null;
      
      try {
        const savedProfile = localStorage.getItem(localStorageKey);
        if (savedProfile) {
          profileFromLocal = JSON.parse(savedProfile) as BusinessProfile;
          console.log('Business profile loaded from localStorage');
          if (mounted.current) {
            setBusinessProfile(profileFromLocal);
            setIsLoading(false);
          }
        }
      } catch (localError) {
        console.warn('Failed to load from localStorage:', localError);
      }
      
      // Now try to load from Supabase (using dedicated table)
      try {
        console.log('Attempting to load from Supabase business_profiles table...');
        
        const queryPromise = supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
          .abortSignal(currentController.signal);

        const { data, error: queryError } = await withTimeout(queryPromise, TIMEOUT_MS);
        
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
        } else if (data) {
          // Successfully loaded from Supabase
          const supabaseProfile: BusinessProfile = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            logo_url: data.logo_url,
            website: data.website,
            taxId: data.tax_id,
            registrationNumber: data.registration_number,
            termsAndConditions: data.terms_and_conditions,
            paymentDetails: data.payment_details,
            bankDetails: data.bank_details,
            bankName: data.bank_name,
            accountName: data.account_name,
            accountNumber: data.account_number,
            routingNumber: data.routing_number,
            swiftCode: data.swift_code,
          };
          
          console.log('Business profile loaded successfully from Supabase');
          if (mounted.current) {
            setBusinessProfile(supabaseProfile);
            
            // Update localStorage with latest data
            try {
              localStorage.setItem(localStorageKey, JSON.stringify(supabaseProfile));
            } catch (e) {
              console.warn('Failed to update localStorage:', e);
            }
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase load failed, using localStorage fallback:', supabaseError);
        // We already set profileFromLocal above, so no need to do anything else
      }
      
      // If we don't have any data from either source, set to null
      if (!profileFromLocal && mounted.current && !businessProfile) {
        console.log('No business profile found in any storage');
        setBusinessProfile(null);
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
      
      // Always save to localStorage first (fast and reliable)
      try {
        const localStorageKey = `business_profile_${user.id}`;
        localStorage.setItem(localStorageKey, JSON.stringify(updatedProfile));
        console.log('Successfully saved business profile to localStorage');
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
        throw new Error('Failed to save business profile locally. Please try again.');
      }
      
      // Update local state immediately
      if (mounted.current) {
        setBusinessProfile(updatedProfile);
      }
      
      // Try to save to Supabase in background
      try {
        console.log('Attempting to save to Supabase business_profiles table...');
        
        // Check if record exists first
        const { data: existingData } = await withTimeout(
          supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single(),
          TIMEOUT_MS
        );

        const supabaseData = {
          user_id: user.id,
          name: updatedProfile.name,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          address: updatedProfile.address,
          logo_url: updatedProfile.logo_url,
          website: updatedProfile.website,
          tax_id: updatedProfile.taxId,
          registration_number: updatedProfile.registrationNumber,
          terms_and_conditions: updatedProfile.termsAndConditions,
          payment_details: updatedProfile.paymentDetails,
          bank_details: updatedProfile.bankDetails,
          bank_name: updatedProfile.bankName,
          account_name: updatedProfile.accountName,
          account_number: updatedProfile.accountNumber,
          routing_number: updatedProfile.routingNumber,
          swift_code: updatedProfile.swiftCode,
        };
        
        let result;
        if (existingData) {
          // Update existing record
          result = await withTimeout(
            supabase
              .from('business_profiles')
              .update(supabaseData)
              .eq('user_id', user.id),
            TIMEOUT_MS
          );
        } else {
          // Insert new record
          result = await withTimeout(
            supabase
              .from('business_profiles')
              .insert(supabaseData),
            TIMEOUT_MS
          );
        }

        if (result.error) {
          throw new Error(`Database error: ${result.error.message}`);
        }
        
        console.log('Successfully saved business profile to Supabase');
      } catch (supabaseError) {
        // Don't throw - we already saved to localStorage
        console.warn('Failed to save to Supabase (localStorage save successful):', supabaseError);
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