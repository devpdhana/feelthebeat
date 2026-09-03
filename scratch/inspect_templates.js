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

async function inspectTemplates() {
  const { data: regs } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: true });

  console.log("=== CHECKING TEMPLATE VARIABLES FOR ALL 16 REGISTRATIONS ===");
  const templateId = "1792971";

  regs.forEach((r, idx) => {
    const runnerName = (r.full_name || "Runner").trim();
    const category = (r.race_category || "Race").trim();
    const orderId = (r.order_id || r.registration_number || "FTB26-000000").trim();
    const variables = [runnerName, category, orderId];
    const templateInfoStr = `${templateId}~${variables.join("~")}`;

    const hasTildeInValues = runnerName.includes('~') || category.includes('~') || orderId.includes('~');
    const hasNewlineInValues = runnerName.includes('\n') || category.includes('\n') || orderId.includes('\n');
    const varCount = variables.length;

    console.log(`[#${idx+1}] Reg: ${r.registration_number} | Phone: ${maskPhone(r.mobile)}`);
    console.log(`     Name: "${runnerName}" | Cat: "${category}" | Order: "${orderId}"`);
    console.log(`     templateinfo: "${templateInfoStr}"`);
    console.log(`     Checks: count=${varCount}, hasTilde=${hasTildeInValues}, hasNewline=${hasNewlineInValues}\n`);
  });
}

inspectTemplates().catch(console.error);
