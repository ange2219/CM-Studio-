const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jynroxrkinjphjuavoux.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bnJveHJraW5qcGhqdWF2b3V4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYzMjYwNSwiZXhwIjoyMDkwMjA4NjA1fQ.Me-PPxFgXM0C6TSiomv06d8L1h7qPlZQpx4BEOGN9IM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function makeAllUsersFree() {
  console.log('Fetching users...')
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, email, plan')

  if (fetchError) {
    console.error('Error fetching users:', fetchError)
    return
  }

  console.log(`Found ${users.length} users:`)
  console.log(users)

  console.log("Updating all users to 'free' plan...")
  const { data, error: updateError } = await supabase
    .from('users')
    .update({ plan: 'free' })
    .neq('plan', 'free') // only update those that are not already free
    .select()

  if (updateError) {
    console.error('Error updating users:', updateError)
    return
  }

  console.log('Successfully updated users:', data)
}

makeAllUsersFree()
