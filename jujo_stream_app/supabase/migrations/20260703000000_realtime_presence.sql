-- Phase 6: Realtime Server Presence
-- Adds last_seen_at for heartbeat tracking and is_online computed column.
-- Flutter subscribes to Realtime changes on this table for live presence.

-- Add last_seen_at column (updated by cloud agent heartbeat)
ALTER TABLE user_server_profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Add server_version for display in server switcher
ALTER TABLE user_server_profiles
  ADD COLUMN IF NOT EXISTS server_version TEXT;

-- Add is_streaming flag (updated by heartbeat when sessions are active)
ALTER TABLE user_server_profiles
  ADD COLUMN IF NOT EXISTS is_streaming BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_server_profiles.last_seen_at IS
  'Last heartbeat timestamp from the server cloud agent. Null = never seen online.';

COMMENT ON COLUMN user_server_profiles.server_version IS
  'Server software version reported during heartbeat (e.g. "2025.1.0").';

COMMENT ON COLUMN user_server_profiles.is_streaming IS
  'True if the server has active streaming sessions (updated by heartbeat).';

-- Function to check if a server is considered online (seen within last 2 minutes)
-- Used by clients as a helper; the real source of truth is last_seen_at.
CREATE OR REPLACE FUNCTION is_server_online(last_seen TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN last_seen IS NOT NULL AND last_seen > (now() - INTERVAL '2 minutes');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enable Realtime on this table (required for Supabase Realtime subscriptions)
-- Note: This must also be enabled in the Supabase Dashboard under Database > Replication
ALTER PUBLICATION supabase_realtime ADD TABLE user_server_profiles;
