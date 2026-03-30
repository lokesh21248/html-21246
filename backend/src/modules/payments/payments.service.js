'use strict';

const { supabaseAdmin } = require('../../config/supabase');
const { AppError } = require('../../middleware/errorHandler');

const TABLE = 'payments';

/**
 * Payments Service
 */

async function getAllPayments({ page = 1, limit = 20, userId, status } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from(TABLE)
    .select('*, bookings(id, status), profiles(id, full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (userId) query = query.eq('user_id', userId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  return { payments: data, total: count, page, limit };
}

async function getPaymentById(id) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, bookings(id, status), profiles(id, full_name)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new AppError('Payment not found', 404);
    throw new AppError(error.message, 500);
  }
  return data;
}

async function createPayment(payload) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert([{ ...payload, status: 'pending' }])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function updatePaymentStatus(id, status) {
  await getPaymentById(id);

  const VALID_STATUSES = ['pending', 'completed', 'failed', 'refunded'];
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
