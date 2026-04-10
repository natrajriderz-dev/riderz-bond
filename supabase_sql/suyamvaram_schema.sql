-- Supabase Schema for Suyamvaram Feature

-- Create suyamvaram_challenges table
CREATE TABLE suyamvaram_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    challenge_type TEXT NOT NULL,
    max_participants INTEGER DEFAULT 50,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    reward TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for suyamvaram_challenges
ALTER TABLE suyamvaram_challenges ENABLE ROW LEVEL SECURITY;

-- Policies for suyamvaram_challenges
CREATE POLICY "Anyone can view active challenges"
    ON suyamvaram_challenges FOR SELECT
    USING (true);

CREATE POLICY "Users can create challenges"
    ON suyamvaram_challenges FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own challenges"
    ON suyamvaram_challenges FOR UPDATE
    USING (auth.uid() = creator_id);


-- Create suyamvaram_applications table
CREATE TABLE suyamvaram_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES suyamvaram_challenges(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, applicant_id)
);

-- Enable RLS for suyamvaram_applications
ALTER TABLE suyamvaram_applications ENABLE ROW LEVEL SECURITY;

-- Policies for suyamvaram_applications
CREATE POLICY "Users can view their own applications or applications to their challenges"
    ON suyamvaram_applications FOR SELECT
    USING (
        auth.uid() = applicant_id 
        OR 
        auth.uid() IN (SELECT creator_id FROM suyamvaram_challenges WHERE id = challenge_id)
    );

CREATE POLICY "Users can apply to challenges"
    ON suyamvaram_applications FOR INSERT
    WITH CHECK (auth.uid() = applicant_id);
