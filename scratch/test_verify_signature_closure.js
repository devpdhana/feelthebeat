const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
let secret = 'mocksecret';
for (const line of envContent.split('\n')) {
  if (line.startsWith('RAZORPAY_KEY_SECRET=')) {
    secret = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
}

async function testVerifyWithSignature(raceCategory) {
  return new Promise((resolve, reject) => {
    const order_id = "order_test123";
    const payment_id = "pay_test123";
    const signature = crypto.createHmac("sha256", secret).update(`${order_id}|${payment_id}`).digest("hex");

    const data = JSON.stringify({
      razorpay_payment_id: payment_id,
      razorpay_order_id: order_id,
      razorpay_signature: signature,
      raceCategory: raceCategory,
      fullName: "Test Runner",
      mobile: "9999999999",
      email: "test@example.com",
      dob: "2000-01-01",
      gender: "Male",
      tshirtSize: "M",
      bibName: "Test",
      emergencyContactName: "Emergency Contact",
      emergencyContactNumber: "8888888888",
      bloodGroup: "O+",
      medicalCondition: "None",
      nationality: "Indian",
      firstTimeRunner: "No",
      disabilityStatus: "No",
      davFamilyMember: "No",
      davHearAbout: "Social Media"
    });

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/payment/verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- TESTING PAYMENT VERIFICATION WITH SIGNATURE ---');
  for (const cat of ['2km', '2km-kids', '5km', '10km']) {
    const res = await testVerifyWithSignature(cat);
    console.log(`[VERIFY WITH SIGNATURE] Category: ${cat.padEnd(8)} | Status: ${res.status} | Response:`, JSON.stringify(res.body));
  }
}

run();
