const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const k = trimmed.substring(0, eqIdx).trim();
    const v = trimmed.substring(eqIdx + 1).trim().replace(/(^["']|["']$)/g, '');
    env[k] = v;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectRegCols() {
  const { data, error } = await supabase.from('registrations').select('*').limit(3);
  if (error) {
    console.error(error);
    return;
  }
  console.log('Available columns in registrations:');
  console.log(Object.keys(data[0]));
  console.log('\nSample Registration 1:');
  console.log(JSON.stringify(data[0], null, 2));

  // Check unique values for payment_status and distribution fields
  const { data: allData } = await supabase.from('registrations').select('payment_status, dav_family_member, dav_family_type, race_category, bib_number');
  
  const paymentStatuses = new Set(allData.map(d => d.payment_status));
  const categories = new Set(allData.map(d => d.race_category));
  const hasBibCount = allData.filter(d => d.bib_number).length;

  console.log('\nUnique payment_status values:', Array.from(paymentStatuses));
  console.log('Unique race_category values:', Array.from(categories));
  console.log(`Total registrations with bib_number: ${hasBibCount} / ${allData.length}`);
}

inspectRegCols();
