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

export const DEFAULT_RULES: Omit<Rule, 'completed'>[] = [
  { id: 1, text: '45 Min Workout' },
  { id: 2, text: 'Read 10 Pages (non-fiction)' },
  { id: 3, text: 'Post 1 Piece of Content' },
  { id: 4, text: 'Eat Healthy Meals Only' },
  { id: 5, text: '10 Min Sauna' },
  { id: 6, text: 'Sleep 8 Hours' },
];
