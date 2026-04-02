const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: './backend/.env'});

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fix() {
  const email = 'ramireddylokeshreddy@gmail.com';
  const password = 'Password@123';
  
  const { data: u } = await sb.auth.admin.listUsers();
  const user = u.users.find(x => x.email === email);
  
  if (user) {
    await sb.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
      app_metadata: { role: 'admin' }
    });
    console.log('Password updated successfully to ' + password);
  } else {
    await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
      app_metadata: { role: 'admin' }
    });
    console.log('Created new user with password ' + password);
  }
}
fix().catch(console.error);
