'use strict';

/**
 * Validates required environment variables on startup.
 * Throws immediately if any required variable is missing.
 */

const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const DEFAULT_ALLOWED_ORIGINS = [
  'https://html-21246.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

function normalizeOrigin(origin = '') {
  return origin.trim().replace(/\/$/, '').toLowerCase();
}

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}\n` +
    `Make sure you have a .env file. See .env.example for reference.`
  );
}

const config = Object.freeze({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  allowedOrigins: Array.from(
    new Set([
      ...DEFAULT_ALLOWED_ORIGINS.map((origin) => normalizeOrigin(origin)),
      ...(process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean),
    ])
  ),
  rateLimit: {
    windowMs: 60 * 1000,  // 1 minute
    max: 100,             // 100 requests per window
  },
});

module.exports = { ...config, normalizeOrigin };
