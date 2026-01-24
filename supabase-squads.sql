-- Squads Schema for 66 Challenge
-- Run this in Supabase SQL Editor

-- Squads table
CREATE TABLE IF NOT EXISTS squads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(6) UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Squad members table
CREATE TABLE IF NOT EXISTS squad_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

-- Squad activity feed
CREATE TABLE IF NOT EXISTS squad_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(20) NOT NULL, -- 'day_complete', 'day_fail', 'joined', 'left'
  day_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_squad_members_squad ON squad_members(squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_user ON squad_members(user_id);
CREATE INDEX IF NOT EXISTS idx_squad_activity_squad ON squad_activity(squad_id);
CREATE INDEX IF NOT EXISTS idx_squads_code ON squads(code);

-- RLS Policies
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_activity ENABLE ROW LEVEL SECURITY;

-- Squads: Anyone can read squads they're a member of
CREATE POLICY "Users can view squads they belong to" ON squads
  FOR SELECT USING (
    id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Squads: Anyone can create squads
CREATE POLICY "Users can create squads" ON squads
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Squads: Only owner can delete
CREATE POLICY "Owners can delete squads" ON squads
  FOR DELETE USING (owner_id = auth.uid());

-- Squad members: Members can view other members in their squads
CREATE POLICY "Members can view squad members" ON squad_members
  FOR SELECT USING (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Squad members: Users can join squads (insert themselves)
CREATE POLICY "Users can join squads" ON squad_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Squad members: Users can leave squads (delete themselves)
CREATE POLICY "Users can leave squads" ON squad_members
  FOR DELETE USING (user_id = auth.uid());

-- Squad activity: Members can view activity in their squads
CREATE POLICY "Members can view squad activity" ON squad_activity
  FOR SELECT USING (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Squad activity: Members can create activity
CREATE POLICY "Members can create squad activity" ON squad_activity
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid())
  );

-- Function to get squad member count
CREATE OR REPLACE FUNCTION get_squad_member_count(squad_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM squad_members WHERE squad_id = squad_uuid;
$$ LANGUAGE SQL STABLE;
