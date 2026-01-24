'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is logged in, go to today
        localStorage.setItem('onboardingComplete', 'true');
        router.push('/today');
      } else {
        // Check if they completed onboarding before
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        if (onboardingComplete) {
          // They were logged in before, show login
          router.push('/login');
        } else {
          // New user, show welcome screen
          setChecking(false);
        }
      }
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f4f3ee] flex items-center justify-center">
        <div className="text-black text-xl font-bold">Loading...</div>
      </div>
    );
  }

  // Welcome screen for new visitors
  return (
    <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-24 h-24 mx-auto object-contain"
          />
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight">66 Challenge</h1>
          <p className="text-base text-gray-500 font-light">
            Build unbreakable discipline through consistent daily habits
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-8">
          <button
            onClick={() => router.push('/onboarding')}
            className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform"
          >
            ACCEPT CHALLENGE
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 bg-[#f4f3ee] border-2 border-gray-200 text-black text-lg font-bold rounded-xl active:scale-95 transition-transform"
          >
            I HAVE AN ACCOUNT
          </button>
        </div>

        {/* Legal Links */}
        <div className="pt-8 text-center text-sm text-gray-400">
          <button onClick={() => router.push('/privacy')} className="hover:text-gray-600">
            Privacy Policy
          </button>
          <span className="mx-2">•</span>
          <button onClick={() => router.push('/terms')} className="hover:text-gray-600">
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
}

