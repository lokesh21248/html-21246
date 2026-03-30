'use strict';

const { supabaseAdmin } = require('../../config/supabase');
const { AppError } = require('../../middleware/errorHandler');

const TABLE = 'profiles';

/**
 * Users Service — operations on user profiles table
 * Note: Auth user creation/deletion is managed by Supabase Auth directly.
 */

async function getAllUsers({ page = 1, limit = 20, search } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from(TABLE)
    .select('id, full_name, phone, email, avatar_url, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  return { users: data, total: count, page, limit };
}

async function getUserById(id) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new AppError('User not found', 404);
    throw new AppError(error.message, 500);
  }
  return data;
}

async function updateUser(id, payload) {
  await getUserById(id);

  // Prevent overwriting id
  delete payload.id;

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function getUserStats(id) {
  const [bookingsResult, paymentsResult] = await Promise.all([
    supabaseAdmin
      .from('bookings')
      .select('id, status', { count: 'exact' })
      .eq('user_id', id),
    supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('user_id', id)
      .eq('status', 'completed'),
  ]);

  if (bookingsResult.error) throw new AppError(bookingsResult.error.message, 500);
  if (paymentsResult.error) throw new AppError(paymentsResult.error.message, 500);

  const totalSpent = (paymentsResult.data || []).reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0), 0
  );

  return {
    totalBookings: bookingsResult.count,
    totalSpent,
  };
}

module.exports = { getAllUsers, getUserById, updateUser, getUserStats };
