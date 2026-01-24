'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { getUserProfile, getUserStats } from '@/lib/database';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { DIFFICULTY_PRESETS, DifficultyLevel, getUserHabits, saveUserHabits } from '@/types';
import { ProBadge } from '@/components/ProBadge';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission,
  scheduleDailyReminder,
  disableNotifications,
  areNotificationsEnabled,
  getReminderTime
} from '@/lib/notifications';

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { reloadHabits } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [reminderHour, setReminderHour] = useState(20);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Challenge settings
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('medium');
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [customHabits, setCustomHabits] = useState<string[]>([]);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [profileData, statsData] = await Promise.all([
        getUserProfile(),
        getUserStats()
      ]);
      setProfile(profileData);
      setStats(statsData);
      
      // Load avatar from localStorage
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
      
      // Load current difficulty
      const savedDifficulty = localStorage.getItem('userDifficulty') as DifficultyLevel;
      if (savedDifficulty && DIFFICULTY_PRESETS[savedDifficulty]) {
        setCurrentDifficulty(savedDifficulty);
      }
      
      // Load custom habits
      const habits = getUserHabits();
      setCustomHabits(habits.map(h => h.text));
      
      // Check notification status
      if (typeof window !== 'undefined') {
        setNotificationsEnabled(areNotificationsEnabled());
        setNotificationPermission(getNotificationPermission());
        const time = getReminderTime();
        if (time) setReminderHour(time.hour);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const photoData = reader.result as string;
      setAvatarUrl(photoData);
      localStorage.setItem('userAvatar', photoData);
    };
    reader.readAsDataURL(file);
  };

  const handleChangeDifficulty = (diff: DifficultyLevel) => {
    setCurrentDifficulty(diff);
    localStorage.setItem('userDifficulty', diff);
    saveUserHabits(DIFFICULTY_PRESETS[diff].habits);
    setCustomHabits(DIFFICULTY_PRESETS[diff].habits);
    reloadHabits(); // Update the app state
    setShowDifficultyModal(false);
  };

  const handleAddHabit = () => {
    if (newHabit.trim() && customHabits.length < 10) {
      const updated = [...customHabits, newHabit.trim()];
      setCustomHabits(updated);
      saveUserHabits(updated);
      reloadHabits(); // Update the app state
      setNewHabit('');
    }
  };

  const handleRemoveHabit = (index: number) => {
    if (customHabits.length > 1) {
      const updated = customHabits.filter((_, i) => i !== index);
      setCustomHabits(updated);
      saveUserHabits(updated);
      reloadHabits(); // Update the app state
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      scheduleDailyReminder(reminderHour, 0);
      setNotificationsEnabled(true);
      setNotificationPermission('granted');
    } else {
      setNotificationPermission(getNotificationPermission());
    }
  };

  const handleDisableNotifications = () => {
    disableNotifications();
    setNotificationsEnabled(false);
  };

  const handleTimeChange = (hour: number) => {
    setReminderHour(hour);
    if (notificationsEnabled) {
      scheduleDailyReminder(hour, 0);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.clear();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen theme-bg flex items-center justify-center">
        <div className="theme-text text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen theme-bg theme-text flex flex-col">
      {/* Header */}
      <div className="p-4 border-b theme-border">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/today')}
            className="theme-text-secondary hover:opacity-80"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-black">Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {/* User Info Card */}
        <div className="theme-bg-secondary rounded-2xl p-6 border theme-border">
          <div className="flex items-center gap-4 mb-4">
            <div 
              onClick={handleAvatarClick}
              className="relative w-16 h-16 rounded-full cursor-pointer group"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] rounded-full flex items-center justify-center text-3xl font-black text-black">
                  {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div>
              <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
              <p className="theme-text-secondary text-sm">{profile?.email || ''}</p>
              <p className="text-[#FF4D00] text-xs mt-1">Tap avatar to change</p>
            </div>
          </div>
          
          {profile?.goal && (
            <div className="theme-bg rounded-xl p-4">
              <p className="text-xs theme-text-secondary mb-1">MY GOAL</p>
              <p className="theme-text-secondary">{profile.goal}</p>
            </div>
          )}
        </div>

        {/* Challenge Settings Card */}
        <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden">
          <h3 className="text-lg font-bold p-4 border-b theme-border">Challenge Settings</h3>
          
          {/* Current Difficulty */}
          <button
            onClick={() => setShowDifficultyModal(true)}
            className="w-full p-4 text-left flex items-center justify-between border-b theme-border"
          >
            <div>
              <p className="font-medium">Difficulty Level</p>
              <p className="text-sm text-[#FF4D00]">{DIFFICULTY_PRESETS[currentDifficulty].name} - {DIFFICULTY_PRESETS[currentDifficulty].habits.length} habits</p>
            </div>
            <svg className="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Custom Habits */}
          <button
            onClick={() => setShowHabitsModal(true)}
            className="w-full p-4 text-left flex items-center justify-between"
          >
            <div>
              <p className="font-medium">My Habits</p>
              <p className="text-sm theme-text-secondary">{customHabits.length} habits configured</p>
            </div>
            <svg className="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Stats Card */}
        <div className="theme-bg-secondary rounded-2xl p-6 border theme-border">
          <h3 className="text-lg font-bold mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="theme-bg rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-[#FF4D00]">{stats?.current_day || 1}</div>
              <div className="text-xs theme-text-secondary">Current Day</div>
            </div>
            <div className="theme-bg rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-green-500">{stats?.best_streak || 0}</div>
              <div className="text-xs theme-text-secondary">Best Streak</div>
            </div>
            <div className="theme-bg rounded-xl p-4 text-center">
              <div className="text-3xl font-black">{stats?.total_completions || 0}</div>
              <div className="text-xs theme-text-secondary">Days Completed</div>
            </div>
            <div className="theme-bg rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-red-500">{stats?.total_failures || 0}</div>
              <div className="text-xs theme-text-secondary">Total Fails</div>
            </div>
          </div>
        </div>

        {/* Theme Card */}
        <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden">
          <h3 className="text-lg font-bold p-4 border-b theme-border">Appearance</h3>
          <div className="p-4">
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-[#FF4D00] text-black'
                    : 'theme-bg-tertiary theme-text'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === 'light'
                    ? 'bg-[#FF4D00] text-black'
                    : 'theme-bg-tertiary theme-text'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden">
          <h3 className="text-lg font-bold p-4 border-b theme-border">Daily Reminder</h3>
          
          {!isNotificationSupported() ? (
            <div className="p-4 theme-text-secondary text-sm">
              Notifications are not supported on this device.
            </div>
          ) : notificationPermission === 'denied' ? (
            <div className="p-4 theme-text-secondary text-sm">
              Notifications are blocked. Please enable them in your browser settings.
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Reminders</p>
                  <p className="text-sm theme-text-secondary">Get a daily nudge to complete your rules</p>
                </div>
                <button
                  onClick={notificationsEnabled ? handleDisableNotifications : handleEnableNotifications}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    notificationsEnabled ? 'bg-[#FF4D00]' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform mx-1 ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              
              {notificationsEnabled && (
                <div className="pt-2 border-t theme-border">
                  <p className="text-sm theme-text-secondary mb-2">Reminder Time</p>
                  <div className="flex gap-2 flex-wrap">
                    {[18, 19, 20, 21, 22].map((hour) => (
                      <button
                        key={hour}
                        onClick={() => handleTimeChange(hour)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          reminderHour === hour
                            ? 'bg-[#FF4D00] text-black'
                            : 'theme-bg-tertiary theme-text'
                        }`}
                      >
                        {hour}:00
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subscription Card */}
        <SubscriptionCard />

        {/* Legal */}
        <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden">
          <h3 className="text-lg font-bold p-4 border-b theme-border">Legal</h3>
          
          <button
            onClick={() => router.push('/privacy')}
            className="w-full p-4 text-left theme-text hover:bg-black/5 transition-colors flex items-center justify-between border-b theme-border"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Privacy Policy
            </div>
            <svg className="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => router.push('/terms')}
            className="w-full p-4 text-left theme-text hover:bg-black/5 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Terms of Service
            </div>
            <svg className="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Account Actions */}
        <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden">
          <h3 className="text-lg font-bold p-4 border-b theme-border">Account</h3>
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full p-4 text-left text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        {/* App Info */}
        <div className="text-center theme-text-secondary text-sm py-4">
          <p>66 Challenge</p>
          <p>Version 1.0.0</p>
        </div>
      </div>

      {/* Difficulty Modal */}
      {showDifficultyModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="theme-bg-secondary rounded-2xl p-5 max-w-sm w-full border theme-border">
            <h2 className="text-xl font-bold mb-4">Change Difficulty</h2>
            <p className="text-sm theme-text-secondary mb-4">Warning: This will replace your current habits</p>
            
            <div className="space-y-2">
              {(Object.keys(DIFFICULTY_PRESETS) as DifficultyLevel[]).map((key) => {
                const preset = DIFFICULTY_PRESETS[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleChangeDifficulty(key)}
                    className={`w-full p-3 rounded-xl text-left border-2 ${
                      currentDifficulty === key
                        ? 'border-[#FF4D00] bg-[#FF4D00]/10'
                        : 'border-transparent theme-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{preset.name}</p>
                        <p className="text-xs theme-text-secondary">{preset.habits.length} habits</p>
                      </div>
                      {currentDifficulty === key && (
                        <div className="w-5 h-5 bg-[#FF4D00] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setShowDifficultyModal(false)}
              className="w-full mt-4 py-3 theme-bg theme-text font-bold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Habits Modal */}
      {showHabitsModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="theme-bg-secondary rounded-2xl p-5 max-w-sm w-full border theme-border max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">My Habits</h2>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {customHabits.map((habit, index) => (
                <div key={index} className="flex items-center gap-2 theme-bg p-3 rounded-xl">
                  <span className="flex-1 text-sm">{habit}</span>
                  {customHabits.length > 1 && (
                    <button
                      onClick={() => handleRemoveHabit(index)}
                      className="text-red-500 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {customHabits.length < 10 && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="Add custom habit..."
                  className="flex-1 p-3 theme-bg rounded-xl text-sm focus:outline-none"
                  style={{ fontSize: '16px' }}
                />
                <button
                  onClick={handleAddHabit}
                  disabled={!newHabit.trim()}
                  className="px-4 bg-[#FF4D00] text-white font-bold rounded-xl disabled:opacity-30"
                >
                  Add
                </button>
              </div>
            )}
            
            <button
              onClick={() => setShowHabitsModal(false)}
              className="w-full py-3 bg-[#FF4D00] text-white font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <div className="theme-bg-secondary rounded-2xl p-6 max-w-sm w-full space-y-4 border theme-border">
            <h2 className="text-xl font-bold">Sign Out?</h2>
            <p className="theme-text-secondary">Are you sure you want to sign out? Your progress is saved in the cloud.</p>
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl active:scale-95 transition-transform"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 theme-bg-tertiary theme-text font-bold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subscription Card Component
function SubscriptionCard() {
  const { isPro, subscription, openPaywall } = useSubscription();

  if (isPro) {
    return (
      <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold text-lg">Pro Member</span>
              </div>
              <p className="text-white/80 text-sm">
                {subscription.period === 'lifetime' 
                  ? 'Lifetime access'
                  : subscription.isTrialActive
                  ? `Trial ends ${new Date(subscription.trialEndsAt!).toLocaleDateString()}`
                  : `Renews ${new Date(subscription.expiresAt!).toLocaleDateString()}`
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm theme-text-secondary">
            You have access to all features including unlimited habits, full activity feed, and advanced stats.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden">
      <div className="p-4 border-b theme-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">Upgrade to Pro</span>
              <ProBadge />
            </div>
            <p className="text-sm theme-text-secondary">Unlock all features</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF4D00] rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-[#FF4D00]">✓</span>
            <span>Unlimited habits (currently limited to 3)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#FF4D00]">✓</span>
            <span>Friends, Squads & social features</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#FF4D00]">✓</span>
            <span>Progress photo gallery</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#FF4D00]">✓</span>
            <span>Advanced stats & all badges</span>
          </li>
        </ul>
        
        <button
          onClick={() => openPaywall()}
          className="w-full py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white font-bold rounded-xl active:scale-95 transition-transform"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
