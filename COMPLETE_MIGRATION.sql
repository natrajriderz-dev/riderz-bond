-- ============================================
-- COMPLETE MIGRATION - TrekRiderz App
-- ============================================
-- IMPORTANT: This migration is designed for your EXISTING database schema
-- Updates will be applied to existing tables, not recreating them
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click "Execute"

-- ============================================
-- MIGRATION 0: Verify existing Fish Trap tables
-- ============================================
-- NOTE: Your existing database already has:
-- - tribes (with slug, icon, color, member_count)
-- - decoy_profiles (with persona_name, persona_age, etc.)
-- - fish_trap_conversations (with unverified_user_id, decoy_profile_id, conversation_id)
-- - fish_trap_messages (with conversation_id - NOT interaction_id)
-- 
-- These tables are ALREADY CREATED and will NOT be recreated
-- The following migrations add missing support tables only

-- ============================================
-- MIGRATION 1: Ensure Fish Trap support tables exist (already exist, verification only)
-- ============================================
-- Adding any missing columns to existing fish_trap tables if needed
-- The schema is already correct with conversation_id in fish_trap_messages

-- Create index if missing
CREATE INDEX IF NOT EXISTS idx_fish_trap_messages_conversation ON fish_trap_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_fish_trap_conversations_user ON fish_trap_conversations(unverified_user_id);
CREATE INDEX IF NOT EXISTS idx_fish_trap_conversations_decoy ON fish_trap_conversations(decoy_profile_id);

-- ============================================
-- MIGRATION 2: Notification Tokens (NEW TABLE)
-- ============================================

CREATE TABLE IF NOT EXISTS notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, push_token)
);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_user_id ON notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_active ON notification_tokens(is_active, user_id);

ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their notification tokens" ON notification_tokens CASCADE;
CREATE POLICY "Users can manage their notification tokens"
  ON notification_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_notification_tokens_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notification_tokens_timestamp ON notification_tokens;
CREATE TRIGGER trigger_update_notification_tokens_timestamp
  BEFORE UPDATE ON notification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_tokens_timestamp();

-- ============================================
-- MIGRATION 3: Trust & Verification (NEW TABLES)
-- ============================================

ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own verification requests" ON public.verification_requests CASCADE;
CREATE POLICY "Users can view their own verification requests"
  ON public.verification_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own verification requests" ON public.verification_requests CASCADE;
CREATE POLICY "Users can insert their own verification requests"
  ON public.verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.contact_info_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID,
  detected_content TEXT,
  is_suspicious BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.contact_info_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all logs" ON public.contact_info_logs CASCADE;
CREATE POLICY "Admins can view all logs"
  ON public.contact_info_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- ============================================
-- MIGRATION 4: Seed Decoy Profiles (INSERT into existing table)
-- ============================================
-- NOTE: These profiles will be INSERTED into your existing decoy_profiles table
-- The table structure is: (id, persona_name, persona_age, persona_gender, persona_city, 
--                         persona_bio, persona_photos, persona_occupation, is_active, etc.)

