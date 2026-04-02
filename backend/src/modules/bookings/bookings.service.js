'use strict';

const { supabaseAdmin } = require('../../config/supabase');
const { AppError } = require('../../middleware/errorHandler');

const TABLE = 'bookings';
const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

/**
 * Real schema: bookings(id, user_id, pg_id, status, created_at, updated_at)
 * FK to pg_listings via pg_id column (use pg_listings!pg_id for explicit join)
 */

function buildBookingPayload(payload = {}) {
  const pg_id = payload.pg_id || payload.listing_id;

  if (!pg_id) {
    throw new AppError('Listing (pg_id) is required', 400);
  }

  return {
    pg_id,
    user_id: payload.user_id,
    status: VALID_STATUSES.includes(payload.status) ? payload.status : 'pending',
  };
}

/**
 * Bookings Service — all Supabase operations for bookings
 */

async function getAllBookings({ page = 1, limit = 20, userId, status } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from(TABLE)
    .select('id, user_id, pg_id, status, check_in, check_out, created_at, updated_at, pg_listings!pg_id(id, name, location)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (userId) query = query.eq('user_id', userId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  // Enrich with profile data separately
  const userIds = [...new Set((data || []).map((b) => b.user_id).filter(Boolean))];
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, phone').in('id', userIds)
    : { data: [] };
  const profileMap = (profiles || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

  const enriched = (data || []).map((b) => ({ ...b, profiles: profileMap[b.user_id] || null }));

  return { bookings: enriched, total: count, page, limit };
}

async function getBookingById(id) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('id, user_id, pg_id, status, check_in, check_out, created_at, updated_at, pg_listings!pg_id(id, name, location)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new AppError('Booking not found', 404);
    throw new AppError(error.message, 500);
  }

  // Fetch profile separately
  if (data.user_id) {
    const { data: profile } = await supabaseAdmin.from('profiles').select('id, full_name, phone').eq('id', data.user_id).single();
    data.profiles = profile || null;
  }

  return data;
}

async function createBooking(payload) {
  const bookingPayload = buildBookingPayload(payload);

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert([bookingPayload])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function updateBookingStatus(id, status) {
  await getBookingById(id);

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function cancelBooking(id, userId, isAdmin) {
  const booking = await getBookingById(id);

  if (!isAdmin && booking.user_id !== userId) {
    throw new AppError('You can only cancel your own bookings', 403);
  }

  if (booking.status === 'completed') {
    throw new AppError('Cannot cancel a completed booking', 400);
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
};
