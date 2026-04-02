'use strict';
require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function createBucket() {
  console.log('📦 Attempting to create pg-images bucket...');
  
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) throw listError;

    const exists = buckets.find(b => b.name === 'pg-images');
    if (exists) {
      console.log('✅ Bucket "pg-images" already exists.');
      return process.exit(0);
    }

    const { data, error } = await supabaseAdmin.storage.createBucket('pg-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB limit
    });

    if (error) {
      console.error('❌ Failed to create bucket:', error.message);
      process.exit(1);
    }

    console.log('✅ Bucket "pg-images" successfully created:', data);
    process.exit(0);
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
    process.exit(1);
  }
}

createBucket();
