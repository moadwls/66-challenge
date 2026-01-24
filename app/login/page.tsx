'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { user } = await signIn(email, password);
      
      // Get user profile from Supabase
      if (user) {
        localStorage.setItem('onboardingComplete', 'true');
        router.push('/today');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-20 h-20 mx-auto object-contain mb-4"
          />
          <h1 className="text-3xl font-black">Welcome Back!</h1>
          <p className="text-gray-500 font-light mt-2">Sign in to continue your challenge</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-black text-lg focus:outline-none focus:border-[#FF4D00] transition-colors"
            style={{ fontSize: '16px' }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-black text-lg focus:outline-none focus:border-[#FF4D00] transition-colors"
            style={{ fontSize: '16px' }}
          />

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              onClick={() => router.push('/forgot-password')}
              className="text-[#FF4D00] text-sm font-medium"
            >
              Forgot password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading || !email || !password}
            className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>

          <div className="text-center pt-4">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/onboarding')}
                className="text-[#FF4D00] font-bold"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Legal Links */}
          <div className="pt-6 text-center text-sm text-gray-400">
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
    </div>
  );
}
