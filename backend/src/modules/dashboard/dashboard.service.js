'use strict';

const { supabaseAdmin } = require('../../config/supabase');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Dashboard Service — aggregated stats for admin panel
 */

async function getStats() {
  const [listingsRes, bookingsRes, usersRes, paymentsRes] = await Promise.all([
    supabaseAdmin.from('pg_listings').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('bookings').select('id, status', { count: 'exact' }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('payments').select('amount, status').eq('status', 'completed'),
  ]);

  if (listingsRes.error) throw new AppError(listingsRes.error.message, 500);
  if (bookingsRes.error) throw new AppError(bookingsRes.error.message, 500);
  if (usersRes.error) throw new AppError(usersRes.error.message, 500);
  if (paymentsRes.error) throw new AppError(paymentsRes.error.message, 500);

  const totalRevenue = (paymentsRes.data || []).reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0), 0
  );

  const bookingStatusCounts = (bookingsRes.data || []).reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalListings: listingsRes.count,
    totalBookings: bookingsRes.count,
    totalUsers: usersRes.count,
    totalRevenue,
    bookingsByStatus: bookingStatusCounts,
  };
}

async function getRecentBookings(limit = 10) {
  // Fetch bookings with listing info — use explicit FK hint (bookings.pg_id -> pg_listings)
  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('id, user_id, pg_id, status, created_at, pg_listings!pg_id(name, location)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new AppError(error.message, 500);

  if (!bookings || bookings.length === 0) return [];

  // Fetch user profiles separately
  const userIds = [...new Set(bookings.map((b) => b.user_id).filter(Boolean))];
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, phone').in('id', userIds)
    : { data: [] };

  const profileMap = (profiles || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

  return bookings.map((b) => ({
    ...b,
    profiles: profileMap[b.user_id] || null,
  }));
}

async function getRevenueBreakdown() {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('amount, status, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  if (error) throw new AppError(error.message, 500);

  // Group by month for chart data
  const monthly = data.reduce((acc, p) => {
    const month = p.created_at.slice(0, 7);
    acc[month] = (acc[month] || 0) + (parseFloat(p.amount) || 0);
    return acc;
  }, {});

  return Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }));
}

module.exports = { getStats, getRecentBookings, getRevenueBreakdown };
