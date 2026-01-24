import { AppData, getUserHabits } from '@/types';

const STORAGE_KEY = '66-challenge-data';

export const getInitialData = (): AppData => {
  const userHabits = getUserHabits();
  return {
    bedtime: '22:00',
    currentDay: 1,
    bestStreak: 0,
    failureCount: 0,
    todayRules: userHabits.map((rule) => ({ ...rule, completed: false })),
    todayNotes: '',
    history: [],
    lastUpdated: new Date().toISOString().split('T')[0],
    onboarded: false,
  };
};

export const loadData = (): AppData => {
  if (typeof window === 'undefined') return getInitialData();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getInitialData();
    
    const data: AppData = JSON.parse(stored);
    const userHabits = getUserHabits();
    
    // Check if it's a new day
    const today = new Date().toISOString().split('T')[0];
    if (data.lastUpdated !== today && data.lastUpdated < today) {
      // It's a new day - check if ALL habits were completed yesterday
      const allCompleted = data.todayRules.length > 0 && 
                          data.todayRules.every(rule => rule.completed);
      
      if (allCompleted) {
        // Auto-advance to next day
        const newCurrentDay = data.currentDay + 1;
        const newBestStreak = Math.max(newCurrentDay, data.bestStreak);
        
        data.history = [
          ...data.history,
          { 
            date: data.lastUpdated, 
            completed: true, 
            failed: false, 
            notes: data.todayNotes,
            workoutPhoto: getWorkoutPhoto(data.lastUpdated)
          },
        ];
        data.currentDay = newCurrentDay;
        data.bestStreak = newBestStreak;
        
        console.log(`Day completed! Advancing to Day ${newCurrentDay}`);
      } else {
        // Not all habits completed - fail and reset to day 1
        if (data.currentDay > 1) {
          data.history = [
            ...data.history,
            { 
              date: data.lastUpdated, 
              completed: false, 
              failed: true, 
              notes: data.todayNotes,
              workoutPhoto: getWorkoutPhoto(data.lastUpdated)
            },
          ];
          data.failureCount = data.failureCount + 1;
          data.currentDay = 1;
          
          console.log('Day failed - habits incomplete. Resetting to Day 1');
        }
      }
      
      // Reset habits for the new day
      data.todayRules = userHabits.map((rule) => ({ ...rule, completed: false }));
      data.todayNotes = '';
      data.lastUpdated = today;
    }
    
    return data;
  } catch {
    return getInitialData();
  }
};

export const saveData = (data: AppData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

export const completeDay = (data: AppData): AppData => {
  const today = new Date().toISOString().split('T')[0];
  const userHabits = getUserHabits();
  
  const newCurrentDay = data.currentDay + 1;
  const newBestStreak = Math.max(newCurrentDay, data.bestStreak);
  
  const newHistory = [
    ...data.history,
    { 
      date: today, 
      completed: true, 
      failed: false, 
      notes: data.todayNotes,
      workoutPhoto: getWorkoutPhoto(today)
    },
  ];
  
  return {
    ...data,
    currentDay: newCurrentDay,
    bestStreak: newBestStreak,
    todayRules: userHabits.map((rule) => ({ ...rule, completed: false })),
    todayNotes: '',
    history: newHistory,
    lastUpdated: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  };
};

export const failDay = (data: AppData): AppData => {
  const today = new Date().toISOString().split('T')[0];
  const userHabits = getUserHabits();
  
  const newHistory = [
    ...data.history,
    { 
      date: today, 
      completed: false, 
      failed: true, 
      notes: data.todayNotes,
      workoutPhoto: getWorkoutPhoto(today)
    },
  ];
  
  return {
    ...data,
    currentDay: 1,
    failureCount: data.failureCount + 1,
    todayRules: userHabits.map((rule) => ({ ...rule, completed: false })),
    todayNotes: '',
    history: newHistory,
    lastUpdated: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  };
};

export const toggleRule = (data: AppData, ruleId: number): AppData => {
  return {
    ...data,
    todayRules: data.todayRules.map((rule) =>
      rule.id === ruleId ? { ...rule, completed: !rule.completed } : rule
    ),
  };
};

export const updateNotes = (data: AppData, notes: string): AppData => {
  return {
    ...data,
    todayNotes: notes,
  };
};

export const updateBedtime = (data: AppData, bedtime: string): AppData => {
  return {
    ...data,
    bedtime,
  };
};

export const resetAllData = (): AppData => {
  const initial = getInitialData();
  return {
    ...initial,
    onboarded: true,
  };
};

export const completeOnboarding = (data: AppData, bedtime: string): AppData => {
  return {
    ...data,
    bedtime,
    onboarded: true,
  };
};

export const reloadHabits = (data: AppData): AppData => {
  const userHabits = getUserHabits();
  
  // Create new rules based on user habits, preserving completion status where possible
  const newRules = userHabits.map((habit) => {
    // Check if this habit existed before and preserve its completion status
    const existingRule = data.todayRules.find(r => r.text === habit.text);
    return {
      ...habit,
      completed: existingRule?.completed || false,
    };
  });
  
  return {
    ...data,
    todayRules: newRules,
  };
};

// Photo storage helpers
const PHOTO_STORAGE_KEY = '66-challenge-photos';

export const saveWorkoutPhoto = (date: string, photoData: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const photos = JSON.parse(localStorage.getItem(PHOTO_STORAGE_KEY) || '{}');
    photos[date] = photoData;
    localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(photos));
  } catch (error) {
    console.error('Failed to save photo:', error);
  }
};

export const getWorkoutPhoto = (date: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const photos = JSON.parse(localStorage.getItem(PHOTO_STORAGE_KEY) || '{}');
    return photos[date];
  } catch {
    return undefined;
  }
};

export const getAllWorkoutPhotos = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  try {
    return JSON.parse(localStorage.getItem(PHOTO_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};
