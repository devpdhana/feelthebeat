const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkIntegrity() {
  const { count: regCount, error: regErr } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true });

  const { count: payCount, error: payErr } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true });

  console.log(`Live Supabase Count:`);
  console.log(`- Total Registrations: ${regCount}`);
  console.log(`- Total Payments: ${payCount}`);

  // Breakdown by race category
  const { data: catData, error: catErr } = await supabase
    .from('registrations')
    .select('race_category');

  const catBreakdown = {};
  catData.forEach(r => {
    catBreakdown[r.race_category] = (catBreakdown[r.race_category] || 0) + 1;
  });

  console.log('\nCategory Breakdown in DB:');
  console.log(catBreakdown);
}

checkIntegrity();
