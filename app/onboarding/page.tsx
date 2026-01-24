'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import { requestNotificationPermission, scheduleDailyReminder } from '@/lib/notifications';
import { DIFFICULTY_PRESETS, DifficultyLevel, saveUserHabits } from '@/types';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ProBadge } from '@/components/ProBadge';

type OnboardingStep = 'welcome' | 'details' | 'password' | 'difficulty' | 'goal' | 'ready';

// Which difficulties require Pro
const PRO_DIFFICULTIES: DifficultyLevel[] = ['hard', 'extreme'];

export default function OnboardingPage() {
  const router = useRouter();
  const { isPro, openPaywall } = useSubscription();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Save user's habits based on difficulty
      if (difficulty) {
        saveUserHabits(DIFFICULTY_PRESETS[difficulty].habits);
      }
      
      // Create account in Supabase (with username)
      await signUp(email, password, name, goal, username.toLowerCase());
      
      // Save to localStorage for backwards compatibility
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userGoal', goal);
      localStorage.setItem('userUsername', username.toLowerCase());
      localStorage.setItem('userDifficulty', difficulty || 'medium');
      localStorage.setItem('onboardingComplete', 'true');
      
      // Request notification permission and enable by default
      const granted = await requestNotificationPermission();
      if (granted) {
        scheduleDailyReminder(20, 0); // Default 8 PM
      }
      
      // Navigate to main app
      router.push('/today');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-24 h-24 mx-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tight leading-tight">Welcome to the 66 Challenge</h1>
            <p className="text-base text-gray-500 font-light">
              Build unbreakable discipline through consistent daily habits
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 text-left py-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#FF4D00] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">Choose Your Difficulty</h3>
                <p className="text-sm text-gray-500">Pick a challenge level that suits you</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#FF4D00] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">Track Progress</h3>
                <p className="text-sm text-gray-500">Photos and calendar views</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#FF4D00] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">Build Discipline</h3>
                <p className="text-sm text-gray-500">It takes 66 days to form a habit</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setStep('details')}
            className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform"
          >
            GET STARTED
          </button>
        </div>
      </div>
    );
  }

  // Combined Details Screen (Name, Username, Email)
  if (step === 'details') {
    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const canContinue = name.trim() && username.length >= 3 && isValidEmail(email);

    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black">Create your account</h1>
            <p className="text-gray-500 font-light">Let's get you set up</p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-500 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-black focus:outline-none focus:border-[#FF4D00] transition-colors"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm text-gray-500 mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF4D00] font-medium">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                  placeholder="username"
                  className="w-full p-4 pl-10 bg-gray-100 border-2 border-gray-200 rounded-xl text-black focus:outline-none focus:border-[#FF4D00] transition-colors"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Friends can find you with this</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-500 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-black focus:outline-none focus:border-[#FF4D00] transition-colors"
                style={{ fontSize: '16px' }}
              />
            </div>

            <button
              onClick={() => setStep('password')}
              disabled={!canContinue}
              className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed mt-2"
            >
              CONTINUE
            </button>

            <button
              onClick={() => setStep('welcome')}
              className="w-full py-3 text-gray-400 text-sm font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Password Input Screen
  if (step === 'password') {
    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-black">Create a password</h1>
            <p className="text-gray-500 font-light">Must be at least 6 characters</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-black text-lg focus:outline-none focus:border-[#FF4D00] transition-colors"
              style={{ fontSize: '16px' }}
              autoFocus
            />

            <button
              onClick={() => setStep('difficulty')}
              disabled={password.length < 6}
              className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
            >
              CONTINUE
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              By continuing, you agree to our{' '}
              <button onClick={() => router.push('/terms')} className="text-[#FF4D00] underline">
                Terms of Service
              </button>
              {' '}and{' '}
              <button onClick={() => router.push('/privacy')} className="text-[#FF4D00] underline">
                Privacy Policy
              </button>
            </p>

            <button
              onClick={() => setStep('details')}
              className="w-full py-3 text-gray-400 text-sm font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Difficulty Selection Screen
  if (step === 'difficulty') {
    const difficulties: { key: DifficultyLevel; color: string }[] = [
      { key: 'medium', color: 'from-yellow-400 to-orange-400' },
      { key: 'hard', color: 'from-orange-500 to-red-500' },
      { key: 'extreme', color: 'from-red-500 to-red-700' },
    ];

    const handleDifficultySelect = (key: DifficultyLevel) => {
      console.log('Difficulty selected:', key, 'isPro:', isPro, 'requiresPro:', PRO_DIFFICULTIES.includes(key));
      if (PRO_DIFFICULTIES.includes(key) && !isPro) {
        console.log('Opening paywall for:', key);
        openPaywall('habits');
        return;
      }
      setDifficulty(key);
    };

    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-5">
        <div className="max-w-md w-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-black">Choose Your Challenge</h1>
            <p className="text-gray-500 text-sm">Select a difficulty level</p>
          </div>

          {/* Difficulty Options */}
          <div className="space-y-2">
            {difficulties.map(({ key, color }) => {
              const preset = DIFFICULTY_PRESETS[key];
              const isSelected = difficulty === key;
              const requiresPro = PRO_DIFFICULTIES.includes(key);
              const isLocked = requiresPro && !isPro;
              
              return (
                <button
                  key={key}
                  onClick={() => handleDifficultySelect(key)}
                  className={`w-full p-3 rounded-xl text-left transition-all border-2 ${
                    isSelected
                      ? 'border-[#FF4D00] bg-[#FF4D00]/5'
                      : isLocked
                      ? 'border-gray-200 bg-gray-100'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center ${isLocked ? 'opacity-60' : ''}`}>
                        <span className="text-white font-black text-sm">{preset.habits.length}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-sm ${isLocked ? 'text-gray-500' : ''}`}>{preset.name}</h3>
                          {requiresPro && <ProBadge />}
                        </div>
                        <p className="text-xs text-gray-500">{preset.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-[#FF4D00] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {isLocked && !isSelected && (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Habit list - compact */}
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {preset.habits.map((habit, i) => (
                        <span
                          key={i}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isSelected 
                              ? 'bg-[#FF4D00]/10 text-[#FF4D00]' 
                              : isLocked
                              ? 'bg-gray-200 text-gray-400'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {habit}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Note about custom habits */}
          <p className="text-center text-xs text-gray-400 mt-3">
            You can customize your habits later in settings
          </p>

          {/* Bottom buttons */}
          <div className="space-y-2 mt-4">
            <button
              onClick={() => setStep('goal')}
              disabled={!difficulty}
              className="w-full py-3.5 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
            >
              CONTINUE
            </button>

            <button
              onClick={() => setStep('password')}
              className="w-full py-2 text-gray-400 text-sm font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Goal Setting Screen
  if (step === 'goal') {
    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-black">Why are you doing this?</h1>
            <p className="text-gray-500 font-light">Your motivation will keep you going</p>
          </div>

          <div className="space-y-4">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="I want to build discipline because..."
              className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-black text-lg h-32 resize-none focus:outline-none focus:border-[#FF4D00] transition-colors"
              style={{ fontSize: '16px' }}
              autoFocus
            />

            <button
              onClick={() => setStep('ready')}
              disabled={!goal.trim()}
              className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
            >
              CONTINUE
            </button>

            <button
              onClick={() => setStep('difficulty')}
              className="w-full py-3 text-gray-400 text-sm font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ready Screen
  if (step === 'ready') {
    const selectedPreset = difficulty ? DIFFICULTY_PRESETS[difficulty] : null;

    return (
      <div className="min-h-screen bg-[#f4f3ee] text-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-black">You're All Set, {name}!</h1>
            <p className="text-base text-gray-500 font-light">
              "{goal}"
            </p>
          </div>

          {/* Rules Preview */}
          {selectedPreset && (
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Your Daily Habits</h3>
                <span className="text-sm font-medium text-[#FF4D00] bg-[#FF4D00]/10 px-2 py-1 rounded-full">
                  {selectedPreset.name}
                </span>
              </div>
              <div className="space-y-2 text-left">
                {selectedPreset.habits.map((habit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-[#FF4D00] rounded-full"></div>
                    {habit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Final CTA */}
          <div className="space-y-3">
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full py-4 bg-[#FF4D00] text-white text-lg font-black rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'CREATING ACCOUNT...' : 'START DAY 1'}
            </button>

            <button
              onClick={() => setStep('goal')}
              disabled={isLoading}
              className="w-full py-3 text-gray-400 text-sm font-medium disabled:opacity-50"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
