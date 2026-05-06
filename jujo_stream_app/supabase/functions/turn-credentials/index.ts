// supabase/functions/turn-credentials/index.ts
//
// Generates short-lived TURN credentials for WebRTC relay connections.
// Uses HMAC-based credential generation (RFC 5766 / coturn compatible).
//
// Environment variables (set in Supabase Dashboard → Edge Functions → Secrets):
//   TURN_SECRET    - Shared secret configured on the TURN server (coturn static-auth-secret)
//   TURN_URLS      - Comma-separated TURN server URLs (e.g. "turn:relay.jujo.stream:3478,turns:relay.jujo.stream:5349")
//   TURN_TTL       - Credential TTL in seconds (default: 86400 = 24h)
//
// Request: POST with valid Supabase JWT in Authorization header
// Response: { urls: string[], username: string, credential: string, ttl: number }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify JWT — reject unauthenticated requests
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load TURN configuration from secrets
    const turnSecret = Deno.env.get("TURN_SECRET");
    if (!turnSecret) {
      return new Response(
        JSON.stringify({ error: "TURN not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const turnUrls = (Deno.env.get("TURN_URLS") ?? "turn:relay.jujo.stream:3478")
      .split(",")
      .map((u: string) => u.trim())
      .filter((u: string) => u.length > 0);

    const ttl = parseInt(Deno.env.get("TURN_TTL") ?? "86400", 10);

    // Generate time-limited credentials (coturn static-auth-secret compatible)
    // Username format: <expiry_timestamp>:<user_id>
    // Credential: HMAC-SHA1(secret, username) base64-encoded
    const expiry = Math.floor(Date.now() / 1000) + ttl;
    const username = `${expiry}:${user.id}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(turnSecret),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(username));
    const credential = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return new Response(
      JSON.stringify({
        urls: turnUrls,
        username,
        credential,
        ttl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
