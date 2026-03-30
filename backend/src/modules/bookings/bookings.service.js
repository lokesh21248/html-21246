'use strict';

const { supabaseAdmin } = require('../../config/supabase');
const { AppError } = require('../../middleware/errorHandler');

const TABLE = 'bookings';

/**
 * Bookings Service — all Supabase operations for bookings
 */

async function getAllBookings({ page = 1, limit = 20, userId, status } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from(TABLE)
    .select('*, pg_listings(id, name, address), profiles(id, full_name, phone)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (userId) query = query.eq('user_id', userId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  return { bookings: data, total: count, page, limit };
}

async function getBookingById(id) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, pg_listings(id, name, address), profiles(id, full_name, phone)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new AppError('Booking not found', 404);
    throw new AppError(error.message, 500);
  }
  return data;
}

async function createBooking(payload) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert([{ ...payload, status: 'pending' }])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function updateBookingStatus(id, status) {
  await getBookingById(id);

  const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
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
