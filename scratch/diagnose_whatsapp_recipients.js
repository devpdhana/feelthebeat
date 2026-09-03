const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync('.env', 'utf8');
  supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)?.[1] || '';
  supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)?.[1] || '';
} catch (e) {
  console.error("Error reading .env", e);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function maskPhone(m) {
  if (!m) return '[EMPTY]';
  const str = String(m).trim();
  if (str.length <= 4) return '****';
  return '******' + str.slice(-4);
}

function normalizeMobile(rawNumber) {
  const raw = String(rawNumber || "").trim();
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) {
    return {
      isValid: true,
      raw,
      digits,
      national10: digits,
      withCountryCode: `91${digits}`,
      caseType: '10_DIGIT',
    };
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    const national10 = digits.slice(1);
    return {
      isValid: true,
      raw,
      digits,
      national10,
      withCountryCode: `91${national10}`,
      caseType: '11_DIGIT_0_PREFIX',
    };
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    const national10 = digits.slice(2);
    return {
      isValid: true,
      raw,
      digits,
      national10,
      withCountryCode: digits,
      caseType: '12_DIGIT_91_PREFIX',
    };
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return {
      isValid: true,
      raw,
      digits,
      national10: digits.slice(-10),
      withCountryCode: digits,
      caseType: 'OTHER_INTL_OR_LONG',
    };
  }

  return {
    isValid: false,
    raw,
    digits,
    national10: digits,
    withCountryCode: digits,
    caseType: 'INVALID_LENGTH',
  };
}

async function runAudit() {
  console.log("=== RUNNING WHATSAPP REGISTRATION DIAGNOSTIC AUDIT (READ ONLY) ===");
  
  const { data: records, error } = await supabase
    .from('registrations')
    .select('id, registration_number, full_name, mobile, race_category, order_id, payment_status, payment_amount, whatsapp_sent, whatsapp_status, whatsapp_message_id, whatsapp_error, whatsapp_sent_at, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase query error:", error);
    return;
  }

  console.log(`Total registrations found: ${records.length}`);

  const statusCounts = {};
  const paymentCounts = {};
  const phoneCaseCounts = {};
  const invalidPhones = [];
  const successfulPaid = [];
  const failedOrPending = [];

  records.forEach((r) => {
    paymentCounts[r.payment_status] = (paymentCounts[r.payment_status] || 0) + 1;
    const waStatus = r.whatsapp_status || (r.whatsapp_sent ? 'SENT' : 'NOT_SENT');
    statusCounts[waStatus] = (statusCounts[waStatus] || 0) + 1;

    const norm = normalizeMobile(r.mobile);
    phoneCaseCounts[norm.caseType] = (phoneCaseCounts[norm.caseType] || 0) + 1;

    if (!norm.isValid) {
      invalidPhones.push({
        regNo: r.registration_number,
        rawPhoneLength: (r.mobile || '').length,
        digitsLength: norm.digits.length,
        masked: maskPhone(r.mobile),
        caseType: norm.caseType,
        paymentStatus: r.payment_status,
      });
    }

    const isPaid = (r.payment_status || '').toLowerCase().includes('success') || (r.payment_status || '').toLowerCase().includes('paid');
    
    if (isPaid) {
      const info = {
        regNo: r.registration_number,
        name: r.full_name,
        category: r.race_category,
        orderId: r.order_id,
        maskedPhone: maskPhone(r.mobile),
        rawPhoneLength: (r.mobile || '').length,
        digitsLength: norm.digits.length,
        normCase: norm.caseType,
        recipientSent: maskPhone(norm.withCountryCode),
        waSent: r.whatsapp_sent,
        waStatus: r.whatsapp_status,
        waMsgId: r.whatsapp_message_id ? (r.whatsapp_message_id.slice(0, 12) + '...') : null,
        waError: r.whatsapp_error,
        createdAt: r.created_at,
      };

      if (waStatus === 'SENT' || waStatus === 'DELIVERED') {
        successfulPaid.push(info);
      } else {
        failedOrPending.push(info);
      }
    }
  });

  console.log("\n--- PAYMENT STATUS DISTRIBUTION ---");
  console.log(paymentCounts);

  console.log("\n--- WHATSAPP STATUS DISTRIBUTION (ALL RECORDS) ---");
  console.log(statusCounts);

  console.log("\n--- PHONE FORMAT CASE DISTRIBUTION ---");
  console.log(phoneCaseCounts);

  console.log("\n--- INVALID PHONE NUMBERS ---");
  console.log(invalidPhones);

  console.log(`\n--- PAID RUNNERS SUMMARY: ${successfulPaid.length + failedOrPending.length} Total Paid ---`);
  console.log(`Paid & Marked SENT/DELIVERED: ${successfulPaid.length}`);
  console.log(`Paid & Marked ACCEPTED/PENDING/FAILED/NOT_SENT: ${failedOrPending.length}`);

  console.log("\n--- SAMPLE OF ALL PAID RUNNERS (MASKED) ---");
  [...successfulPaid, ...failedOrPending].slice(0, 30).forEach((item, idx) => {
    console.log(`[#${idx+1}] Reg: ${item.regNo} | Phone: ${item.maskedPhone} (digits: ${item.digitsLength}, ${item.normCase}) | To: ${item.recipientSent} | Status: ${item.waStatus} | GUID: ${item.waMsgId} | Err: ${item.waError || 'none'}`);
  });
}

runAudit().catch(console.error);
