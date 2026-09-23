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

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function normalizeMobileNumber(rawNumber) {
  const raw = String(rawNumber || "").trim();
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) {
    const isValidIndian = /^[6-9]\d{9}$/.test(digits);
    return {
      isValid: isValidIndian,
      formattedWithCountryCode: isValidIndian ? `91${digits}` : digits,
      rawDigits: digits,
    };
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    const coreNumber = digits.substring(2);
    const isValidIndian = /^[6-9]\d{9}$/.test(coreNumber);
    return {
      isValid: isValidIndian,
      formattedWithCountryCode: digits,
      rawDigits: coreNumber,
    };
  }

  if (digits.length > 10 && digits.length <= 15) {
    return {
      isValid: true,
      formattedWithCountryCode: digits,
      rawDigits: digits,
    };
  }

  return {
    isValid: false,
    formattedWithCountryCode: digits,
    rawDigits: digits,
  };
}

async function fetchAllBroadcastRegistrations(selectCols = "*") {
  const allRows = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select(selectCols)
      .order("created_at", { ascending: true })
      .range(from, from + step - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allRows.push(...data);

    if (data.length < step) {
      break;
    }

    from += step;
  }

  return allRows;
}

async function testFix() {
  console.log('Testing GET broadcast retrieval logic...');
  const allRegs = await fetchAllBroadcastRegistrations(
    "id, full_name, mobile, race_category, bib_number, payment_status, whatsapp_sent, whatsapp_status"
  );

  const paidRegs = allRegs.filter((r) => {
    const p = (r.payment_status || "").toLowerCase();
    return p.includes("success") || p.includes("paid");
  });

  let validNumbers = 0;
  let invalidNumbers = 0;

  paidRegs.forEach((r) => {
    if (r.mobile && normalizeMobileNumber(r.mobile).isValid) {
      validNumbers++;
    } else {
      invalidNumbers++;
    }
  });

  console.log('\n=== GET BROADCAST STATS RESULTS ===');
  console.log('Total Registrations Retrieved:', allRegs.length);
  console.log('Total Paid Registrations (TOTAL REGISTERED):', paidRegs.length);
  console.log('Valid WhatsApp Numbers:', validNumbers);
  console.log('Invalid / Missing Numbers:', invalidNumbers);

  console.log('\nTesting POST recipient query logic...');
  const postRegs = await fetchAllBroadcastRegistrations(
    "id, full_name, mobile, race_category, bib_number, payment_status"
  );

  const eligibleRecipients = postRegs.filter((r) => {
    const isPaid = (r.payment_status || "").toLowerCase().includes("success") || (r.payment_status || "").toLowerCase().includes("paid");
    return isPaid && r.full_name && r.mobile && r.race_category;
  });

  console.log('\n=== POST RECIPIENTS PREVIEW RESULTS ===');
  console.log('Total Eligible Recipients for Broadcast Dispatch:', eligibleRecipients.length);
  console.log('Recipient #1 ID:', eligibleRecipients[0]?.id, '| Name:', eligibleRecipients[0]?.full_name);
  console.log(`Recipient #${eligibleRecipients.length} ID:`, eligibleRecipients[eligibleRecipients.length - 1]?.id, '| Name:', eligibleRecipients[eligibleRecipients.length - 1]?.full_name);

  console.log('\nVerification Check:');
  console.log('1. Are all records (>1000) retrieved? ->', eligibleRecipients.length > 1000 ? '✅ YES' : '❌ NO');
  console.log('2. Does total paid match total valid recipients? ->', paidRegs.length === validNumbers ? '✅ YES' : '❌ NO');
  console.log('3. Was any real WhatsApp message sent? -> ✅ NO (DRY RUN / DATA READ-ONLY TEST)');
}

testFix();
