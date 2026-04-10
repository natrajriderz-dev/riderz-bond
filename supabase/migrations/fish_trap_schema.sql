-- ============================================
-- SUYAVARAA Fish Trap Database Schema
-- ============================================
-- This migration creates all tables needed for the Fish Trap
-- proactive scammer interception system

-- Create Tribes table first (referenced by decoy_profiles)
CREATE TABLE IF NOT EXISTS tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Decoy Profiles Table
-- Stores the 20+ decoy profiles that act as bait for scammers
CREATE TABLE IF NOT EXISTS decoy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,
  tribe_id UUID REFERENCES tribes(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_request_sent_at TIMESTAMP,
  request_send_interval INT DEFAULT 172800, -- 2 days in seconds
  characteristics JSONB -- personality traits for response generation
);

-- Fish Trap Interactions
-- Tracks each conversation between unverified users and decoy profiles
CREATE TABLE IF NOT EXISTS fish_trap_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decoy_id UUID NOT NULL REFERENCES decoy_profiles(id) ON DELETE CASCADE,
  request_id UUID UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, blocked
  behavior_flags JSONB DEFAULT '[]', -- array of detected red flags
  red_flag_count INT DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, decoy_id)
);

-- Fish Trap Messages
-- Stores all messages in decoy conversations, with scrubbing applied
CREATE TABLE IF NOT EXISTS fish_trap_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID NOT NULL REFERENCES fish_trap_interactions(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL, -- 'user' or 'decoy'
  user_id UUID REFERENCES auth.users(id),
  decoy_id UUID REFERENCES decoy_profiles(id),
  content TEXT NOT NULL, -- original content (for analysis)
  displayed_content TEXT, -- scrubbed content (phone/instagram hidden)
  contains_contact_info BOOLEAN DEFAULT false,
  contact_info_type VARCHAR(50), -- 'phone', 'instagram', 'whatsapp', etc
  red_flags JSONB DEFAULT '{}', -- detected patterns
  created_at TIMESTAMP DEFAULT NOW()
);

-- Note: contact_info_logs table is created in trust_and_verification.sql migration

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_fish_trap_interactions_user ON fish_trap_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fish_trap_interactions_decoy ON fish_trap_interactions(decoy_id);
CREATE INDEX IF NOT EXISTS idx_fish_trap_messages_interaction ON fish_trap_messages(interaction_id);
CREATE INDEX IF NOT EXISTS idx_fish_trap_messages_created ON fish_trap_messages(created_at);

-- Enable Row Level Security
ALTER TABLE decoy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fish_trap_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fish_trap_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only access for security)
CREATE POLICY "Admin only access to decoy profiles" ON decoy_profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only access to fish trap interactions" ON fish_trap_interactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only access to fish trap messages" ON fish_trap_messages
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Note: contact_info_logs RLS policies are configured in trust_and_verification.sql migration

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for fish_trap_interactions
CREATE TRIGGER update_fish_trap_interactions_updated_at
    BEFORE UPDATE ON fish_trap_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();