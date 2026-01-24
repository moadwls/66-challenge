'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ProBadge } from '@/components/ProBadge';
import { 
  getActivityFeed, 
  searchUsers, 
  followUser, 
  unfollowUser,
  addReaction,
  removeReaction,
  getCurrentUserId,
  getFollowing,
  getFollowers,
  getUserProfile,
  getLeaderboard
} from '@/lib/database';

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  day_number: number;
  streak_count: number;
  achievement_id: string;
  created_at: string;
  profiles: { id: string; name: string; username: string } | null;
  reactions: { id: string; user_id: string; emoji: string }[];
}

interface SearchResult {
  id: string;
  name: string;
  username: string;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
}

interface LeaderboardEntry {
  user_id: string;
  current_day: number;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  profiles: { name: string }[] | null;
}

export default function FriendsPage() {
  const router = useRouter();
  const { isPro, openPaywall } = useSubscription();
  const [activeTab, setActiveTab] = useState<'activity' | 'leaderboard'>('activity');
  const [showFindFriends, setShowFindFriends] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Show Pro upsell for free users
  if (!isPro) {
    return (
      <div className="min-h-screen theme-bg theme-text flex flex-col">
        {/* Header */}
        <div className="sticky top-0 theme-bg/90 backdrop-blur-sm z-10 border-b theme-border">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => router.push('/today')}
              className="theme-text-secondary"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold">Friends</h1>
            <div className="w-8" />
          </div>
        </div>

        {/* Pro Upsell */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B35] to-[#FF4D00] rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Friends & Squads</h2>
          <p className="text-center theme-text-secondary mb-6 max-w-sm">
            Connect with friends, compete in squads, and hold each other accountable on your 66-day journey.
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ProBadge /> Features
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-[#FF4D00]">✓</span>
                <span>Follow friends & see their progress</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF4D00]">✓</span>
                <span>Activity feed with reactions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF4D00]">✓</span>
                <span>Create Squads (3-8 people)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF4D00]">✓</span>
                <span>Squad leaderboards & challenges</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF4D00]">✓</span>
                <span>Get notified when squad members miss a day</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => openPaywall('friends')}
            className="w-full max-w-sm py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white font-bold rounded-xl active:scale-95 transition-transform"
          >
            Unlock Friends & Squads
          </button>
        </div>

        {/* Bottom Nav */}
        <div className="bottom-nav">
          <button onClick={() => router.push('/today')} className="nav-item theme-text-secondary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => router.push('/progress')} className="nav-item theme-text-secondary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Gallery</span>
          </button>
          <button className="nav-item text-[#FF4D00]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs">Friends</span>
          </button>
          <button onClick={() => router.push('/badges')} className="nav-item theme-text-secondary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-xs">Badges</span>
          </button>
          <button onClick={() => router.push('/profile')} className="nav-item theme-text-secondary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Load avatar from localStorage
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
    loadData();
  }, []);

  const loadData = async () => {
    const userId = await getCurrentUserId();
    setCurrentUserId(userId);
    
    // Get current user profile
    const profile = await getUserProfile();
    if (profile) {
      setCurrentUser({
        id: profile.id,
        name: profile.name,
        username: profile.username
      });
    }
    
    // Get activity feed
    const feedData = await getActivityFeed();
    setActivities(feedData);
    
    // Get leaderboard
    const leaderboardData = await getLeaderboard(20);
    setLeaderboard(leaderboardData as LeaderboardEntry[]);
    
    // Get following list
    const followingData = await getFollowing();
    setFollowing(followingData.map((f: any) => f.following_id));
    setFollowingCount(followingData.length);
    
    // Get followers count
    const followersData = await getFollowers();
    setFollowersCount(followersData.length);
    
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = await searchUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleFollow = async (userId: string) => {
    setFollowing([...following, userId]);
    setFollowingCount(prev => prev + 1);
    
    const result = await followUser(userId);
    
    if (!result) {
      setFollowing(following.filter(id => id !== userId));
      setFollowingCount(prev => prev - 1);
    }
  };

  const handleUnfollow = async (userId: string) => {
    setFollowing(following.filter(id => id !== userId));
    setFollowingCount(prev => prev - 1);
    
    const result = await unfollowUser(userId);
    
    if (!result) {
      setFollowing([...following, userId]);
      setFollowingCount(prev => prev + 1);
      loadData();
    }
  };

  const handleReaction = async (activityId: string, emoji: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const existingReaction = activity.reactions.find(r => r.user_id === currentUserId);
    
    if (existingReaction && existingReaction.emoji === emoji) {
      await removeReaction(activityId);
      setActivities(activities.map(a => {
        if (a.id === activityId) {
          return {
            ...a,
            reactions: a.reactions.filter(r => r.user_id !== currentUserId)
          };
        }
        return a;
      }));
    } else {
      await addReaction(activityId, emoji);
      setActivities(activities.map(a => {
        if (a.id === activityId) {
          const filteredReactions = a.reactions.filter(r => r.user_id !== currentUserId);
          return {
            ...a,
            reactions: [...filteredReactions, { id: 'temp', user_id: currentUserId!, emoji }]
          };
        }
        return a;
      }));
    }
  };

  const getActivityMessage = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'day_complete':
        return `completed Day ${activity.day_number}`;
      case 'streak_milestone':
        return `reached a ${activity.streak_count}-day streak`;
      case 'achievement':
        return `unlocked an achievement`;
      case 'day_fail':
        // Mocking messages - use activity id to pick consistent message
        const mockMessages = [
          `couldn't handle Day ${activity.day_number}... back to Day 1`,
          `broke their streak on Day ${activity.day_number}`,
          `failed on Day ${activity.day_number}. Restart the grind`,
          `lost their ${activity.day_number}-day streak`,
          `got humbled on Day ${activity.day_number}. Back to square one`,
          `fell off on Day ${activity.day_number}`,
          `couldn't stick to Day ${activity.day_number}. Discipline check failed`,
          `gave up on Day ${activity.day_number}`,
        ];
        // Use activity id to pick consistent message
        const hash = activity.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        return mockMessages[hash % mockMessages.length];
      default:
        return 'did something';
    }
  };

  const getActivityStyle = (activityType: string) => {
    if (activityType === 'day_fail') {
      return 'text-red-500';
    }
    return 'text-[#FF4D00]';
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getRankEmoji = (index: number) => {
    return `${index + 1}`;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-orange-600';
    return 'theme-bg-secondary theme-border';
  };

  return (
    <div className="min-h-screen theme-bg theme-text">
      {/* Header */}
      <div className="sticky top-0 theme-bg/90 backdrop-blur-sm z-10 border-b theme-border">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => router.push('/today')}
            className="theme-text-secondary"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Friends</h1>
          <button
            onClick={() => setShowFindFriends(true)}
            className="p-2 theme-text-secondary hover:text-[#FF4D00] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </button>
        </div>

        {/* User Stats */}
        <div className="flex items-center justify-center gap-8 py-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] rounded-full flex items-center justify-center text-black font-bold text-xl">
              {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{followersCount}</div>
              <div className="theme-text-secondary text-sm">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{followingCount}</div>
              <div className="theme-text-secondary text-sm">Following</div>
            </div>
          </div>
        </div>

        {/* Squads Button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => router.push('/squads')}
            className="w-full py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>My Squads</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b theme-border">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'activity' 
                ? 'text-[#FF4D00] border-b-2 border-[#FF4D00]' 
                : 'theme-text-secondary'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'leaderboard' 
                ? 'text-[#FF4D00] border-b-2 border-[#FF4D00]' 
                : 'theme-text-secondary'
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="theme-text-secondary">Loading...</p>
          </div>
        ) : activeTab === 'activity' ? (
          /* Activity Feed */
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">No activity yet</h3>
                <p className="theme-text-secondary mb-4">Follow friends to see their progress!</p>
                <button
                  onClick={() => setShowFindFriends(true)}
                  className="px-6 py-2 bg-[#FF4D00] text-black font-bold rounded-full"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="theme-bg-secondary rounded-2xl p-4 border theme-border"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] rounded-full flex items-center justify-center text-black font-bold">
                      {activity.profiles?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {activity.profiles?.name || 'Unknown'}
                        {activity.user_id === currentUserId && (
                          <span className="text-gray-500 text-sm ml-1">(you)</span>
                        )}
                      </div>
                      <div className="text-gray-500 text-sm">{getTimeAgo(activity.created_at)}</div>
                    </div>
                  </div>

                  {/* Activity message */}
                  <p className="text-lg">
                    <span className={`font-bold ${getActivityStyle(activity.activity_type)}`}>{getActivityMessage(activity)}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Leaderboard */
          <div className="divide-y theme-border">
            {leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="theme-text-secondary mb-2">No challengers yet!</p>
                <p className="theme-text-secondary text-sm">Be the first to complete a day</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`py-2 px-3 flex items-center gap-2 ${
                    entry.user_id === currentUserId ? 'theme-bg-secondary' : ''
                  }`}
                >
                  {/* Rank */}
                  <span className={`w-5 text-xs font-bold ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-400' : 
                    index === 2 ? 'text-orange-600' : 'theme-text-secondary'
                  }`}>
                    {index + 1}
                  </span>

                  {/* Name */}
                  <span className="flex-1 text-xs truncate">
                    {entry.profiles?.[0]?.name || 'Anonymous'}
                    {entry.user_id === currentUserId && (
                      <span className="ml-1 text-[#FF4D00]">(you)</span>
                    )}
                  </span>

                  {/* Day */}
                  <span className="text-xs theme-text-secondary">
                    D{entry.current_day}
                  </span>

                  {/* Streak */}
                  <span className="text-xs font-bold text-[#FF4D00] w-6 text-right">
                    {entry.current_streak}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Find Friends Modal */}
      {showFindFriends && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="sticky top-0 bg-black border-b border-[#FF4D00]/20 p-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => {
                  setShowFindFriends(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-gray-400"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold">Find Friends</h2>
              <div className="w-12"></div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by username..."
                className="w-full bg-black border border-[#FF4D00]/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF4D00]"
                style={{ fontSize: '16px' }}
                autoFocus
              />
              <svg 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between bg-black rounded-xl p-4 border border-[#FF4D00]/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] rounded-full flex items-center justify-center text-black font-bold text-lg">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-gray-500 text-sm">@{user.username}</div>
                      </div>
                    </div>
                    
                    {following.includes(user.id) ? (
                      <button
                        onClick={() => handleUnfollow(user.id)}
                        className="px-4 py-2 border border-[#FF4D00]/30 text-gray-400 rounded-full text-sm font-semibold"
                      >
                        Following
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(user.id)}
                        className="px-4 py-2 bg-[#FF4D00] text-black rounded-full text-sm font-bold"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No users found for "{searchQuery}"
              </div>
            )}

            {searchQuery.length < 2 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 theme-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Find your friends</h3>
                <p className="text-gray-500">Search by their username to follow them</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
