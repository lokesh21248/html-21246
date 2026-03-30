'use strict';

const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

/**
 * Supabase Admin Client (Service Role Key)
 * ⚠️  NEVER expose this client or its key to the frontend.
 * Use this ONLY on the server for admin operations that bypass RLS.
 */
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Supabase Public Client (Anon Key)
 * Used for verifying user JWTs via getUser()
 */
const supabasePublic = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Verify a Supabase JWT token and return the user object.
 * @param {string} token - Bearer token from Authorization header
 * @returns {Promise<{ user: object | null, error: object | null }>}
 */
async function verifySupabaseJWT(token) {
  const { data, error } = await supabasePublic.auth.getUser(token);
  return { user: data?.user ?? null, error };
}

module.exports = { supabaseAdmin, supabasePublic, verifySupabaseJWT };
