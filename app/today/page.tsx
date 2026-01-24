'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { saveWorkoutPhoto, getWorkoutPhoto, getAllWorkoutPhotos, saveData } from '@/lib/storage';
import { Achievement, ACHIEVEMENTS, getUserAchievements } from '@/lib/achievements';
import AchievementModal from '@/components/AchievementModal';
import ShareCard from '@/components/ShareCard';
import Confetti from '@/components/Confetti';
import { checkAndShowReminder } from '@/lib/notifications';

type View = 'today' | 'gallery' | 'calendar' | 'achievements';

export default function TodayPage() {
  const router = useRouter();
  const { data, toggleRule, completeDay, failDay } = useApp();
  const [showFailConfirm, setShowFailConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentView, setCurrentView] = useState<View>('today');
  const [workoutPhoto, setWorkoutPhoto] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; date: string } | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<Record<string, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebratedToday, setCelebratedToday] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  // Load avatar from localStorage
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  // Check for notification reminders
  useEffect(() => {
    checkAndShowReminder();
    
    // Check every minute
    const interval = setInterval(checkAndShowReminder, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'long',
        day: 'numeric' 
      }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check at midnight for automatic day transition
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime() - now.getTime();
      
      // Set timeout to reload at midnight
      const timeout = setTimeout(() => {
        // Force reload data which will trigger auto-advance logic
        window.location.reload();
      }, msUntilMidnight);
      
      return () => clearTimeout(timeout);
    };
    
    checkMidnight();
  }, []);

  useEffect(() => {
    const photo = getWorkoutPhoto(today);
    if (photo) setWorkoutPhoto(photo);
  }, [today]);

  const allRulesCompleted = data.todayRules.every((rule) => rule.completed);
  const completedRules = data.todayRules.filter((rule) => rule.completed).length;
  const totalRules = data.todayRules.length;
  const progressPercentage = totalRules > 0 ? (completedRules / totalRules) * 100 : 0;

  // Handle rule toggle with confetti celebration
  const handleToggleRule = (ruleId: number) => {
    const rule = data.todayRules.find(r => r.id === ruleId);
    const wasCompleted = rule?.completed || false;
    
    // Toggle the rule
    toggleRule(ruleId);
    
    // Check if this completes all rules (and we haven't celebrated yet today)
    if (!wasCompleted && !celebratedToday) {
      const willAllBeCompleted = data.todayRules.every(r => 
        r.id === ruleId ? true : r.completed
      );
      
      if (willAllBeCompleted) {
        setShowConfetti(true);
        setCelebratedToday(true);
        // Save celebration state for today
        localStorage.setItem('lastCelebration', today);
      }
    }
  };

  // Check if already celebrated today on mount
  useEffect(() => {
    const lastCelebration = localStorage.getItem('lastCelebration');
    if (lastCelebration === today) {
      setCelebratedToday(true);
    }
  }, [today]);

  const handleCompleteDay = () => {
    const achievements = completeDay();
    
    if (achievements.length > 0) {
      setNewAchievements(achievements);
      setCurrentAchievementIndex(0);
    }
  };

  const handleAchievementClose = () => {
    if (currentAchievementIndex < newAchievements.length - 1) {
      // Show next achievement
      setCurrentAchievementIndex(currentAchievementIndex + 1);
    } else {
      // All achievements shown, clear
      setNewAchievements([]);
      setCurrentAchievementIndex(0);
    }
  };

  const handleFail = () => {
    failDay();
    setShowFailConfirm(false);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const photoData = reader.result as string;
      console.log('Photo captured, saving to storage...');
      setWorkoutPhoto(photoData);
      saveWorkoutPhoto(today, photoData);
      
      // Update gallery photos state immediately
      setGalleryPhotos(prev => ({ ...prev, [today]: photoData }));
      
      // Clear the input so the same file can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      console.log('Photo saved for date:', today);
    };
    reader.readAsDataURL(file);
  };

  const renderTodayView = () => (
    <>
      {/* Top Menu Bar */}
      <div className="top-menu flex items-center justify-between w-full">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-8 w-auto"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowShareCard(true)}
            className="w-10 h-10 theme-bg rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          <div className="day-badge-small">
            DAY {data.currentDay}/66
          </div>
        </div>
      </div>

      {/* Content with padding */}
      <div className="px-3 flex flex-col gap-2">
        <div className="header-card flex-shrink-0">
          <div className="flex items-stretch justify-between mb-3">
            <div className="flex-1">
              <div className="text-base font-light tracking-tight mb-1">{currentDate}</div>
              <div className="text-5xl font-thin tracking-tighter leading-none">{currentTime}</div>
            </div>
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <div className="text-sm font-light opacity-60 mb-1">BEST</div>
                <div className="text-4xl font-thin leading-none">{data.bestStreak}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-light opacity-60 mb-1">FAILS</div>
                <div className="text-4xl font-thin leading-none">{data.failureCount}</div>
              </div>
            </div>
          </div>

          <div className="relative w-full h-8 bg-[#f4f3ee] rounded-full overflow-hidden shadow-md">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] via-[#FF4D00] to-[#E34400] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black tracking-widest text-black z-10">{completedRules}/{totalRules}</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 space-y-0 mt-2">
          {data.todayRules.map((rule) => (
            <div
              key={rule.id}
              className="rule-item"
            >
              <div 
                onClick={() => handleToggleRule(rule.id)}
                className={`rule-checkbox cursor-pointer ${rule.completed ? 'completed' : ''}`}
              >
                {rule.completed && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span 
                onClick={() => handleToggleRule(rule.id)}
                className={`rule-text ${rule.completed ? 'completed' : ''}`}
              >
                {rule.text}
              </span>
              {rule.id === 1 && (
                <button
                  onClick={handleCameraClick}
                  className="p-2 hover:opacity-70 transition-opacity theme-text-secondary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoCapture}
        className="hidden"
      />
    </>
  );

  // Reload gallery photos when switching to gallery view
  useEffect(() => {
    if (currentView === 'gallery') {
      const photos = getAllWorkoutPhotos();
      setGalleryPhotos(photos);
      console.log('Gallery loaded, photos:', Object.keys(photos).length);
    }
  }, [currentView]);

  const renderGalleryView = () => {
    const photoEntries = Object.entries(galleryPhotos).sort((a, b) => b[0].localeCompare(a[0]));

    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">Progress Gallery</h2>
          <p className="text-sm theme-text-secondary mb-4">{photoEntries.length} photos captured</p>
          
          {/* Photo tip */}
          <div className="theme-bg-secondary rounded-xl p-3 mb-4 border theme-border">
            <p className="text-xs theme-text-secondary text-center">
              For best results, take photos in the same spot with consistent lighting each day
            </p>
          </div>
          
          {photoEntries.length === 0 ? (
            <div className="text-center theme-text-secondary mt-10">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No progress photos yet</p>
              <p className="text-sm mt-2">Complete workouts to capture your journey</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photoEntries.map(([date, photo]) => (
                <div 
                  key={date} 
                  onClick={() => setSelectedPhoto({ url: photo, date })}
                  className="relative aspect-square theme-bg-secondary rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img src={photo} alt={`Workout ${date}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5">
                    <p className="text-[10px] text-white text-center">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - data.currentDay + 1);

    const days = [];
    for (let i = 0; i < 66; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = data.history.find(h => h.date === dateStr);
      days.push({
        date: dateStr,
        dayNumber: i + 1,
        completed: entry?.completed || false,
        failed: entry?.failed || false,
        isFuture: i >= data.currentDay
      });
    }

    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">66 Day Calendar</h2>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div
                key={day.date}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 ${
                  day.isFuture 
                    ? 'bg-gray-800 border-[#FF4D00]/30 opacity-50' 
                    : day.completed 
                    ? 'bg-green-600 border-green-400' 
                    : day.failed
                    ? 'bg-red-600 border-red-400'
                    : 'bg-gray-800 border-gray-600'
                }`}
              >
                <span className="text-xs font-bold">{day.dayNumber}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Badge icon renderer
  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-5 h-5 ${isUnlocked ? 'text-white' : 'theme-text-secondary'}`;
    
    switch (iconName) {
      case 'spark':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
          </svg>
        );
      case 'shield':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        );
      case 'bolt':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66l5.38-9.84c.1-.18.34-.5.84-.5h1l-1 7h3.5c.49 0 .56.33.38.66l-5.38 9.84c-.1.18-.34.5-.84.5z"/>
          </svg>
        );
      case 'target':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        );
      case 'medal':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L9 6.5l-5 1 3.5 3.5L7 16l5-2.5L17 16l-.5-5 3.5-3.5-5-1L12 2zM12 18.5l-4 2.5.8-4.5L5 13l4.5-.5L12 8l2.5 4.5 4.5.5-3.8 3.5.8 4.5-4-2.5z"/>
          </svg>
        );
      case 'star':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'flame':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.17-4.83 3-6.36V4a1 1 0 011.97-.24L9 7c.83-.64 1.87-1 3-1s2.17.36 3 1l1.03-3.24A1 1 0 0118 4v4.64c1.83 1.53 3 3.84 3 6.36 0 4.42-4.03 8-9 8zm0-14c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2s2-.9 2-2v-3c0-1.1-.9-2-2-2z"/>
          </svg>
        );
      case 'crown':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z"/>
          </svg>
        );
      default:
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
    }
  };

  const renderAchievementsView = () => {
    const userAchievements = getUserAchievements();
    const unlockedIds = userAchievements.map(a => a.id);

    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Badges</h2>
            <span className="text-xs theme-text-secondary">
              {unlockedIds.length}/{ACHIEVEMENTS.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs theme-text-secondary">Day {data.currentDay}/66</span>
              <span className="text-xs text-[#FF4D00]">{Math.round((data.currentDay / 66) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 theme-bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF4D00] transition-all duration-300"
                style={{ width: `${(data.currentDay / 66) * 100}%` }}
              />
            </div>
          </div>

          {/* Badges List */}
          <div className="divide-y theme-border">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlockedIds.includes(achievement.id);
              const userAchievement = userAchievements.find(a => a.id === achievement.id);
              const progress = Math.min(100, (data.currentDay / achievement.requirement) * 100);

              return (
                <div
                  key={achievement.id}
                  className={`py-3 flex items-center gap-3 ${!isUnlocked ? 'opacity-40' : ''}`}
                >
                  {/* Badge Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isUnlocked ? 'bg-[#FF4D00]' : 'theme-bg-secondary'
                  }`}>
                    {renderBadgeIcon(achievement.icon, isUnlocked)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{achievement.name}</span>
                      {isUnlocked && (
                        <svg className="w-3.5 h-3.5 text-[#FF4D00]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs theme-text-secondary">{achievement.description}</span>
                    {!isUnlocked && (
                      <div className="w-full h-1 theme-bg-secondary rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-[#FF4D00]/50 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <span className="text-xs theme-text-secondary flex-shrink-0">
                    {isUnlocked ? `Day ${userAchievement?.dayUnlocked}` : `${data.currentDay}/${achievement.requirement}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col theme-bg theme-text overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto pb-20">
        {currentView === 'today' && renderTodayView()}
        {currentView === 'gallery' && renderGalleryView()}
        {currentView === 'calendar' && renderCalendarView()}
        {currentView === 'achievements' && renderAchievementsView()}
      </div>

      <div className="bottom-nav">
        <button 
          onClick={() => setCurrentView('today')}
          className={`nav-item ${currentView === 'today' ? 'text-[#FF4D00]' : 'theme-text-secondary'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </button>

        <button 
          onClick={() => setCurrentView('gallery')}
          className={`nav-item ${currentView === 'gallery' ? 'text-[#FF4D00]' : 'theme-text-secondary'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium">Gallery</span>
        </button>

        <button 
          onClick={() => router.push('/friends')}
          className="nav-item theme-text-secondary"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs font-medium">Friends</span>
        </button>

        <button 
          onClick={() => setCurrentView('achievements')}
          className={`nav-item ${currentView === 'achievements' ? 'text-[#FF4D00]' : 'theme-text-secondary'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="text-xs font-medium">Badges</span>
        </button>

        <button 
          onClick={() => router.push('/profile')}
          className="nav-item theme-text-secondary"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] rounded-full flex items-center justify-center text-black font-bold text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>

      {showFailConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full space-y-4 border-2 border-[#FF4D00]/30">
            <h2 className="text-2xl font-bold">Reset to Day 1?</h2>
            <p className="text-base text-gray-300 font-light">
              This will reset your current streak. Your failure will be recorded in your progress history.
            </p>
            <div className="space-y-2">
              <button 
                onClick={handleFail} 
                className="w-full py-4 px-6 bg-red-600 text-white text-lg font-bold rounded-xl active:scale-95 transition-transform"
              >
                Yes, I failed
              </button>
              <button
                onClick={() => setShowFailConfirm(false)}
                className="w-full py-4 px-6 bg-gray-700 text-white text-lg font-bold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-2xl w-full">
            <div className="relative">
              <img 
                src={selectedPhoto.url} 
                alt="Workout" 
                className="w-full h-auto rounded-lg"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-center text-white mt-4 font-light">
              {new Date(selectedPhoto.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      )}

      {/* Fail Confirmation Modal - Manual fail option */}
      {showFailConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full space-y-4 border-2 border-[#FF4D00]/30">
            <h2 className="text-2xl font-bold">Reset to Day 1?</h2>
            <p className="text-base text-gray-300 font-light">
              This will reset your current streak. Your failure will be recorded in your progress history.
            </p>
            <div className="space-y-2">
              <button 
                onClick={handleFail} 
                className="w-full py-4 px-6 bg-red-600 text-white text-lg font-bold rounded-xl active:scale-95 transition-transform"
              >
                Yes, I failed
              </button>
              <button
                onClick={() => setShowFailConfirm(false)}
                className="w-full py-4 px-6 bg-gray-700 text-white text-lg font-bold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Modal */}
      {newAchievements.length > 0 && (
        <AchievementModal
          achievement={newAchievements[currentAchievementIndex]}
          onClose={handleAchievementClose}
        />
      )}

      {/* Share Card Modal */}
      {showShareCard && (
        <ShareCard onClose={() => setShowShareCard(false)} />
      )}

      {/* Confetti Celebration */}
      <Confetti 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
    </div>
  );
}