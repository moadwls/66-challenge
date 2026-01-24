'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ProBadge } from '@/components/ProBadge';
import {
  Squad,
  SquadMember,
  SquadActivity,
  getUserSquads,
  createSquad,
  joinSquadByCode,
  leaveSquad,
  getSquadMembers,
  getSquadLeaderboard,
  getSquadActivity,
  getSquad,
  deleteSquad,
} from '@/lib/squads';

type View = 'list' | 'detail' | 'create' | 'join';

export default function SquadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPro, openPaywall } = useSubscription();
  
  const [view, setView] = useState<View>('list');
  const [squads, setSquads] = useState<Squad[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [activity, setActivity] = useState<SquadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newSquadName, setNewSquadName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'activity'>('leaderboard');

  useEffect(() => {
    loadSquads();
  }, []);

  const loadSquads = async () => {
    setLoading(true);
    const data = await getUserSquads();
    setSquads(data);
    setLoading(false);
  };

  const loadSquadDetails = async (squad: Squad) => {
    setSelectedSquad(squad);
    setView('detail');
    
    const [membersData, activityData] = await Promise.all([
      getSquadLeaderboard(squad.id),
      getSquadActivity(squad.id),
    ]);
    
    setMembers(membersData);
    setActivity(activityData);
  };

  const handleCreateSquad = async () => {
    if (!newSquadName.trim()) {
      setError('Please enter a squad name');
      return;
    }
    
    setLoading(true);
    const squad = await createSquad(newSquadName.trim());
    if (squad) {
      await loadSquads();
      setNewSquadName('');
      setView('list');
      loadSquadDetails(squad);
    } else {
      setError('Failed to create squad');
    }
    setLoading(false);
  };

  const handleJoinSquad = async () => {
    if (joinCode.length !== 6) {
      setError('Please enter a 6-character code');
      return;
    }
    
    setLoading(true);
    const result = await joinSquadByCode(joinCode);
    if (result.success && result.squad) {
      await loadSquads();
      setJoinCode('');
      setView('list');
      loadSquadDetails(result.squad);
    } else {
      setError(result.error || 'Failed to join squad');
    }
    setLoading(false);
  };

  const handleLeaveSquad = async () => {
    if (!selectedSquad) return;
    
    if (!confirm('Are you sure you want to leave this squad?')) return;
    
    setLoading(true);
    await leaveSquad(selectedSquad.id);
    await loadSquads();
    setSelectedSquad(null);
    setView('list');
    setLoading(false);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getActivityMessage = (act: SquadActivity) => {
    switch (act.activity_type) {
      case 'day_complete':
        return `completed Day ${act.day_number}`;
      case 'day_fail':
        return `failed Day ${act.day_number}`;
      case 'joined':
        return 'joined the squad';
      case 'left':
        return 'left the squad';
      default:
        return 'did something';
    }
  };

  // Pro check
  if (!isPro) {
    return (
      <div className="min-h-screen theme-bg theme-text flex flex-col">
        {/* Header */}
        <div className="sticky top-0 theme-bg/90 backdrop-blur-sm z-10 border-b theme-border">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => router.push('/today')} className="theme-text-secondary">
              ← Back
            </button>
            <h1 className="text-xl font-bold">Squads</h1>
            <div className="w-8" />
          </div>
        </div>

        {/* Pro Upsell */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B35] to-[#FF4D00] rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Squads</h2>
          <p className="text-center theme-text-secondary mb-6 max-w-sm">
            Create or join a squad of 3-8 people. Compete together and hold each other accountable.
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ProBadge /> Squad Features
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-[#FF4D00]">✓</span>
                <span>Create private squads (3-8 members)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF4D00]">✓</span>
                <span>Squad leaderboard</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF4D00]">✓</span>
                <span>Squad activity feed</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF4D00]">✓</span>
                <span>Notifications when members miss a day</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => openPaywall('squads')}
            className="w-full max-w-sm py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white font-bold rounded-xl active:scale-95 transition-transform"
          >
            Unlock Squads
          </button>
        </div>

        <BottomNav router={router} active="friends" />
      </div>
    );
  }

  // Squad Detail View
  if (view === 'detail' && selectedSquad) {
    return (
      <div className="min-h-screen theme-bg theme-text flex flex-col">
        {/* Header */}
        <div className="sticky top-0 theme-bg/90 backdrop-blur-sm z-10 border-b theme-border">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setView('list')} className="theme-text-secondary">
              ← Back
            </button>
            <h1 className="text-xl font-bold">{selectedSquad.name}</h1>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedSquad.code);
                alert(`Code copied: ${selectedSquad.code}`);
              }}
              className="text-[#FF4D00] text-sm font-medium"
            >
              {selectedSquad.code}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b theme-border">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'leaderboard' ? 'text-[#FF4D00] border-b-2 border-[#FF4D00]' : 'theme-text-secondary'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'activity' ? 'text-[#FF4D00] border-b-2 border-[#FF4D00]' : 'theme-text-secondary'
              }`}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-32">
          {activeTab === 'leaderboard' ? (
            <div className="space-y-2">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    index === 0 ? 'bg-yellow-500/10 border-yellow-500' :
                    index === 1 ? 'bg-gray-400/10 border-gray-400' :
                    index === 2 ? 'bg-orange-600/10 border-orange-600' :
                    'theme-bg-secondary theme-border'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'theme-bg-tertiary'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.profiles?.name || 'Unknown'}</p>
                    <p className="text-xs theme-text-secondary">@{member.profiles?.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#FF4D00]">Day {member.stats?.current_day || 1}</p>
                    <p className="text-xs theme-text-secondary">{member.stats?.current_streak || 0} streak</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {activity.length === 0 ? (
                <p className="text-center theme-text-secondary py-8">No activity yet</p>
              ) : (
                activity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 theme-bg-secondary rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF4D00] rounded-full flex items-center justify-center text-white font-bold">
                      {act.profiles?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p>
                        <span className="font-medium">{act.profiles?.name}</span>{' '}
                        <span className={act.activity_type === 'day_fail' ? 'text-red-500' : 'theme-text-secondary'}>
                          {getActivityMessage(act)}
                        </span>
                      </p>
                      <p className="text-xs theme-text-secondary">{getTimeAgo(act.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Leave button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 theme-bg border-t theme-border">
          <button
            onClick={handleLeaveSquad}
            className="w-full py-3 border border-red-500 text-red-500 font-medium rounded-xl"
          >
            Leave Squad
          </button>
        </div>

        <BottomNav router={router} active="friends" />
      </div>
    );
  }

  // Create Squad View
  if (view === 'create') {
    return (
      <div className="min-h-screen theme-bg theme-text flex flex-col">
        <div className="sticky top-0 theme-bg/90 backdrop-blur-sm z-10 border-b theme-border">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => { setView('list'); setError(''); }} className="theme-text-secondary">
              ← Back
            </button>
            <h1 className="text-xl font-bold">Create Squad</h1>
            <div className="w-8" />
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-sm mx-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF4D00] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Create Your Squad</h2>
              <p className="theme-text-secondary text-sm">Invite 2-7 friends to join (3-8 total)</p>
            </div>

            <div>
              <label className="block text-sm theme-text-secondary mb-2">Squad Name</label>
              <input
                type="text"
                value={newSquadName}
                onChange={(e) => setNewSquadName(e.target.value)}
                placeholder="e.g. The Grind Squad"
                maxLength={30}
                className="w-full p-4 theme-bg-secondary border theme-border rounded-xl focus:outline-none focus:border-[#FF4D00]"
                style={{ fontSize: '16px' }}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleCreateSquad}
              disabled={loading || !newSquadName.trim()}
              className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white font-bold rounded-xl disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Squad'}
            </button>
          </div>
        </div>

        <BottomNav router={router} active="friends" />
      </div>
    );
  }

  // Join Squad View
  if (view === 'join') {
    return (
      <div className="min-h-screen theme-bg theme-text flex flex-col">
        <div className="sticky top-0 theme-bg/90 backdrop-blur-sm z-10 border-b theme-border">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => { setView('list'); setError(''); }} className="theme-text-secondary">
              ← Back
            </button>
            <h1 className="text-xl font-bold">Join Squad</h1>
            <div className="w-8" />
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-sm mx-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF4D00] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Join a Squad</h2>
              <p className="theme-text-secondary text-sm">Enter the 6-character code from your friend</p>
            </div>

            <div>
              <label className="block text-sm theme-text-secondary mb-2">Squad Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                maxLength={6}
                className="w-full p-4 theme-bg-secondary border theme-border rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-[#FF4D00]"
                style={{ fontSize: '24px' }}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleJoinSquad}
              disabled={loading || joinCode.length !== 6}
              className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white font-bold rounded-xl disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Squad'}
            </button>
          </div>
        </div>

        <BottomNav router={router} active="friends" />
      </div>
    );
  }

  // Squad List View (default)
  return (
    <div className="min-h-screen theme-bg theme-text flex flex-col">
      <div className="sticky top-0 theme-bg/90 backdrop-blur-sm z-10 border-b theme-border">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => router.push('/friends')} className="theme-text-secondary">
            ← Friends
          </button>
          <h1 className="text-xl font-bold">Squads</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setView('create')}
            className="flex-1 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white font-bold rounded-xl"
          >
            Create Squad
          </button>
          <button
            onClick={() => setView('join')}
            className="flex-1 py-3 border-2 border-[#FF4D00] text-[#FF4D00] font-bold rounded-xl"
          >
            Join Squad
          </button>
        </div>

        {/* Squads List */}
        {loading ? (
          <div className="text-center py-8 theme-text-secondary">Loading...</div>
        ) : squads.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF4D00] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">No Squads Yet</h3>
            <p className="theme-text-secondary text-sm">
              Create a squad or join one with a code from a friend
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {squads.map((squad) => (
              <button
                key={squad.id}
                onClick={() => loadSquadDetails(squad)}
                className="w-full p-4 theme-bg-secondary rounded-xl border theme-border text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF4D00] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{squad.name}</h3>
                  <p className="text-xs theme-text-secondary">Code: {squad.code}</p>
                </div>
                <svg className="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav router={router} active="friends" />
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ router, active }: { router: any; active: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 theme-bg border-t theme-border">
      <div className="flex justify-around py-2">
        <button onClick={() => router.push('/today')} className={`flex flex-col items-center p-2 ${active === 'home' ? 'text-[#FF4D00]' : 'theme-text-secondary'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button onClick={() => router.push('/progress')} className={`flex flex-col items-center p-2 ${active === 'gallery' ? 'text-[#FF4D00]' : 'theme-text-secondary'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Gallery</span>
        </button>
        <button onClick={() => router.push('/friends')} className={`flex flex-col items-center p-2 ${active === 'friends' ? 'text-[#FF4D00]' : 'theme-text-secondary'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-xs">Friends</span>
        </button>
        <button onClick={() => router.push('/badges')} className={`flex flex-col items-center p-2 ${active === 'badges' ? 'text-[#FF4D00]' : 'theme-text-secondary'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="text-xs">Badges</span>
        </button>
        <button onClick={() => router.push('/profile')} className={`flex flex-col items-center p-2 ${active === 'profile' ? 'text-[#FF4D00]' : 'theme-text-secondary'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