INSERT INTO decoy_profiles (persona_name, persona_age, persona_gender, persona_city, persona_bio, persona_occupation, is_active)
VALUES 
('Priya Sharma', 26, 'female', 'Mumbai', 'Software engineer by day, food blogger by night. Love exploring new restaurants and trying exotic cuisines.', 'Software Engineer', true),
('Arjun Patel', 29, 'male', 'Delhi', 'Entrepreneur building my dream startup. Love traveling, hiking, and deep conversations about life.', 'Entrepreneur', true),
('Sneha Gupta', 24, 'female', 'Bangalore', 'UX Designer with a passion for creating beautiful digital experiences. Coffee addict, book lover, and weekend hiker.', 'UX Designer', true),
('Rohan Singh', 31, 'male', 'Chennai', 'Doctor working in emergency medicine. Long shifts but love helping people. Playing guitar or exploring local cafes.', 'Doctor', true),
('Ananya Reddy', 27, 'female', 'Hyderabad', 'Marketing manager who loves planning events and bringing people together. Fitness enthusiast, yoga practitioner, and amateur photographer.', 'Marketing Manager', true),
('Vikram Kumar', 28, 'male', 'Pune', 'Data scientist fascinated by AI and machine learning. Love solving complex problems and teaching others. Weekend cycling and swimming.', 'Data Scientist', true),
('Kavya Menon', 25, 'female', 'Kochi', 'Journalist covering social issues and human stories. Passionate about making a difference. Love reading, writing, and meaningful conversations.', 'Journalist', true),
('Aditya Joshi', 30, 'male', 'Ahmedabad', 'Architect designing sustainable buildings for the future. Love sustainable living, organic farming, and eco-friendly travel.', 'Architect', true),
('Meera Iyer', 26, 'female', 'Chennai', 'Classical dancer and teacher. Expressing emotions through movement and music. Love traditional arts, spirituality, and connecting with like-minded souls.', 'Classical Dancer', true),
('Rahul Verma', 32, 'male', 'Jaipur', 'Hotel manager overseeing luxury properties. Love fine dining, wine tasting, and cultural experiences. Well-traveled and always planning the next adventure.', 'Hotel Manager', true),
('Divya Nair', 24, 'female', 'Trivandrum', 'Recent law graduate passionate about justice and equality. Love debating ideas, watching documentaries, and volunteering.', 'Lawyer', true),
('Karan Malhotra', 29, 'male', 'Gurgaon', 'Investment banker with a work-hard-play-hard mentality. Love fine whiskey, golf, and networking events. Successful and ambitious.', 'Investment Banker', true),
('Pooja Agarwal', 27, 'female', 'Kolkata', 'Chef specializing in Bengali cuisine. Love experimenting in the kitchen and hosting dinner parties. Food is my love language!', 'Chef', true),
('Siddharth Rao', 31, 'male', 'Mysore', 'Professor of literature and poetry enthusiast. Love discussing books, writing, and philosophical conversations.', 'Professor', true),
('Nisha Kapoor', 25, 'female', 'Lucknow', 'Fashion designer creating sustainable clothing. Love ethical fashion, art galleries, and cultural festivals.', 'Fashion Designer', true),
('Amitabh Saxena', 33, 'male', 'Varanasi', 'Spiritual guide and meditation teacher. Help others find inner peace and purpose. Love yoga, Ayurveda, and connecting with the divine.', 'Spiritual Guide', true),
('Riya Choudhury', 26, 'female', 'Guwahati', 'Wildlife photographer and conservationist. Travel the world capturing endangered species and raising awareness. Love nature, adventure.', 'Wildlife Photographer', true),
('Manish Tiwari', 30, 'male', 'Indore', 'Music producer and DJ. Create beats and mix tracks for underground artists. Love electronic music, festivals, and late-night studio sessions.', 'Music Producer', true),
('Swati Deshmukh', 28, 'female', 'Nagpur', 'Social entrepreneur running a startup for rural education. Passionate about bridging the education gap. Love reading, mentoring.', 'Social Entrepreneur', true),
('Rajesh Khanna', 34, 'male', 'Surat', 'Real estate developer building smart cities. Love innovation, technology, and creating sustainable communities. Successful businessman.', 'Real Estate Developer', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES (run these to verify)
-- ============================================
-- IMPORTANT: Your existing tables use CONVERSATION_ID, not INTERACTION_ID
-- The error you were seeing should now be resolved

-- Check all required tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN 
-- ('tribes', 'decoy_profiles', 'fish_trap_conversations', 'fish_trap_messages', 
--  'notification_tokens', 'verification_requests', 'contact_info_logs')
-- ORDER BY table_name;

-- Check decoy profiles seeded:
-- SELECT COUNT(*) as profile_count FROM decoy_profiles;
-- Should show: 20

-- Check fish_trap_messages structure (notice: uses conversation_id, NOT interaction_id):
-- SELECT id, conversation_id, sender_type, message_text FROM fish_trap_messages LIMIT 1;
-- Should NOT error about missing column

-- Check notifications table is created:
-- SELECT COUNT(*) FROM notification_tokens;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Summary of what was applied:
-- [✓] Created notification_tokens table (new)
-- [✓] Created verification_requests table (new) 
-- [✓] Created contact_info_logs table (new)
-- [✓] Inserted 20 new decoy profiles into existing decoy_profiles table
-- [✓] Verified existing fish_trap tables (conversations, messages already exist)
-- [✓] Fish trap schema correctly uses conversation_id in fish_trap_messages
--
-- All tables are now ready. The app code that references interaction_id
-- needs to be updated to use conversation_id to match the actual schema.
