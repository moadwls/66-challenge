'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData } from '@/types';
import * as storage from '@/lib/storage';
import { checkNewAchievements, unlockAchievement, Achievement } from '@/lib/achievements';
import { updateUserStats, saveAchievement, createActivity } from '@/lib/database';

interface AppContextType {
  data: AppData;
  toggleRule: (ruleId: number) => void;
  completeDay: () => Achievement[];
  failDay: () => void;
  updateNotes: (notes: string) => void;
  updateBedtime: (bedtime: string) => void;
  resetAllData: () => void;
  completeOnboarding: (bedtime: string) => void;
  saveNote: () => void;
  reloadHabits: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(storage.getInitialData());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setData(storage.loadData());
  }, []);

  useEffect(() => {
    if (mounted) {
      storage.saveData(data);
    }
  }, [data, mounted]);

  const toggleRule = (ruleId: number) => {
    setData((prev) => storage.toggleRule(prev, ruleId));
  };

  const completeDay = (): Achievement[] => {
    const previousDay = data.currentDay;
    let newAchievements: Achievement[] = [];
    
    setData((prev) => {
      const updated = storage.completeDay(prev);
      const currentDay = updated.currentDay;
      
      // Check for new achievements
      newAchievements = checkNewAchievements(previousDay, currentDay);
      
      // Unlock them locally
      newAchievements.forEach(achievement => {
        unlockAchievement(achievement.id, currentDay);
        // Also save to database
        saveAchievement(achievement.id, currentDay);
        // Create activity for achievement
        createActivity('achievement', currentDay, undefined, achievement.id);
      });

      // Sync to Supabase
      updateUserStats(
        currentDay,
        currentDay, // current streak equals current day
        updated.bestStreak,
        updated.history.filter(h => h.completed).length,
        updated.failureCount
      );

      // Create activity for day completion
      createActivity('day_complete', currentDay);

      // Create milestone activity for streaks
      if (currentDay === 7 || currentDay === 14 || currentDay === 21 || currentDay === 30 || currentDay === 66) {
        createActivity('streak_milestone', currentDay, currentDay);
      }
      
      return updated;
    });
    
    return newAchievements;
  };

  const failDay = () => {
    setData((prev) => {
      const failedDay = prev.currentDay; // Store the day they failed on
      const updated = storage.failDay(prev);
      
      // Sync to Supabase
      updateUserStats(
        updated.currentDay,
        updated.currentDay, // current streak equals current day (reset to 1 on fail)
        updated.bestStreak,
        updated.history.filter(h => h.completed).length,
        updated.failureCount
      );

      // Create activity for the fail - so friends can see and mock!
      createActivity('day_fail', failedDay);
      
      return updated;
    });
  };

  const updateNotes = (notes: string) => {
    setData((prev) => storage.updateNotes(prev, notes));
  };

  const updateBedtime = (bedtime: string) => {
    setData((prev) => storage.updateBedtime(prev, bedtime));
  };

  const resetAllData = () => {
    setData(storage.resetAllData());
  };

  const completeOnboarding = (bedtime: string) => {
    setData((prev) => storage.completeOnboarding(prev, bedtime));
  };

  const saveNote = () => {
    setData((prev) => {
      if (!prev.todayNotes.trim()) return prev;
      
      const timestamp = new Date().toISOString();
      const noteEntry = {
        date: timestamp,
        completed: false,
        failed: false,
        notes: prev.todayNotes,
        saved: true,
      };
      
      return {
        ...prev,
        history: [...prev.history, noteEntry],
        todayNotes: '', // Clear after saving
      };
    });
  };

  const reloadHabits = () => {
    setData((prev) => storage.reloadHabits(prev));
  };

  if (!mounted) {
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        data,
        toggleRule,
        completeDay,
        failDay,
        updateNotes,
        updateBedtime,
        resetAllData,
        completeOnboarding,
        saveNote,
        reloadHabits,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
