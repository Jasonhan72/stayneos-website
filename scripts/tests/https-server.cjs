// Local browser testing only. Generate an ephemeral certificate before invoking.
const fs = require('node:fs');
const https = require('node:https');
const next = require('next');
const port = 3143;
const app = next({ dev: false, hostname: '127.0.0.1', port });
let server;
app.prepare().then(() => {
  const handler = app.getRequestHandler();
  server = https.createServer({
    key: fs.readFileSync('.local/e2e/key.pem'),
    cert: fs.readFileSync('.local/e2e/cert.pem'),
  }, (request, response) => {
    request.headers['x-forwarded-proto'] = 'https';
    request.headers['x-forwarded-port'] = String(port);
    return handler(request, response);
  }).listen(port, '127.0.0.1');
}).catch(error => { console.error(error); process.exit(1); });
async function stop() { server?.close(); await app.close(); process.exit(); }
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
