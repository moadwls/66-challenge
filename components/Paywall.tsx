'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PRICING, SubscriptionPeriod } from '@/lib/subscription';

export default function Paywall() {
  const { showPaywall, closePaywall, paywallFeature, purchase, restore } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPeriod>('annual');
  const [loading, setLoading] = useState(false);

  if (!showPaywall) return null;

  const handlePurchase = async () => {
    setLoading(true);
    await purchase(selectedPlan);
    setLoading(false);
  };

  const handleRestore = async () => {
    setLoading(true);
    const success = await restore();
    setLoading(false);
    if (!success) {
      alert('No previous purchases found');
    }
  };

  const featureMessages: Record<string, string> = {
    habits: 'Unlock unlimited habits',
    gallery: 'Access your progress gallery',
    reactions: 'React to friends\' activities',
    stats: 'View advanced statistics',
    badges: 'Unlock all badges',
    exports: 'Export your data',
    friends: 'Unlock Friends & social features',
    squads: 'Create and join Squads',
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
      <div className="bg-[#f4f3ee] w-full max-w-lg rounded-t-3xl p-6 pb-10 animate-slideUp">
        {/* Close button */}
        <button
          onClick={closePaywall}
          className="absolute top-4 right-4 text-gray-400 text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-[#FF6B35] to-[#FF4D00] rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black">Upgrade to Pro</h2>
          {paywallFeature && (
            <p className="text-gray-600 mt-1">
              {featureMessages[paywallFeature] || 'Unlock all features'}
            </p>
          )}
        </div>

        {/* Features */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <ul className="space-y-3">
            <FeatureItem text="Unlimited habits & custom challenges" />
            <FeatureItem text="Friends, Squads & social features" />
            <FeatureItem text="Full activity feed & reactions" />
            <FeatureItem text="Progress photo gallery" />
          </ul>
        </div>

        {/* Plan selection */}
        <div className="space-y-3 mb-6">
          {/* Monthly */}
          <PlanOption
            period="monthly"
            price={PRICING.monthly.price}
            label="Monthly"
            sublabel="Cancel anytime"
            selected={selectedPlan === 'monthly'}
            onSelect={() => setSelectedPlan('monthly')}
          />

          {/* Annual - Recommended */}
          <PlanOption
            period="annual"
            price={PRICING.annual.price}
            label="Annual"
            sublabel={`Save ${PRICING.annual.savings}`}
            selected={selectedPlan === 'annual'}
            recommended
            onSelect={() => setSelectedPlan('annual')}
          />

          {/* Lifetime */}
          <PlanOption
            period="lifetime"
            price={PRICING.lifetime.price}
            label="Lifetime"
            sublabel="Pay once, own forever"
            selected={selectedPlan === 'lifetime'}
            onSelect={() => setSelectedPlan('lifetime')}
          />
        </div>

        {/* Purchase button */}
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>

        {/* Restore & Terms */}
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <button
            onClick={handleRestore}
            className="text-gray-500 underline"
          >
            Restore Purchase
          </button>
          <span className="text-gray-300">|</span>
          <a href="/terms" className="text-gray-500 underline">Terms</a>
          <span className="text-gray-300">|</span>
          <a href="/privacy" className="text-gray-500 underline">Privacy</a>
        </div>

        {/* Legal text */}
        <p className="text-xs text-gray-400 text-center mt-4">
          {selectedPlan === 'lifetime'
            ? 'One-time purchase. No subscription.'
            : `Subscription auto-renews ${selectedPlan === 'annual' ? 'annually' : 'monthly'} unless cancelled at least 24 hours before the end of the current period.`}
        </p>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-black">
      <svg className="w-5 h-5 text-[#FF4D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{text}</span>
    </li>
  );
}

interface PlanOptionProps {
  period: SubscriptionPeriod;
  price: number;
  label: string;
  sublabel: string;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
}

function PlanOption({
  period,
  price,
  label,
  sublabel,
  selected,
  recommended,
  onSelect,
}: PlanOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
        selected
          ? 'border-[#FF4D00] bg-orange-50'
          : 'border-gray-200 bg-[#f4f3ee]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected ? 'border-[#FF4D00]' : 'border-gray-300'
          }`}
        >
          {selected && <div className="w-3 h-3 rounded-full bg-[#FF4D00]" />}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-black">{label}</span>
            {recommended && (
              <span className="text-xs bg-[#FF4D00] text-white px-2 py-0.5 rounded-full">
                BEST VALUE
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">{sublabel}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xl font-bold text-black">€{price}</span>
        {period !== 'lifetime' && (
          <span className="text-sm text-gray-500">
            /{period === 'annual' ? 'year' : 'month'}
          </span>
        )}
      </div>
    </button>
  );
}
