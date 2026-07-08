const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      env[key] = val;
    }
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

async function run() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: 'angedahou7@gmail.com',
    options: { redirectTo: 'http://localhost:3000/auth/callback' }
  });
  if (error) {
    console.error('Error generating link:', error);
    process.exit(1);
  }
  const result = {
    action_link: data.properties.action_link,
    email: 'angedahou7@gmail.com'
  };
  fs.writeFileSync('login_link.json', JSON.stringify(result, null, 2));
  console.log('Login link written to login_link.json');
}

run();
