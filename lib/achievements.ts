export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string; // SVG path or symbol
  requirement: number; // Days needed
  color: string; // Gradient color
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_day',
    name: 'First Step',
    description: 'Complete your first day',
    icon: 'spark',
    requirement: 1,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete 7 consecutive days',
    icon: 'shield',
    requirement: 7,
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'two_weeks',
    name: 'Two Week Streak',
    description: 'Complete 14 consecutive days',
    icon: 'bolt',
    requirement: 14,
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'habit_former',
    name: '21 Day Habit',
    description: 'Complete 21 consecutive days',
    icon: 'target',
    requirement: 21,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Complete 30 consecutive days',
    icon: 'medal',
    requirement: 30,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'halfway_hero',
    name: 'Halfway Hero',
    description: 'Complete 33 consecutive days',
    icon: 'star',
    requirement: 33,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'fifty_streak',
    name: '50 Day Streak',
    description: 'Complete 50 consecutive days',
    icon: 'flame',
    requirement: 50,
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'diamond_discipline',
    name: 'Diamond Discipline',
    description: 'Complete all 66 days',
    icon: 'crown',
    requirement: 66,
    color: 'from-yellow-400 via-yellow-500 to-yellow-600'
  }
];

export type UserAchievement = {
  id: string;
  unlockedAt: string; // ISO date
  dayUnlocked: number;
};

export const getUnlockedAchievements = (currentDay: number): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => currentDay >= achievement.requirement);
};

export const getLockedAchievements = (currentDay: number): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => currentDay < achievement.requirement);
};

export const getNextAchievement = (currentDay: number): Achievement | null => {
  const locked = getLockedAchievements(currentDay);
  return locked.length > 0 ? locked[0] : null;
};

export const checkNewAchievements = (previousDay: number, currentDay: number): Achievement[] => {
  const newAchievements: Achievement[] = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    if (previousDay < achievement.requirement && currentDay >= achievement.requirement) {
      newAchievements.push(achievement);
    }
  });
  
  return newAchievements;
};

export const saveUserAchievements = (achievements: UserAchievement[]) => {
  localStorage.setItem('userAchievements', JSON.stringify(achievements));
};

export const getUserAchievements = (): UserAchievement[] => {
  const saved = localStorage.getItem('userAchievements');
  return saved ? JSON.parse(saved) : [];
};

export const unlockAchievement = (achievementId: string, currentDay: number) => {
  const userAchievements = getUserAchievements();
  
  // Check if already unlocked
  if (userAchievements.some(a => a.id === achievementId)) {
    return;
  }
  
  const newAchievement: UserAchievement = {
    id: achievementId,
    unlockedAt: new Date().toISOString(),
    dayUnlocked: currentDay
  };
  
  userAchievements.push(newAchievement);
  saveUserAchievements(userAchievements);
};
