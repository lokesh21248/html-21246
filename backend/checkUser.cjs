const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: './.env'});

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
  const {data, error} = await sb.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  const u = data.users.find(x => x.email === 'ramireddylokeshreddy@gmail.com');
  if (u) {
    console.log('UserFound: true');
    console.log('AppMetadata:', JSON.stringify(u.app_metadata));
    console.log('UserMetadata:', JSON.stringify(u.user_metadata));
    console.log('EmailConfirmed:', !!u.email_confirmed_at);
  } else {
    console.log('UserFound: false');
  }
}
check().catch(console.error);
