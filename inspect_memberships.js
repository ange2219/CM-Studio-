const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parser for .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars:', { supabaseUrl, supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error: errUser } = await supabase.from('users').select('*');
  if (errUser) {
    console.error('Error fetching users:', errUser);
    return;
  }
  console.log('Users:');
  console.log(users.map(u => ({ id: u.id, full_name: u.full_name, email: u.email })));

  const { data: orgs, error: errOrgs } = await supabase.from('organizations').select('*');
  console.log('Orgs:');
  console.log(orgs);

  const { data: memberships, error: errMem } = await supabase.from('memberships').select('*');
  console.log('Memberships:');
  console.log(memberships);
}

run();
