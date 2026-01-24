-- FRIENDS SYSTEM TABLES
-- Run this in Supabase SQL Editor

-- 1. Friendships table (who follows who)
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 2. Activity feed table (auto-generated events)
CREATE TABLE activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'day_complete', 'streak_milestone', 'achievement', 'day_fail'
  day_number INTEGER,
  streak_count INTEGER,
  achievement_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Reactions table
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL, -- '🔥', '💪', '👏'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id) -- one reaction per user per activity
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Friendships policies
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow others"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON friendships FOR DELETE
  USING (auth.uid() = follower_id);

-- Activity feed policies
CREATE POLICY "Users can view friends activities"
  ON activity_feed FOR SELECT
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT following_id FROM friendships WHERE follower_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own activities"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Anyone can view reactions"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Add username to profiles if not exists (for friend search)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster username search
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
