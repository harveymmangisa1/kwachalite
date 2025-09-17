import { useState, useEffect } from 'react';

const ONBOARDING_COMPLETED_KEY = 'kwachalite-onboarding-completed';

export function useOnboarding() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    // Check localStorage on initial load
    const saved = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return saved === 'true';
  });

  const completeOnboarding = () => {
    setIsOnboardingCompleted(true);
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  };

  const resetOnboarding = () => {
    setIsOnboardingCompleted(false);
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  };

  const skipOnboarding = () => {
    // Same as completing, but we could add analytics here to track skips
    completeOnboarding();
  };

  return {
    isOnboardingCompleted,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,
  };
}