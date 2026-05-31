const http = require('http');

// Generate 1MB payload to trigger 413 if limit is not increased
const largeBase64 = "data:image/png;base64," + "A".repeat(1024 * 1024);
const data = JSON.stringify({ signatureData: largeBase64 });

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/document/e8507ad5-68f9-4595-a34c-1fa39d76a673/sign',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body.substring(0, 100)));
});

req.on('error', e => console.error('Error:', e));
req.write(data);
req.end();
