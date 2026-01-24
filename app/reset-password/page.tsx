'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    
    checkSession();

    // Listen for auth state changes (Supabase handles the token exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await updatePassword(password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF4D00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Invalid/expired link
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-black">Link Expired</h1>
          <p className="text-gray-500">
            This password reset link has expired or is invalid. Please request a new one.
          </p>
          
          <button
            onClick={() => router.push('/forgot-password')}
            className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform"
          >
            REQUEST NEW LINK
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-black">Password Updated!</h1>
          <p className="text-gray-500">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform"
          >
            SIGN IN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-[#FF4D00]/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#FF4D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black">Set New Password</h1>
          <p className="text-gray-500 mt-2">Create a strong password for your account.</p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-black text-lg focus:outline-none focus:border-[#FF4D00] transition-colors"
            style={{ fontSize: '16px' }}
            autoFocus
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-black text-lg focus:outline-none focus:border-[#FF4D00] transition-colors"
            style={{ fontSize: '16px' }}
          />

          {/* Password requirements */}
          <p className="text-gray-400 text-sm">Password must be at least 6 characters</p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !password || !confirmPassword}
            className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </div>
      </div>
    </div>
  );
}
