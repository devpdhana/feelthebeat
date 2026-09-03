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

// Exact logic from updated lib/whatsapp.ts
function normalizeMobileNumber(rawNumber) {
  const raw = String(rawNumber || "").trim();
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) {
    const isValidIndian = /^[6-9]\d{9}$/.test(digits);
    return {
      isValid: isValidIndian,
      national10: digits,
      e164: `+91${digits}`,
      withCountryCode: `91${digits}`,
      cleanDigits: digits,
    };
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    const national10 = digits.slice(1);
    const isValidIndian = /^[6-9]\d{9}$/.test(national10);
    return {
      isValid: isValidIndian,
      national10,
      e164: `+91${national10}`,
      withCountryCode: `91${national10}`,
      cleanDigits: national10,
    };
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    const national10 = digits.slice(2);
    const isValidIndian = /^[6-9]\d{9}$/.test(national10);
    return {
      isValid: isValidIndian,
      national10,
      e164: `+${digits}`,
      withCountryCode: digits,
      cleanDigits: national10,
    };
  }

  if (digits.length === 13 && digits.startsWith("910")) {
    const national10 = digits.slice(3);
    const isValidIndian = /^[6-9]\d{9}$/.test(national10);
    return {
      isValid: isValidIndian,
      national10,
      e164: `+91${national10}`,
      withCountryCode: `91${national10}`,
      cleanDigits: national10,
    };
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return {
      isValid: true,
      national10: digits.slice(-10),
      e164: `+${digits}`,
      withCountryCode: digits,
      cleanDigits: digits,
    };
  }

  return {
    isValid: false,
    national10: digits.slice(-10),
    e164: `+${digits}`,
    withCountryCode: digits,
    cleanDigits: digits,
  };
}

async function validateEligibleRunners() {
  const { data: regs, error } = await supabase
    .from('registrations')
    .select('id, registration_number, full_name, mobile, race_category, order_id, payment_status, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching registrations:", error);
    return;
  }

  console.log("=== PRE-SEND VALIDATION AUDIT (READ ONLY) ===");
  console.log(`Auditing all ${regs.length} registrations:\n`);

  let validCount = 0;
  let invalidCount = 0;
  let missingCount = 0;

  regs.forEach((r, idx) => {
    const isPaid = (r.payment_status || "").toLowerCase().includes("success") || (r.payment_status || "").toLowerCase().includes("paid");
    if (!r.mobile || r.mobile.trim() === "") {
      missingCount++;
      console.log(`[#${idx+1}] Runner: ${r.registration_number} | Name: ${r.full_name}`);
      console.log(`     Mobile: [MISSING] | Status: MISSING | Action: CANNOT SEND\n`);
      return;
    }

    const norm = normalizeMobileNumber(r.mobile);
    let classification = "INVALID";
    let action = "HOLD";

    if (norm.isValid) {
      classification = "VALID";
      action = "READY";
      validCount++;
    } else {
      invalidCount++;
    }

    console.log(`[#${idx+1}] Runner registration: ${r.registration_number}`);
    console.log(`     Name: ${r.full_name} | Category: ${r.race_category}`);
    console.log(`     Mobile: ${maskPhone(r.mobile)}`);
    console.log(`     Status: ${classification}`);
    console.log(`     Normalized recipient: ${maskPhone(norm.withCountryCode)}`);
    console.log(`     Action: ${action}\n`);
  });

  console.log(`SUMMARY: Total=${regs.length}, Valid=${validCount}, Invalid=${invalidCount}, Missing=${missingCount}`);
}

validateEligibleRunners().catch(console.error);
