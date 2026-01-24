import { supabase } from './supabase';

// Get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Save daily progress to database
export async function saveDailyProgress(
  date: string,
  dayNumber: number,
  completed: boolean,
  failed: boolean,
  notes: string,
  rulesCompleted: boolean[]
) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('daily_progress')
    .upsert({
      user_id: userId,
      date,
      day_number: dayNumber,
      completed,
      failed,
      notes,
      rules_completed: rulesCompleted
    }, {
      onConflict: 'user_id,date'
    });

  if (error) {
    console.error('Error saving daily progress:', error);
    return null;
  }

  return data;
}

// Update user stats
export async function updateUserStats(
  currentDay: number,
  currentStreak: number,
  bestStreak: number,
  totalCompletions: number,
  totalFailures: number
) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      current_day: currentDay,
      current_streak: currentStreak,
      best_streak: bestStreak,
      total_completions: totalCompletions,
      total_failures: totalFailures,
      last_updated: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error updating user stats:', error);
    return null;
  }

  return data;
}

// Get user stats
export async function getUserStats() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error getting user stats:', error);
    return null;
  }

  return data;
}

// Get user profile
export async function getUserProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }

  return data;
}

// Save achievement to database
export async function saveAchievement(achievementId: string, dayUnlocked: number) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('user_achievements')
    .upsert({
      user_id: userId,
      achievement_id: achievementId,
      day_unlocked: dayUnlocked,
      unlocked_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,achievement_id'
    });

  if (error) {
    console.error('Error saving achievement:', error);
    return null;
  }

  return data;
}

// Get leaderboard (top users by current streak)
export async function getLeaderboard(limit: number = 20) {
  // First get user_stats
  const { data: stats, error: statsError } = await supabase
    .from('user_stats')
    .select('*')
    .order('current_day', { ascending: false })
    .limit(limit);

  if (statsError || !stats) {
    console.error('Error getting leaderboard stats:', statsError);
    return [];
  }

  // Then get profiles for each user
  const userIds = stats.map(s => s.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error getting profiles:', profilesError);
  }

  // Merge the data
  const leaderboard = stats.map(stat => {
    const profile = profiles?.find(p => p.id === stat.user_id);
    return {
      ...stat,
      profiles: profile ? [{ name: profile.name }] : null
    };
  });

  return leaderboard;
}

// Get user's daily progress history
export async function getDailyProgressHistory() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error getting daily progress history:', error);
    return [];
  }

  return data || [];
}

// ============ FRIENDS SYSTEM ============

// Search users by username
export async function searchUsers(query: string) {
  const userId = await getCurrentUserId();
  if (!userId || !query) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, username')
    .ilike('username', `%${query}%`)
    .neq('id', userId)
    .limit(10);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data || [];
}

// Follow a user
export async function followUser(targetUserId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error('No user ID found');
    return false;
  }

  // Check if already following to avoid duplicate key error
  const { data: existing } = await supabase
    .from('friendships')
    .select('id')
    .eq('follower_id', userId)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (existing) {
    // Already following, return success
    console.log('Already following this user');
    return true;
  }

  const { error } = await supabase
    .from('friendships')
    .insert({
      follower_id: userId,
      following_id: targetUserId
    });

  if (error) {
    // Handle duplicate key error gracefully (race condition)
    if (error.code === '23505') {
      console.log('Already following (race condition)');
      return true;
    }
    console.error('Error following user:', error.message, error.details, error.hint);
    return false;
  }

  return true;
}

// Unfollow a user
export async function unfollowUser(targetUserId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('follower_id', userId)
    .eq('following_id', targetUserId);

  if (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }

  return true;
}

