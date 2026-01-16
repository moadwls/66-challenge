'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData } from '@/types';
import * as storage from '@/lib/storage';

interface AppContextType {
  data: AppData;
  toggleRule: (ruleId: number) => void;
  completeDay: () => void;
  failDay: () => void;
  updateNotes: (notes: string) => void;
  updateBedtime: (bedtime: string) => void;
  resetAllData: () => void;
  completeOnboarding: (bedtime: string) => void;
  saveNote: () => void;
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

  const completeDay = () => {
    setData((prev) => storage.completeDay(prev));
  };

  const failDay = () => {
    setData((prev) => storage.failDay(prev));
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
