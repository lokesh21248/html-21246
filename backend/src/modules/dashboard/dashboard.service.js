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
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*, pg_listings(name, address), profiles(full_name, phone)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new AppError(error.message, 500);
  return data;
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
