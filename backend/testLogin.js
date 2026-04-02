const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: './.env'});

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function test() {
  const {data, error} = await sb.auth.signInWithPassword({
    email: 'ramireddylokeshreddy@gmail.com', 
    password: 'Password@123'
  });
  console.log('ErrorMessage:', error ? error.message : 'No error');
}
test().catch(console.error);