// Get list of users I follow
export async function getFollowing() {
  const userId = await getCurrentUserId();
  console.log('getFollowing - userId:', userId);
  if (!userId) return [];

  // First, get the friendships
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('following_id')
    .eq('follower_id', userId);

  if (friendshipsError) {
    console.error('Error getting friendships:', friendshipsError);
    return [];
  }

  if (!friendships || friendships.length === 0) {
    console.log('getFollowing - no friendships found');
    return [];
  }

  // Then, get the profiles for those users
  const followingIds = friendships.map(f => f.following_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, username')
    .in('id', followingIds);

  if (profilesError) {
    console.error('Error getting profiles:', profilesError);
    return [];
  }

  // Merge the data
  const result = friendships.map(f => ({
    following_id: f.following_id,
    profiles: profiles?.find(p => p.id === f.following_id) || null
  }));

  console.log('getFollowing - result:', result);
  return result;
}

// Get followers count
export async function getFollowersCount() {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  const { count, error } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (error) {
    console.error('Error getting followers count:', error);
    return 0;
  }

  return count || 0;
}

// Get list of users following me
export async function getFollowers() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  // First, get the friendships where I'm being followed
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('follower_id')
    .eq('following_id', userId);

  if (friendshipsError) {
    console.error('Error getting followers:', friendshipsError);
    return [];
  }

  if (!friendships || friendships.length === 0) {
    return [];
  }

  // Then, get the profiles for those users
  const followerIds = friendships.map(f => f.follower_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, username')
    .in('id', followerIds);

  if (profilesError) {
    console.error('Error getting follower profiles:', profilesError);
    return [];
  }

  // Merge the data
  return friendships.map(f => ({
    follower_id: f.follower_id,
    profiles: profiles?.find(p => p.id === f.follower_id) || null
  }));
}

// Check if following a user
export async function isFollowing(targetUserId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { data, error } = await supabase
    .from('friendships')
    .select('id')
    .eq('follower_id', userId)
    .eq('following_id', targetUserId)
    .single();

  if (error) return false;
  return !!data;
}

// Create activity (called when completing a day)
export async function createActivity(
  activityType: 'day_complete' | 'streak_milestone' | 'achievement' | 'day_fail',
  dayNumber?: number,
  streakCount?: number,
  achievementId?: string
) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('activity_feed')
    .insert({
      user_id: userId,
      activity_type: activityType,
      day_number: dayNumber,
      streak_count: streakCount,
      achievement_id: achievementId
    });

  if (error) {
    console.error('Error creating activity:', error);
    return null;
  }

  return data;
}

// Get activity feed (friends' activities)
export async function getActivityFeed(limit: number = 50) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  // First get the activities
  const { data: activities, error: activitiesError } = await supabase
    .from('activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (activitiesError) {
    console.error('Error getting activity feed:', activitiesError);
    return [];
  }

  if (!activities || activities.length === 0) {
    return [];
  }

  // Get unique user IDs from activities
  const userIds = [...new Set(activities.map(a => a.user_id))];
  const activityIds = activities.map(a => a.id);

  // Get profiles for those users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, username')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error getting profiles for feed:', profilesError);
  }

  // Get reactions for those activities
  const { data: reactions, error: reactionsError } = await supabase
    .from('reactions')
    .select('id, activity_id, user_id, emoji')
    .in('activity_id', activityIds);

  if (reactionsError) {
    console.error('Error getting reactions:', reactionsError);
  }

  // Merge the data
  const result = activities.map(activity => ({
    ...activity,
    profiles: profiles?.find(p => p.id === activity.user_id) || null,
    reactions: reactions?.filter(r => r.activity_id === activity.id) || []
  }));

  return result;
}

// Add reaction to activity
export async function addReaction(activityId: string, emoji: string) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('reactions')
    .upsert({
      activity_id: activityId,
      user_id: userId,
      emoji: emoji
    }, {
      onConflict: 'activity_id,user_id'
    });

  if (error) {
    console.error('Error adding reaction:', error);
    return null;
  }

  return data;
}

// Remove reaction
export async function removeReaction(activityId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('activity_id', activityId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing reaction:', error);
    return null;
  }

  return true;
}

// Update username
export async function updateUsername(username: string) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update({ username: username.toLowerCase() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating username:', error);
    return null;
  }

  return data;
}
