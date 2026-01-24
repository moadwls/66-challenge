// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Schedule a daily reminder notification
export function scheduleDailyReminder(hour: number = 20, minute: number = 0): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  
  // Store the preferred reminder time
  localStorage.setItem('reminderTime', JSON.stringify({ hour, minute }));
  localStorage.setItem('notificationsEnabled', 'true');
  
  // Check and show notification
  checkAndShowReminder();
}

// Check if it's time to show reminder
export function checkAndShowReminder(): void {
  const enabled = localStorage.getItem('notificationsEnabled') === 'true';
  if (!enabled) return;
  
  const reminderTime = localStorage.getItem('reminderTime');
  if (!reminderTime) return;
  
  const { hour, minute } = JSON.parse(reminderTime);
  const now = new Date();
  const lastShown = localStorage.getItem('lastReminderShown');
  const today = now.toDateString();
  
  // Don't show if already shown today
  if (lastShown === today) return;
  
  // Check if it's past the reminder time
  if (now.getHours() >= hour && now.getMinutes() >= minute) {
    showReminderNotification();
    localStorage.setItem('lastReminderShown', today);
  }
}

// Show the actual notification
export function showReminderNotification(): void {
  if (Notification.permission !== 'granted') return;
  
  const aggressiveQuotes = [
    "You're about to quit like you always do. Prove me wrong.",
    "Everyone who doubted you is waiting for you to fail today.",
    "Discipline or regret. You can't have both. Choose now.",
    "While you make excuses, someone else is taking your spot.",
    "You said you'd change. Was that another lie to yourself?",
    "Weak people skip days. Which one are you?",
    "Your future self is watching. Don't disappoint them again.",
    "Day incomplete = another broken promise to yourself.",
    "The pain of discipline or the pain of regret. Pick one.",
    "You're not tired, you're weak. Get up and finish.",
    "Nobody cares about your excuses. Complete your rules.",
    "Average people rest. Legends never stop. What are you?",
    "Your comfort zone is where your dreams go to die.",
    "Skip today and you're back to being nobody tomorrow.",
    "Winners don't negotiate with their own rules.",
  ];
  
  const randomQuote = aggressiveQuotes[Math.floor(Math.random() * aggressiveQuotes.length)];
  
  const notification = new Notification('66 Challenge', {
    body: randomQuote,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'daily-reminder',
    requireInteraction: true,
  });
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

// Disable notifications
export function disableNotifications(): void {
  localStorage.setItem('notificationsEnabled', 'false');
}

// Check if notifications are enabled
export function areNotificationsEnabled(): boolean {
  return localStorage.getItem('notificationsEnabled') === 'true';
}

// Get reminder time
export function getReminderTime(): { hour: number; minute: number } | null {
  const reminderTime = localStorage.getItem('reminderTime');
  if (!reminderTime) return null;
  return JSON.parse(reminderTime);
}
