// Squads management for 66 Challenge

import { supabase } from './supabase';

export interface Squad {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  created_at: string;
  member_count?: number;
}

export interface SquadMember {
  id: string;
  squad_id: string;
  user_id: string;
  joined_at: string;
  profiles: {
    id: string;
    name: string;
    username: string;
  };
  stats?: {
    current_day: number;
    current_streak: number;
  };
}

export interface SquadActivity {
  id: string;
  squad_id: string;
  user_id: string;
  activity_type: 'day_complete' | 'day_fail' | 'joined' | 'left';
  day_number?: number;
  created_at: string;
  profiles: {
    name: string;
    username: string;
  };
}

// Generate a unique 6-character squad code
function generateSquadCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Create a new squad
export async function createSquad(name: string): Promise<Squad | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const code = generateSquadCode();

  const { data, error } = await supabase
    .from('squads')
    .insert({
      name,
      code,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating squad:', error);
    return null;
  }

  // Auto-join as member
  await joinSquadById(data.id);

  return data;
}

// Join squad by code
export async function joinSquadByCode(code: string): Promise<{ success: boolean; error?: string; squad?: Squad }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not logged in' };

  // Find squad by code
  const { data: squad, error: findError } = await supabase
    .from('squads')
    .select('*, squad_members(count)')
    .eq('code', code.toUpperCase())
    .single();

  if (findError || !squad) {
    return { success: false, error: 'Squad not found' };
  }

  // Check member count (max 8)
  const memberCount = squad.squad_members?.[0]?.count || 0;
  if (memberCount >= 8) {
    return { success: false, error: 'Squad is full (max 8 members)' };
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('squad_members')
    .select('id')
    .eq('squad_id', squad.id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return { success: false, error: 'Already a member' };
  }

  // Join
  const { error: joinError } = await supabase
    .from('squad_members')
    .insert({
      squad_id: squad.id,
      user_id: user.id,
    });

  if (joinError) {
    return { success: false, error: 'Failed to join squad' };
  }

  // Log activity
  await logSquadActivity(squad.id, 'joined');

  return { success: true, squad };
}

// Join squad by ID (internal)
async function joinSquadById(squadId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('squad_members')
    .insert({
      squad_id: squadId,
      user_id: user.id,
    });

  return !error;
}

// Leave squad
export async function leaveSquad(squadId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Log activity before leaving
  await logSquadActivity(squadId, 'left');

  const { error } = await supabase
    .from('squad_members')
    .delete()
    .eq('squad_id', squadId)
    .eq('user_id', user.id);

  return !error;
}

// Get user's squads
export async function getUserSquads(): Promise<Squad[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('squad_members')
    .select(`
      squad_id,
      squads (
        id,
        name,
        code,
        owner_id,
        created_at
      )
    `)
    .eq('user_id', user.id);

  if (error || !data) return [];

  return data.map((d: any) => d.squads).filter(Boolean);
}

// Get squad members
export async function getSquadMembers(squadId: string): Promise<SquadMember[]> {
  const { data, error } = await supabase
    .from('squad_members')
    .select(`
      id,
      squad_id,
      user_id,
      joined_at,
      profiles (
        id,
        name,
        username
      )
    `)
    .eq('squad_id', squadId)
    .order('joined_at', { ascending: true });

  if (error || !data) return [];

  // Get stats for each member
  const memberIds = data.map((m: any) => m.user_id);
  const { data: statsData } = await supabase
    .from('user_stats')
    .select('user_id, current_day, current_streak')
    .in('user_id', memberIds);

  const statsMap = new Map(statsData?.map((s: any) => [s.user_id, s]) || []);

  return data.map((m: any) => ({
    ...m,
    stats: statsMap.get(m.user_id) || { current_day: 1, current_streak: 0 },
  }));
}

// Get squad leaderboard
export async function getSquadLeaderboard(squadId: string): Promise<SquadMember[]> {
  const members = await getSquadMembers(squadId);
  return members.sort((a, b) => {
    // Sort by current day, then by streak
    if ((b.stats?.current_day || 0) !== (a.stats?.current_day || 0)) {
      return (b.stats?.current_day || 0) - (a.stats?.current_day || 0);
    }
    return (b.stats?.current_streak || 0) - (a.stats?.current_streak || 0);
  });
}

// Get squad activity feed
export async function getSquadActivity(squadId: string, limit: number = 20): Promise<SquadActivity[]> {
  const { data, error } = await supabase
    .from('squad_activity')
    .select(`
      id,
      squad_id,
      user_id,
      activity_type,
      day_number,
      created_at,
      profiles (
        name,
        username
      )
    `)
    .eq('squad_id', squadId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as unknown as SquadActivity[];
}

// Log squad activity
export async function logSquadActivity(
  squadId: string,
  activityType: 'day_complete' | 'day_fail' | 'joined' | 'left',
  dayNumber?: number
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('squad_activity')
    .insert({
      squad_id: squadId,
      user_id: user.id,
      activity_type: activityType,
      day_number: dayNumber,
    });
}

// Get squad by ID
export async function getSquad(squadId: string): Promise<Squad | null> {
  const { data, error } = await supabase
    .from('squads')
    .select('*')
    .eq('id', squadId)
    .single();

  if (error) return null;
  return data;
}

// Delete squad (owner only)
export async function deleteSquad(squadId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Verify ownership
  const { data: squad } = await supabase
    .from('squads')
    .select('owner_id')
    .eq('id', squadId)
    .single();

  if (squad?.owner_id !== user.id) return false;

  // Delete squad (cascade deletes members and activity)
  const { error } = await supabase
    .from('squads')
    .delete()
    .eq('id', squadId);

  return !error;
}
