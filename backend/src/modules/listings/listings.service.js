'use strict';

const { supabaseAdmin } = require('../../config/supabase');
const { AppError } = require('../../middleware/errorHandler');

const TABLE = 'pg_listings';

/**
 * Listings Service — all Supabase operations for pg_listings
 */

async function getAllListings({ page = 1, limit = 20, search, status } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from(TABLE)
    .select(
      'id, name, location, latitude, longitude, reception_phone, capacity, occupied, gender, property_type, one_day_stay, has_gym, has_ac, has_non_ac, has_gaming_space, gaming_space_area, has_parking, parking_capacity, status, image_url, created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  return { listings: data, total: count, page, limit };
}

async function getListingById(id) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, pg_images(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new AppError('Listing not found', 404);
    throw new AppError(error.message, 500);
  }

  return data;
}

async function createListing(payload) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function updateListing(id, payload) {
  // Confirm exists first
  await getListingById(id);

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function deleteListing(id) {
  await getListingById(id); // Throws 404 if not found

  const { error } = await supabaseAdmin
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw new AppError(error.message, 500);
  return { id, deleted: true };
}

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
