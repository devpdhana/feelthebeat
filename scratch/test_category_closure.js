const http = require('http');

async function testCreateOrder(category) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      category: category,
      email: 'testclosure@feelthebeat.in',
      mobile: '9999999999'
    });

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/payment/create-order',
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
  console.log('--- TESTING PAYMENT ORDER CREATION ---');
  const categories = ['2km', '2km-kids', '5km', '10km'];
  for (const cat of categories) {
    const res = await testCreateOrder(cat);
    console.log(`[CREATE-ORDER] Category: ${cat.padEnd(8)} | Status: ${res.status} | Response:`, JSON.stringify(res.body));
  }
}

run();
