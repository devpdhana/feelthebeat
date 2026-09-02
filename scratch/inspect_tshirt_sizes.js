const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    envVars[key] = val.trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTshirts() {
  const { data, error } = await supabase.from('registrations').select('id, full_name, tshirt_size, race_category');
  if (error) {
    console.error('Error querying registrations:', error);
    return;
  }
  console.log('Total registrations:', data.length);
  console.log('T-Shirt entries:', data.map(r => ({ name: r.full_name, size: r.tshirt_size, cat: r.race_category })));
  
  const map = {};
  data.forEach(r => {
    const raw = (r.tshirt_size || '').trim().toUpperCase();
    if (!raw || raw === 'N/A' || raw === 'NULL' || raw === 'NONE') return;
    map[raw] = (map[raw] || 0) + 1;
  });
  console.log('T-Shirt count aggregation:', map);
}

inspectTshirts();
