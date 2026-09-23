const fs = require('fs');

const groupA = JSON.parse(fs.readFileSync('scratch/live_groupA_zero_reg.json', 'utf8'));
const groupB = JSON.parse(fs.readFileSync('scratch/live_groupB_double_paid.json', 'utf8'));

const linesA = [
  '| # | Email | Phone Number | Amount | Razorpay Payment ID | Paid Date & Time (IST) | Method / VPA | Note |',
  '|---|---|---|---|---|---|---|---|'
];

groupA.forEach((r, idx) => {
  const isDev = r.captured_amount === 1 || r.email.includes('devpdhana');
  const d = new Date(r.captured_at);
  const istDate = d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  linesA.push(`| ${idx + 1} | \`${r.email}\` | \`${r.contact}\` | ₹${r.captured_amount} | \`${r.razorpay_payment_id}\` | ${istDate} | ${r.vpa_or_bank || r.method.toUpperCase()} | ${isDev ? 'Dev Test' : 'Missing'} |`);
});

fs.writeFileSync('scratch/table_groupA.md', linesA.join('\n'));

const linesB = [
  '| # | Participant Name | Email | Phone Number | Extra Unlinked Payment | Existing Registration # | Existing Race Category |',
  '|---|---|---|---|---|---|---|'
];

groupB.forEach((r, idx) => {
  const o = r.orphan_payment;
  const reg = r.registered_record;
  const isDev = o.captured_amount === 1;
  linesB.push(`| ${idx + 1} | **${reg.full_name}** | \`${o.email}\` | \`${o.contact}\` | **₹${o.captured_amount}** (\`${o.razorpay_payment_id}\`) | \`${reg.registration_number}\` | ${reg.race_category || 'N/A'}${isDev ? ' *(Dev Test)*' : ''} |`);
});

fs.writeFileSync('scratch/table_groupB.md', linesB.join('\n'));
console.log('Tables generated successfully.');
