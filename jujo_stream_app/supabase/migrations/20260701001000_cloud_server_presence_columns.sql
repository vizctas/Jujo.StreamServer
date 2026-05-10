-- Cloud auto-pairing/presence fields.
-- `cloud_agent.cpp` writes these through the authenticated user's JWT.

ALTER TABLE user_server_profiles
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ADD COLUMN IF NOT EXISTS external_address TEXT,
  ADD COLUMN IF NOT EXISTS nat_type TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS server_version TEXT,
  ADD COLUMN IF NOT EXISTS is_streaming BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_server_profiles_last_seen
  ON user_server_profiles(user_id, last_seen_at DESC);
