const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ username: 'admin', sub: 'admin_id', tenantId: '00000000-0000-0000-0000-000000000000', role: 'superadmin' }, 'secretKey');

const data = JSON.stringify({ signatureData: "data:image/png;base64,testdata" });

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/document/a4a7d7aa-2b35-4332-9dbc-9a12faa17648/sign',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': 'Bearer ' + token
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response Status:', res.statusCode, 'Body:', body));
});

req.on('error', e => console.error('Error:', e));
req.write(data);
req.end();
