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

const key_id = env.NEXT_PUBLIC_RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID;
const key_secret = env.RAZORPAY_KEY_SECRET;
const auth = Buffer.from(key_id + ':' + key_secret).toString('base64');

async function fetchAllRows(tableName, selectCols = '*') {
  let allRows = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectCols)
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

async function fetchRazorpayOrderPayments(orderId) {
  try {
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
      headers: { Authorization: `Basic ${auth}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (e) {
    return [];
  }
}

async function main() {
  console.log('Fetching live database records...');
  const allPayments = await fetchAllRows('payments', '*');
  const allRegs = await fetchAllRows('registrations', 'id, razorpay_order_id, email, mobile, full_name, registration_number, order_id, bib_number, created_at, race_category, payment_amount');

  console.log(`Total rows in payments table: ${allPayments.length}`);
  console.log(`Total rows in registrations table: ${allRegs.length}`);

  const regOrderIds = new Set(allRegs.map(r => r.razorpay_order_id).filter(Boolean));
  const regIds = new Set(allRegs.map(r => r.id).filter(Boolean));

  const registeredPhones = new Map();
  const registeredEmails = new Map();

  allRegs.forEach(r => {
    const p = String(r.mobile || '').replace(/\D/g, '').slice(-10);
    const e = String(r.email || '').toLowerCase().trim();
    if (p) registeredPhones.set(p, r);
    if (e) registeredEmails.set(e, r);
  });

  const unlinkedPayments = allPayments.filter(p => {
    const hasReg = (p.razorpay_order_id && regOrderIds.has(p.razorpay_order_id)) || (p.registration_id && regIds.has(p.registration_id));
    return !hasReg;
  });

  console.log(`Unlinked payment attempts: ${unlinkedPayments.length}`);
  console.log('Checking Razorpay status for all unlinked orders...');

  const trulyPaidMissing = [];

  for (let i = 0; i < unlinkedPayments.length; i++) {
    const p = unlinkedPayments[i];
    if (!p.razorpay_order_id) continue;

    const payments = await fetchRazorpayOrderPayments(p.razorpay_order_id);
    const captured = payments.find(pay => pay.status === 'captured' || pay.status === 'paid');

    if (captured) {
      trulyPaidMissing.push({
        payment_db_id: p.id,
        db_status: p.status,
        db_amount: p.amount,
        db_created_at: p.created_at,
        razorpay_order_id: p.razorpay_order_id,
        razorpay_payment_id: captured.id,
        captured_amount: captured.amount / 100,
        currency: captured.currency,
        method: captured.method,
        email: captured.email,
        contact: captured.contact,
        notes: captured.notes,
        captured_at: new Date(captured.created_at * 1000).toISOString(),
        vpa_or_bank: captured.vpa || captured.wallet || captured.bank || (captured.card ? captured.card.network + ' ' + (captured.card.last4 || '') : '')
      });
    }

    if ((i + 1) % 100 === 0 || i === unlinkedPayments.length - 1) {
      process.stdout.write(`Checked ${i + 1}/${unlinkedPayments.length} orders... Found ${trulyPaidMissing.length} captured payments\n`);
    }
  }

  trulyPaidMissing.sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at));

  const groupA_zeroReg = [];
  const groupB_doublePaid = [];

  trulyPaidMissing.forEach(m => {
    const cleanPhone = String(m.contact || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = String(m.email || '').toLowerCase().trim();

    const match = registeredPhones.get(cleanPhone) || registeredEmails.get(cleanEmail);

    if (match) {
      groupB_doublePaid.push({
        orphan_payment: m,
        registered_record: match
      });
    } else {
      groupA_zeroReg.push(m);
    }
  });

  const totalPaymentsCount = allPayments.length;
  const totalRegistrationsCount = allRegs.length;
  const totalUnlinkedCaptured = trulyPaidMissing.length;
  const zeroRegCount = groupA_zeroReg.length;
  const doublePaidCount = groupB_doublePaid.length;

  const summary = {
    totalPaymentsInDb: totalPaymentsCount,
    totalRegistrationsInDb: totalRegistrationsCount,
    unlinkedPaymentAttempts: unlinkedPayments.length,
    totalCapturedMissingFromRegs: totalUnlinkedCaptured,
    groupA_zeroActiveRegistration: zeroRegCount,
    groupB_doublePaid: doublePaidCount,
    totalRevenueUnregisteredGroupA: groupA_zeroReg.reduce((s, r) => s + r.captured_amount, 0),
    totalRevenueDoublePaidGroupB: groupB_doublePaid.reduce((s, r) => s + r.orphan_payment.captured_amount, 0),
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync('scratch/live_summary_stats.json', JSON.stringify(summary, null, 2));
  fs.writeFileSync('scratch/live_groupA_zero_reg.json', JSON.stringify(groupA_zeroReg, null, 2));
  fs.writeFileSync('scratch/live_groupB_double_paid.json', JSON.stringify(groupB_doublePaid, null, 2));

  console.log('\n======================================================');
  console.log('LIVE RECONCILIATION STATS:');
  console.log(JSON.stringify(summary, null, 2));
  console.log('======================================================\n');
}

main();
