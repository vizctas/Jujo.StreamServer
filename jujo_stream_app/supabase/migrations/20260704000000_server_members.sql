-- Phase 7: Multi-user Server Sharing
-- Allows server owners to invite other Supabase users to access their server.
-- Roles: owner (full control), admin (manage clients), viewer (stream only).

-- ─── server_members table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The server being shared (references user_server_profiles by server_url + owner)
  server_url TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The invited user
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role: 'owner', 'admin', 'viewer'
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('owner', 'admin', 'viewer')),

  -- Invite metadata
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  invite_code TEXT,  -- nullable; set only for pending invites

  -- Status: 'pending', 'active', 'revoked'
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'revoked')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One membership per user per server
  UNIQUE(server_url, owner_id, member_id)
);

-- Indexes
CREATE INDEX idx_server_members_member_id ON server_members(member_id);
CREATE INDEX idx_server_members_owner_id ON server_members(owner_id);
CREATE INDEX idx_server_members_invite_code ON server_members(invite_code)
  WHERE invite_code IS NOT NULL AND status = 'pending';

-- ─── RLS Policies ─────────────────────────────────────────────────────────────

ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;

-- Owner can see all memberships for their servers
CREATE POLICY "Owner can read server members"
  ON server_members FOR SELECT
  USING (owner_id = auth.uid());

-- Members can see their own membership
CREATE POLICY "Member can read own membership"
  ON server_members FOR SELECT
  USING (member_id = auth.uid());

-- Owner can insert (invite) members
CREATE POLICY "Owner can invite members"
  ON server_members FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Owner can update (change role, revoke)
CREATE POLICY "Owner can update members"
  ON server_members FOR UPDATE
  USING (owner_id = auth.uid());

-- Members can update their own row (accept invite)
CREATE POLICY "Member can accept invite"
  ON server_members FOR UPDATE
  USING (member_id = auth.uid() AND status = 'pending');

-- Owner can delete memberships
CREATE POLICY "Owner can remove members"
  ON server_members FOR DELETE
  USING (owner_id = auth.uid());

-- Members can leave (delete own membership)
CREATE POLICY "Member can leave server"
  ON server_members FOR DELETE
  USING (member_id = auth.uid());

-- ─── Invite lookup function (bypasses RLS for code-based accept) ──────────────

CREATE OR REPLACE FUNCTION accept_server_invite(p_invite_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_member server_members%ROWTYPE;
BEGIN
  -- Find pending invite by code
  SELECT * INTO v_member
  FROM server_members
  WHERE invite_code = p_invite_code
    AND status = 'pending'
  LIMIT 1;

  IF v_member.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invite code');
  END IF;

  -- Assign to current user (the invite was created without knowing who would accept)
  -- If member_id is already set and doesn't match, reject
  IF v_member.member_id != '00000000-0000-0000-0000-000000000000'::uuid
     AND v_member.member_id != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'This invite is for a different user');
  END IF;

  -- Accept the invite
  UPDATE server_members
  SET member_id = auth.uid(),
      status = 'active',
      accepted_at = now(),
      invite_code = NULL  -- Clear code after use
  WHERE id = v_member.id;

  RETURN json_build_object(
    'success', true,
    'server_url', v_member.server_url,
    'role', v_member.role,
    'owner_id', v_member.owner_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Auto-update updated_at ───────────────────────────────────────────────────

CREATE TRIGGER server_members_updated_at
  BEFORE UPDATE ON server_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Enable Realtime ──────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE server_members;
