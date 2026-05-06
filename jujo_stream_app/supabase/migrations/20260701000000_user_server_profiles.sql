-- Phase 2: Cloud Server Profile Sync
-- Stores user's registered server profiles for cross-device sync.
-- Tokens are NEVER stored here — only metadata.

CREATE TABLE IF NOT EXISTS user_server_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Server identity
  server_url TEXT NOT NULL,
  server_name TEXT,
  username TEXT,

  -- Connectivity hints (for discovery without direct connection)
  local_addresses JSONB DEFAULT '[]'::jsonb,
  cert_fingerprint TEXT,

  -- User preferences for this server
  is_default BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,

  -- Timestamps
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate server URLs per user
  UNIQUE(user_id, server_url)
);

-- Index for fast lookup by user
CREATE INDEX idx_user_server_profiles_user_id
  ON user_server_profiles(user_id);

-- RLS: users can only access their own profiles
ALTER TABLE user_server_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own server profiles"
  ON user_server_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own server profiles"
  ON user_server_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own server profiles"
  ON user_server_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own server profiles"
  ON user_server_profiles FOR DELETE
  USING (user_id = auth.uid());

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_server_profiles_updated_at
  BEFORE UPDATE ON user_server_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
