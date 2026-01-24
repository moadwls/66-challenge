'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SubscriptionState,
  SubscriptionTier,
  SubscriptionPeriod,
  ProFeatures,
  TIER_FEATURES,
  getSubscriptionState,
  saveSubscriptionState,
  startTrial as startTrialFn,
  simulatePurchase as simulatePurchaseFn,
} from '@/lib/subscription';

interface SubscriptionContextType {
  subscription: SubscriptionState;
  features: ProFeatures;
  isPro: boolean;
  canAccess: (feature: keyof ProFeatures) => boolean;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  paywallFeature: string | null;
  openPaywall: (feature?: string) => void;
  closePaywall: () => void;
  purchase: (period: SubscriptionPeriod) => Promise<boolean>;
  restore: () => Promise<boolean>;
  startTrial: (days?: number) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    tier: 'free',
    isTrialActive: false,
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null);

  useEffect(() => {
    // Load subscription state on mount
    const state = getSubscriptionState();
    console.log('Subscription state loaded:', state);
    setSubscription(state);
  }, []);

  const features = TIER_FEATURES[subscription.tier];
  const isPro = subscription.tier === 'pro';

  const canAccess = (feature: keyof ProFeatures): boolean => {
    return features[feature] as boolean;
  };

  const openPaywall = (feature?: string) => {
    setPaywallFeature(feature || null);
    setShowPaywall(true);
  };

  const closePaywall = () => {
    setShowPaywall(false);
    setPaywallFeature(null);
  };

  const purchase = async (period: SubscriptionPeriod): Promise<boolean> => {
    // In production, this would use StoreKit
    // For now, simulate the purchase
    try {
      simulatePurchaseFn(period);
      const newState = getSubscriptionState();
      setSubscription(newState);
      closePaywall();
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const restore = async (): Promise<boolean> => {
    // In production, this would restore from StoreKit
    // For now, just reload state
    const state = getSubscriptionState();
    setSubscription(state);
    return state.tier === 'pro';
  };

  const startTrial = (days: number = 7) => {
    startTrialFn(days);
    const newState = getSubscriptionState();
    setSubscription(newState);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        features,
        isPro,
        canAccess,
        showPaywall,
        setShowPaywall,
        paywallFeature,
        openPaywall,
        closePaywall,
        purchase,
        restore,
        startTrial,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
