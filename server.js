import http from 'node:http';
import path from 'node:path';
import { app } from './src/app.js';
import { ensureSetupToken } from './src/admin-routes.js';
import { db, dbPath, dataDir } from './src/db.js';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

const server = http.createServer(app);

server.listen(port, host, () => {
  const shownHost = host === '0.0.0.0' || host === '::' ? 'localhost' : host;
  const base = `http://${shownHost}:${port}`;

  console.log('');
  console.log('  Rock Bottom - The Way Back');
  console.log(`  Public website:  ${base}/`);
  console.log(`  Admin dashboard: ${base}/admin`);
  console.log(`  Database:        ${dbPath}`);
  console.log('');

  if (isProduction) {
    console.log('  Running in production mode.');
    if (process.env.TRUST_PROXY !== '1' && process.env.TRUST_PROXY !== 'true') {
      console.log('  Note: TRUST_PROXY is not set. If you use Nginx, Caddy or another reverse proxy,');
      console.log('  set TRUST_PROXY=1 so secure cookies and visitor counts work correctly.');
    }
    console.log('  Make sure HTTPS is terminated in front of this process.');
    console.log('');
  } else {
    console.log('  Development mode. Admin sessions use cookies over plain HTTP, so use this only locally.');
    console.log('');
  }

  const setupToken = ensureSetupToken();
  if (setupToken) {
    console.log('  -- First-time setup -------------------------------------------');
    console.log('  No administrator account exists yet. Open this address once:');
    console.log('');
    console.log(`  ${base}/admin/setup?token=${setupToken}`);
    console.log('');
    console.log(`  The token is also saved in: ${path.join(dataDir, 'setup-token.txt')}`);
    console.log('  It is deleted automatically after the account is created.');
    console.log('  ---------------------------------------------------------------');
    console.log('');
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other process or set a different PORT.`);
  } else {
    console.error('The server could not start:', error);
  }
  process.exitCode = 1;
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${signal} received. Closing the server…`);

  const timeout = setTimeout(() => {
    console.error('The server did not close in time. Forcing exit.');
    process.exit(1);
  }, 10_000);
  timeout.unref();

  server.close(() => {
    try {
      db.close();
    } catch (error) {
      console.error('Could not close the database cleanly:', error.message);
    }
    clearTimeout(timeout);
    console.log('Server stopped. Your content is saved.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
