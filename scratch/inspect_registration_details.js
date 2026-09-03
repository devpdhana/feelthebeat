const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)?.[1] || '';
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)?.[1] || '';

const supabase = createClient(supabaseUrl, supabaseKey);

function maskPhone(m) {
  if (!m) return '[EMPTY]';
  const str = String(m).trim();
  if (str.length <= 4) return '****';
  return '******' + str.slice(-4);
}

async function inspect() {
  const { data: regs } = await supabase
    .from('registrations')
    .select('id, registration_number, order_id, full_name, mobile, race_category, payment_status, payment_amount, whatsapp_sent, whatsapp_status, whatsapp_message_id, whatsapp_error, whatsapp_sent_at, created_at')
    .order('created_at', { ascending: true });

  console.log("=== ALL 16 REGISTRATIONS (FULL AUDIT) ===");
  regs.forEach((r, idx) => {
    console.log(`[#${idx+1}] Reg: ${r.registration_number} | ID: ${r.id}`);
    console.log(`     Name: ${r.full_name} | Phone: ${maskPhone(r.mobile)} | Cat: ${r.race_category} | Order: ${r.order_id}`);
    console.log(`     Created: ${r.created_at}`);
    console.log(`     WhatsApp SentAt: ${r.whatsapp_sent_at}`);
    console.log(`     WhatsApp Status: ${r.whatsapp_status} (sent=${r.whatsapp_sent})`);
    console.log(`     WhatsApp GUID: ${r.whatsapp_message_id}`);
    console.log(`     WhatsApp Err: ${r.whatsapp_error || 'none'}\n`);
  });
}

inspect().catch(console.error);
