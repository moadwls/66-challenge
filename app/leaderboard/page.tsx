'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLeaderboard } from '@/lib/database';
import { supabase } from '@/lib/supabase';

type LeaderboardEntry = {
  user_id: string;
  current_day: number;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  profiles: {
    name: string;
  }[] | null;
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Get leaderboard
      const data = await getLeaderboard(20);
      setLeaderboard(data as LeaderboardEntry[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getRankEmoji = (index: number) => {
    return `${index + 1}`;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-orange-600';
    return 'bg-black border-[#FF4D00]/30';
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#FF4D00]/20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/today')}
            className="text-gray-400 hover:text-white"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-black">Leaderboard</h1>
        </div>
        <p className="text-gray-400 text-sm mt-1">Top challengers by current streak</p>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-gray-400 mb-2">No challengers yet!</p>
            <p className="text-gray-500 text-sm">Be the first to complete a day</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`p-4 rounded-2xl border-2 ${getRankStyle(index)} ${
                entry.user_id === currentUserId ? 'ring-2 ring-[#FF4D00]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-10 h-10 flex items-center justify-center text-2xl font-black">
                  {getRankEmoji(index)}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">
                      {entry.profiles?.[0]?.name || 'Anonymous'}
                    </h3>
                    {entry.user_id === currentUserId && (
                      <span className="text-xs bg-[#FF4D00] text-black px-2 py-0.5 rounded-full font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Day {entry.current_day} • Best: {entry.best_streak} days
                  </p>
                </div>

                {/* Streak */}
                <div className="text-right">
                  <div className="text-2xl font-black text-[#FF4D00]">
                    {entry.current_streak}
                  </div>
                  <div className="text-xs text-gray-400">streak</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-[#FF4D00]/20">
        <button
          onClick={() => router.push('/today')}
          className="w-full py-4 bg-gradient-to-r from-[#FF6B35] via-[#FF4D00] to-[#E34400] text-black text-lg font-black rounded-xl active:scale-95 transition-transform shadow-lg"
        >
          BACK TO CHALLENGE
        </button>
      </div>
    </div>
  );
}
