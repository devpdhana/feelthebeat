const http = require('http');

async function testVerify(raceCategory) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      razorpay_payment_id: "pay_fake123456",
      razorpay_order_id: "order_fake123456",
      razorpay_signature: "invalid_or_fake_signature",
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
  console.log('--- TESTING PAYMENT VERIFICATION REJECTION ---');
  for (const cat of ['2km', '2km-kids', '5km', '10km']) {
    const res = await testVerify(cat);
    console.log(`[VERIFY] Category: ${cat.padEnd(8)} | Status: ${res.status} | Response:`, JSON.stringify(res.body));
  }
}

run();
