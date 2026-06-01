const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ username: 'admin', sub: 'admin_id', tenantId: '00000000-0000-0000-0000-000000000000', role: 'superadmin' }, 'secretKey');

const data = JSON.stringify({ signatureData: "data:image/png;base64," + "A".repeat(50 * 1024) });

const ids = [
  'a4a7d7aa-2b35-4332-9dbc-9a12faa17648',
  '9d84dc89-863a-4115-95a9-56c6c84f6c3d'
];

async function run() {
  const promises = ids.map(id => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/document/' + id + '/sign',
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
        res.on('end', () => resolve({ id, status: res.statusCode, body: body.substring(0, 100) }));
      });
      req.on('error', e => reject(e));
      req.write(data);
      req.end();
    });
  });

  const results = await Promise.all(promises);
  console.log("Results with 50KB payload:", results);
}
run();
