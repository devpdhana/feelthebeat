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

async function fetchAllRows(tableName, selectCols = '*') {
  let allRows = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectCols)
      .order('created_at', { ascending: true })
      .range(from, from + step - 1);
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      break;
    }
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < step) break;
    from += step;
  }
  return allRows;
}

async function audit() {
  // 1. Simulate exact GET query in /api/admin/whatsapp/broadcast
  const { data: defaultLimitQuery } = await supabase
    .from('registrations')
    .select('id, full_name, mobile, race_category, bib_number, payment_status, whatsapp_sent, whatsapp_status');

  console.log('--- SUPABASE DEFAULT QUERY BEHAVIOR ---');
  console.log(`Default unpaginated .select() returned exactly: ${defaultLimitQuery.length} rows`);

  // 2. Fetch ALL registrations with pagination
  const allRegistrations = await fetchAllRows('registrations', '*');
  console.log(`Total actual rows in registrations table: ${allRegistrations.length}`);

  const totalRegistered = allRegistrations.length;
  const paidRecords = allRegistrations.filter(r => {
    const p = (r.payment_status || '').toLowerCase();
    return p.includes('success') || p.includes('paid');
  });

  const unpaidRecords = allRegistrations.filter(r => {
    const p = (r.payment_status || '').toLowerCase();
    return !p.includes('success') && !p.includes('paid');
  });

  const withMobile = allRegistrations.filter(r => r.mobile && String(r.mobile).trim().length > 0);
  const withoutMobile = allRegistrations.filter(r => !r.mobile || String(r.mobile).trim().length === 0);

  let totalValidWhatsApp = 0;
  let totalInvalidWhatsApp = 0;

  paidRecords.forEach(r => {
    if (r.mobile && normalizeMobileNumber(r.mobile).isValid) {
      totalValidWhatsApp++;
    } else {
      totalInvalidWhatsApp++;
    }
  });

  // 3. Inspect the records beyond the first 1000 (Index 1000 onwards)
  const truncatedRecords = allRegistrations.slice(1000);
  console.log(`\nRecords beyond first 1000 cutoff: ${truncatedRecords.length}`);

  const truncatedDetails = truncatedRecords.map((r, i) => {
    const val = normalizeMobileNumber(r.mobile);
    return {
      index: 1001 + i,
      id: r.id,
      registration_number: r.registration_number,
      order_id: r.order_id,
      bib_number: r.bib_number,
      race_category: r.race_category,
      payment_status: r.payment_status,
      mobile_exists: Boolean(r.mobile),
      mobile_valid: val.isValid,
      created_at: r.created_at
    };
  });

  fs.writeFileSync('scratch/truncated_records_details.json', JSON.stringify(truncatedDetails, null, 2));

  console.log('\n========================================');
  console.log('WHATSAPP BROADCAST COUNT AUDIT METRICS');
  console.log('========================================');
  console.log(`Overall runner records: ${totalRegistered}`);
  console.log(`Paid records: ${paidRecords.length}`);
  console.log(`Unpaid records: ${unpaidRecords.length}`);
  console.log(`WhatsApp/mobile numbers available: ${withMobile.length}`);
  console.log(`Records without mobile: ${withoutMobile.length}`);
  console.log(`Valid WhatsApp numbers (among paid): ${totalValidWhatsApp}`);
  console.log(`Invalid / missing (among paid): ${totalInvalidWhatsApp}`);
  console.log(`Currently displayed in broadcast: ${defaultLimitQuery.length}`);
  console.log(`Difference: ${totalRegistered - defaultLimitQuery.length}`);
  console.log('========================================\n');
}

audit();
