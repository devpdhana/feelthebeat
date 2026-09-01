const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)[1];
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking Supabase tables...");
  const tables = ['categories', 'prices', 'race_categories', 'pricing_config', 'settings'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(5);
    if (!error) {
      console.log(`Table '${t}' exists:`, data);
    } else {
      console.log(`Table '${t}' does not exist (${error.message})`);
    }
  }

  // Check existing payments and registrations records
  const { data: regData } = await supabase.from('registrations').select('id, registration_number, race_category, payment_amount').limit(5);
  console.log("Sample registrations:", regData);

  const { data: payData } = await supabase.from('payments').select('id, razorpay_order_id, amount, status').limit(5);
  console.log("Sample payments:", payData);
}

check().catch(console.error);
