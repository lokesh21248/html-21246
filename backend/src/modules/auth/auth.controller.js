'use strict';

const { supabasePublic } = require('../../config/supabase');
const { AppError } = require('../../middleware/errorHandler');
const { sendSuccess } = require('../../utils/apiResponse');

async function login(req, res) {
  const email = req.body?.email?.trim();
  const password = req.body?.password;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const { data, error } = await supabasePublic.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.session?.access_token || !data.user) {
    console.error('SUPABASE LOGIN ERROR:', {
      message: error?.message,
      status: error?.status,
      email: email
    });
    throw new AppError('Invalid email or password', 401);
  }

  if (data.user.app_metadata?.role !== 'admin') {
    throw new AppError('Access denied: Admin role required', 403);
  }

  sendSuccess(res, {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token || null,
    user: {
      id: data.user.id,
      email: data.user.email,
      app_metadata: data.user.app_metadata || {},
      user_metadata: data.user.user_metadata || {},
    },
  });
}

module.exports = { login };
