// Subscription management for 66 Challenge

export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionPeriod = 'monthly' | 'annual' | 'lifetime';

export interface SubscriptionState {
  tier: SubscriptionTier;
  period?: SubscriptionPeriod;
  expiresAt?: string;
  isTrialActive: boolean;
  trialEndsAt?: string;
}

export interface ProFeatures {
  maxHabits: number;
  photoGallery: boolean;
  fullActivityFeed: boolean;
  reactions: boolean;
  advancedStats: boolean;
  allBadges: boolean;
  customChallenges: boolean;
  exports: boolean;
  friends: boolean;
  squads: boolean;
}

// Feature limits per tier
export const TIER_FEATURES: Record<SubscriptionTier, ProFeatures> = {
  free: {
    maxHabits: 3,
    photoGallery: false,
    fullActivityFeed: false,
    reactions: false,
    advancedStats: false,
    allBadges: false,
    customChallenges: false,
    exports: false,
    friends: false,
    squads: false,
  },
  pro: {
    maxHabits: 99,
    photoGallery: true,
    fullActivityFeed: true,
    reactions: true,
    advancedStats: true,
    allBadges: true,
    customChallenges: true,
    exports: true,
    friends: true,
    squads: true,
  },
};

// Product IDs for App Store
export const PRODUCT_IDS = {
  proMonthly: 'com.the66challenge.pro.monthly',
  proAnnual: 'com.the66challenge.pro.annual',
  proLifetime: 'com.the66challenge.pro.lifetime',
};

// Pricing (display only - actual prices set in App Store Connect)
export const PRICING = {
  monthly: { price: 4.99, currency: '€' },
  annual: { price: 34.99, currency: '€', savings: '40%' },
  lifetime: { price: 69.99, currency: '€' },
};

// Local storage key
const SUBSCRIPTION_KEY = '66challenge_subscription';
const TRIAL_KEY = '66challenge_trial';

// Get subscription state from storage
export function getSubscriptionState(): SubscriptionState {
  if (typeof window === 'undefined') {
    return { tier: 'free', isTrialActive: false };
  }

  const stored = localStorage.getItem(SUBSCRIPTION_KEY);
  const trial = localStorage.getItem(TRIAL_KEY);

  if (stored) {
    const state = JSON.parse(stored) as SubscriptionState;
    
    // Check if subscription expired
    if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
      // Expired, revert to free
      return { tier: 'free', isTrialActive: false };
    }
    
    return state;
  }

  // Check trial
  if (trial) {
    const trialData = JSON.parse(trial);
    if (new Date(trialData.endsAt) > new Date()) {
      return {
        tier: 'pro',
        isTrialActive: true,
        trialEndsAt: trialData.endsAt,
      };
    }
  }

  return { tier: 'free', isTrialActive: false };
}

// Save subscription state
export function saveSubscriptionState(state: SubscriptionState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(state));
}

// Start 7-day trial (from referral)
export function startTrial(days: number = 7): void {
  if (typeof window === 'undefined') return;
  
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + days);
  
  localStorage.setItem(TRIAL_KEY, JSON.stringify({
    startedAt: new Date().toISOString(),
    endsAt: endsAt.toISOString(),
  }));
}

// Check if user can access a feature
export function canAccessFeature(feature: keyof ProFeatures): boolean {
  const state = getSubscriptionState();
  return TIER_FEATURES[state.tier][feature] as boolean;
}

// Get max habits allowed
export function getMaxHabits(): number {
  const state = getSubscriptionState();
  return TIER_FEATURES[state.tier].maxHabits;
}

// Check if user is Pro
export function isPro(): boolean {
  const state = getSubscriptionState();
  return state.tier === 'pro';
}

// For testing: simulate purchase
export function simulatePurchase(period: SubscriptionPeriod): void {
  let expiresAt: Date | undefined;
  
  if (period === 'monthly') {
    expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else if (period === 'annual') {
    expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }
  // lifetime = no expiry

  saveSubscriptionState({
    tier: 'pro',
    period,
    expiresAt: expiresAt?.toISOString(),
    isTrialActive: false,
  });
}
