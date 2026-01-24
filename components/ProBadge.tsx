'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';

interface ProBadgeProps {
  feature?: string;
  className?: string;
}

export function ProBadge({ className = '' }: ProBadgeProps) {
  return (
    <span className={`text-xs bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white px-2 py-0.5 rounded-full font-medium ${className}`}>
      PRO
    </span>
  );
}

interface ProGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProGate({ feature, children, fallback }: ProGateProps) {
  const { isPro, openPaywall } = useSubscription();

  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <button
      onClick={() => openPaywall(feature)}
      className="relative w-full"
    >
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
        <div className="bg-[#f4f3ee] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <ProBadge />
          <span className="text-sm font-medium text-black">Unlock</span>
        </div>
      </div>
    </button>
  );
}

interface LockedOverlayProps {
  feature: string;
  message?: string;
}

export function LockedOverlay({ feature, message }: LockedOverlayProps) {
  const { openPaywall } = useSubscription();

  return (
    <div 
      onClick={() => openPaywall(feature)}
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl cursor-pointer"
    >
      <div className="bg-[#f4f3ee] px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
        <ProBadge />
        <span className="text-sm font-medium text-black">
          {message || 'Upgrade to unlock'}
        </span>
      </div>
    </div>
  );
}
