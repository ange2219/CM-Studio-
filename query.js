const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
supabase.from('notifications').select('id, type, action_url, title, message').order('created_at', { ascending: false }).limit(20).then(res => {
  console.log(JSON.stringify(res.data, null, 2));
});
