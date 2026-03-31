'use strict';

const { supabaseAdmin } = require('../../config/supabase');
const { AppError } = require('../../middleware/errorHandler');

const TABLE = 'payments';
const VALID_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

function buildPaymentPayload(payload = {}) {
  const paymentPayload = {
    booking_id: payload.booking_id,
    user_id: payload.user_id,
    amount: Number(payload.amount) || 0,
    status: VALID_STATUSES.includes(payload.status) ? payload.status : 'pending',
  };

  if (!paymentPayload.booking_id) {
    throw new AppError('Booking is required', 400);
  }

  if (paymentPayload.amount <= 0) {
    throw new AppError('Amount must be greater than zero', 400);
  }

  return paymentPayload;
}

/**
 * Payments Service
 */

async function getAllPayments({ page = 1, limit = 20, userId, status } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from(TABLE)
    .select('*, bookings(id, status)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (userId) query = query.eq('user_id', userId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  // Fetch profiles separately
  const userIds = [...new Set((data || []).map((p) => p.user_id).filter(Boolean))];
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name').in('id', userIds)
    : { data: [] };
  const profileMap = (profiles || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

  const enriched = (data || []).map((p) => ({ ...p, profiles: profileMap[p.user_id] || null }));

  return { payments: enriched, total: count, page, limit };
}

async function getPaymentById(id) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, bookings(id, status)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new AppError('Payment not found', 404);
    throw new AppError(error.message, 500);
  }
  return data;
}

async function createPayment(payload) {
  const paymentPayload = buildPaymentPayload(payload);

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert([paymentPayload])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function updatePaymentStatus(id, status) {
  await getPaymentById(id);

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

async function getRevenueStats() {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('amount, status, created_at')
    .eq('status', 'completed');

  if (error) throw new AppError(error.message, 500);

  const totalRevenue = data.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  // Group by month
  const byMonth = data.reduce((acc, p) => {
    const month = p.created_at.slice(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + (parseFloat(p.amount) || 0);
    return acc;
  }, {});

  return {
    totalRevenue,
    byMonth: Object.entries(byMonth)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  };
}

module.exports = { getAllPayments, getPaymentById, createPayment, updatePaymentStatus, getRevenueStats };
