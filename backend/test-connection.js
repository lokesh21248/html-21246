'use strict';
require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', process.env.SUPABASE_URL);

  try {
    const { data, error } = await supabaseAdmin
      .from('pg_listings')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Connection successful!');
    console.log(`📊 Found ${data?.[0]?.count || 0} listings in the database.`);
    process.exit(0);
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
    process.exit(1);
  }
}

testConnection();
