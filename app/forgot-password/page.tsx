'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-black">Check Your Email</h1>
          <p className="text-gray-500">
            We've sent a password reset link to <span className="font-semibold text-black">{email}</span>
          </p>
          <p className="text-gray-400 text-sm">
            Click the link in the email to reset your password. If you don't see it, check your spam folder.
          </p>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform"
          >
            BACK TO LOGIN
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black">Forgot Password?</h1>
          <p className="text-gray-500 mt-2">No worries, we'll send you reset instructions.</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-black text-lg focus:outline-none focus:border-[#FF4D00] transition-colors"
            style={{ fontSize: '16px' }}
            autoFocus
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !email}
            className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'SENDING...' : 'RESET PASSWORD'}
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 bg-gray-100 text-gray-600 text-lg font-bold rounded-xl active:scale-95 transition-transform"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
