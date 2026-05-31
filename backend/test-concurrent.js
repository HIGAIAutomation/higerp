const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ username: 'admin', sub: 'admin_id', tenantId: '00000000-0000-0000-0000-000000000000', role: 'superadmin' }, 'secretKey');

const data = JSON.stringify({ signatureData: "data:image/png;base64,testdata" });

const ids = [
  '9d84dc89-863a-4115-95a9-56c6c84f6c3d',
  '0d841ab9-6374-407a-b658-f39a933e7458',
  '17e343b2-168b-451c-be33-e4af8daff519'
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
        res.on('end', () => resolve({ id, status: res.statusCode, body }));
      });
      req.on('error', e => reject(e));
      req.write(data);
      req.end();
    });
  });

  const results = await Promise.all(promises);
  console.log("Results:", results);
}
run();
