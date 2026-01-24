export interface Rule {
  id: number;
  text: string;
  completed: boolean;
}

export interface DayEntry {
  date: string;
  completed: boolean;
  failed: boolean;
  notes?: string;
  workoutPhoto?: string;
  saved?: boolean;
}

export interface AppData {
  bedtime: string;
  currentDay: number;
  bestStreak: number;
  failureCount: number;
  todayRules: Rule[];
  todayNotes: string;
  history: DayEntry[];
  lastUpdated: string;
  onboarded: boolean;
}

// Difficulty-based habit presets
export const DIFFICULTY_PRESETS = {
  medium: {
    name: 'Medium',
    description: '3 habits to build consistency',
    habits: [
      '45 Min Workout',
      'Read 10 Pages',
      'No Sugar',
    ]
  },
  hard: {
    name: 'Hard',
    description: '6 habits for serious commitment',
    habits: [
      'Make Your Bed',
      '45 Min Workout',
      'Read 10 Pages',
      'No Sugar',
      'Post Content',
      '10K Steps',
    ]
  },
  extreme: {
    name: 'Extreme',
    description: '8 habits for maximum discipline',
    habits: [
      'Wake Up at 6am',
      'Make Your Bed',
      '45 Min Workout',
      'Read 10 Pages',
      'No Sugar',
      'Post Content',
      '10K Steps',
      'Drink 2L Water',
    ]
  }
};

export type DifficultyLevel = keyof typeof DIFFICULTY_PRESETS;

export const DEFAULT_RULES: Omit<Rule, 'completed'>[] = [
  { id: 1, text: '45 Min Workout' },
  { id: 2, text: 'Read 10 Pages' },
  { id: 3, text: 'No Sugar' },
];

// Get user's custom habits or default
export const getUserHabits = (): Omit<Rule, 'completed'>[] => {
  if (typeof window === 'undefined') return DEFAULT_RULES;
  
  try {
    const stored = localStorage.getItem('userHabits');
    if (stored) {
      const habits = JSON.parse(stored) as string[];
      return habits.map((text, index) => ({ id: index + 1, text }));
    }
  } catch {}
  
  return DEFAULT_RULES;
};

// Save user's custom habits
export const saveUserHabits = (habits: string[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userHabits', JSON.stringify(habits));
};
