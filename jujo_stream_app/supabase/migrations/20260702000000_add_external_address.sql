-- Phase 3: Add external_address for WAN/remote access support.
-- Stores the server's public IP:port for direct remote connections.

ALTER TABLE user_server_profiles
  ADD COLUMN IF NOT EXISTS external_address TEXT;

-- Optional: NAT type hint for client connection strategy selection.
-- Values: 'full_cone', 'restricted', 'port_restricted', 'symmetric', 'unknown'
ALTER TABLE user_server_profiles
  ADD COLUMN IF NOT EXISTS nat_type TEXT DEFAULT 'unknown';

COMMENT ON COLUMN user_server_profiles.external_address IS
  'Public IP:port for direct WAN access (e.g. 73.42.15.200:47990). Null if unknown or behind symmetric NAT.';

COMMENT ON COLUMN user_server_profiles.nat_type IS
  'NAT type detected by server. Helps client decide connection strategy.';
