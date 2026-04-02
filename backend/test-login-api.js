'use strict';
const http = require('http');

const data = JSON.stringify({
  email: 'ramireddylokeshreddy@gmail.com',
  password: 'Password@123'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:', body);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
