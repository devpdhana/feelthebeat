const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)?.[1];
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)?.[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingRPCs() {
  console.log("Checking for existing RPC functions...");
  const potentialFuncs = [
    'get_dashboard_stats',
    'get_admin_stats',
    'get_payment_stats',
    'get_revenue_total',
    'get_total_revenue'
  ];

  for (const fn of potentialFuncs) {
    try {
      const { data, error } = await supabase.rpc(fn);
      console.log(`RPC '${fn}':`, { data, error: error ? error.message : null });
    } catch (e) {
      console.log(`RPC '${fn}' failed:`, e.message);
    }
  }
}

checkExistingRPCs().catch(console.error);
