const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)?.[1] || '';
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)?.[1] || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCampaigns() {
  const { data: camps, error: cErr } = await supabase.from('whatsapp_campaigns').select('*');
  console.log("whatsapp_campaigns:", camps || cErr?.message);

  const { data: recips, error: rErr } = await supabase.from('whatsapp_campaign_recipients').select('*');
  console.log("whatsapp_campaign_recipients count:", recips ? recips.length : rErr?.message);
}

checkCampaigns().catch(console.error);
