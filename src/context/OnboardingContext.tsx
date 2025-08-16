import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  shouldShowOnboarding: boolean;
  showOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    if (user) {
      const onboardingKey = `rowgram_onboarding_${user.id}`;
      const hasCompletedOnboarding = localStorage.getItem(onboardingKey);

      if (!hasCompletedOnboarding) {
        // Small delay to let the UI settle
        setTimeout(() => {
          setShouldShowOnboarding(true);
        }, 1000);
      }
    }
  }, [user]);

  const showOnboarding = () => {
    setShouldShowOnboarding(true);
  };

  const completeOnboarding = () => {
    setShouldShowOnboarding(false);
    if (user) {
      const onboardingKey = `rowgram_onboarding_${user.id}`;
      localStorage.setItem(onboardingKey, 'completed');
    }
  };

  const resetOnboarding = () => {
    if (user) {
      const onboardingKey = `rowgram_onboarding_${user.id}`;
      localStorage.removeItem(onboardingKey);
    }
    setShouldShowOnboarding(true);
  };

  return (
    <OnboardingContext.Provider
      value={{
        shouldShowOnboarding,
        showOnboarding,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
