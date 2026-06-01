const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/profile',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'Content-Type, Authorization'
  }
};

const req = http.request(options, res => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
});

req.on('error', e => {
  console.error('ERROR:', e.message);
});

req.end();
