'use strict';

const { supabaseAdmin } = require('../../config/supabase');
const { AppError } = require('../../middleware/errorHandler');

const TABLE = 'pg_listings';
const LISTING_FIELDS = [
  'name',
  'location',
  'latitude',
  'longitude',
  'reception_phone',
  'capacity',
  'occupied',
  'room_types',
  'gender',
  'property_type',
  'one_day_stay',
  'has_gym',
  'has_ac',
  'has_non_ac',
  'has_gaming_space',
  'gaming_space_area',
  'has_parking',
  'parking_capacity',
  'status',
  'food_menu',
  'image_url',
];

function normalizeListingStatus(status) {
  return String(status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active';
}

function normalizeRoomTypes(roomTypes) {
  if (!Array.isArray(roomTypes)) return [];

  return roomTypes
    .map((room) => ({
      variant: room?.variant || 'Single',
      price_ac: Number(room?.price_ac) || 0,
      price_non_ac: Number(room?.price_non_ac) || 0,
      available: Number(room?.available) || 0,
    }))
    .filter((room) => room.variant);
}

function normalizeFoodMenu(foodMenu) {
  const source = foodMenu && typeof foodMenu === 'object' ? foodMenu : {};

  return {
    breakfast: Boolean(source.breakfast),
    lunch: Boolean(source.lunch),
    dinner: Boolean(source.dinner),
    menu_details: source.menu_details || '',
  };
}

function buildListingPayload(payload = {}) {
  const sanitized = {};

  LISTING_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      sanitized[field] = payload[field];
    }
  });

  if ('status' in sanitized) {
    sanitized.status = normalizeListingStatus(sanitized.status);
  }

  if ('capacity' in sanitized) sanitized.capacity = Number(sanitized.capacity) || 0;
  if ('occupied' in sanitized) sanitized.occupied = Number(sanitized.occupied) || 0;
  if ('latitude' in sanitized) sanitized.latitude = Number(sanitized.latitude) || 0;
  if ('longitude' in sanitized) sanitized.longitude = Number(sanitized.longitude) || 0;
  if ('gaming_space_area' in sanitized) sanitized.gaming_space_area = Number(sanitized.gaming_space_area) || 0;
  if ('parking_capacity' in sanitized) sanitized.parking_capacity = Number(sanitized.parking_capacity) || 0;
  if ('room_types' in sanitized) sanitized.room_types = normalizeRoomTypes(sanitized.room_types);
  if ('food_menu' in sanitized) sanitized.food_menu = normalizeFoodMenu(sanitized.food_menu);
  if ('image_url' in sanitized && !sanitized.image_url) sanitized.image_url = null;

  return sanitized;
}

/**
 * Listings Service — all Supabase operations for pg_listings
 */

async function getAllListings({ page = 1, limit = 20, search, status } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from(TABLE)
    .select(
      'id, name, location, latitude, longitude, reception_phone, capacity, occupied, room_types, gender, property_type, one_day_stay, has_gym, has_ac, has_non_ac, has_gaming_space, gaming_space_area, has_parking, parking_capacity, status, food_menu, image_url, created_at, updated_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', normalizeListingStatus(status));
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
  const listingPayload = buildListingPayload(payload);

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert([listingPayload])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function updateListing(id, payload) {
  // Confirm exists first
  await getListingById(id);

  const listingPayload = buildListingPayload(payload);

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ ...listingPayload, updated_at: new Date().toISOString() })
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

async function uploadImage(base64Data, filename, contentType = 'image/jpeg') {
  if (!base64Data) throw new AppError('No image data provided', 400);

  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let buffer;
  let type = contentType;

  if (matches && matches.length === 3) {
    type = matches[1];
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(base64Data, 'base64');
  }

  // Generate unique filename to avoid overwrites
  const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

  const { data, error } = await supabaseAdmin.storage
    .from('pg-images')
    .upload(uniqueFilename, buffer, {
      contentType: type,
      upsert: false
    });

  if (error) throw new AppError(error.message, 500);

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('pg-images')
    .getPublicUrl(uniqueFilename);

  return { url: publicUrlData.publicUrl };
}

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  uploadImage,
};
