#!/usr/bin/env node
/**
 * Create or reset an administrator account.
 *
 * Usage:
 *   npm run create-admin
 *   npm run create-admin -- --username jo --reset
 *   ADMIN_USERNAME=jo ADMIN_PASSWORD='a long passphrase' npm run create-admin
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  adminCount,
  createAdmin,
  findAdminByUsername,
  updateAdminPassword,
} from '../src/auth.js';
import { db, nowIso } from '../src/db.js';

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) continue;
    const [rawKey, inlineValue] = argument.slice(2).split('=');
    const key = rawKey.trim();
    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      options[key] = next;
      index += 1;
    } else {
      options[key] = true;
    }
  }
  return options;
}

function readVisible(question) {
  const rl = readline.createInterface({ input, output });
  return rl.question(question).finally(() => rl.close());
}

function readHidden(question) {
  if (!input.isTTY) return readVisible(question);

  return new Promise((resolve, reject) => {
    output.write(question);
    const wasRaw = input.isRaw;
    let value = '';
    let finished = false;

    const cleanup = () => {
      input.off('data', onData);
      input.setRawMode(Boolean(wasRaw));
      input.pause();
    };

    const onData = (chunk) => {
      if (finished) return;
      for (const character of chunk) {
        if (character === '\r' || character === '\n') {
          finished = true;
          cleanup();
          output.write('\n');
          resolve(value);
          return;
        }
        if (character === '\u0003') {
          finished = true;
          cleanup();
          output.write('\nCancelled.\n');
          reject(new Error('Cancelled by the user.'));
          return;
        }
        if (character === '\u007f' || character === '\b') {
          if (value.length) {
            value = value.slice(0, -1);
            output.write('\b \b');
          }
          continue;
        }
        if (character >= ' ') {
          value += character;
          output.write('*');
        }
      }
    };

    input.setEncoding('utf8');
    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const reset = Boolean(options.reset);
  const existing = adminCount();
  let username = String(options.username || process.env.ADMIN_USERNAME || '').trim();

  if (!username) {
    if (existing) {
      const only = db.prepare('SELECT username FROM admins ORDER BY id LIMIT 1').get();
      username = await readVisible(
        `Username${only ? ` [${only.username}]` : ''}: `,
      );
      if (!username && only) username = only.username;
    } else {
      username = (await readVisible('Choose a username (letters, numbers, dots, dashes or underscores): ')).trim();
    }
  }

  if (!username) {
    throw new Error('A username is required.');
  }

  const account = findAdminByUsername(username);

  if (existing && !account && !reset) {
    throw new Error(
      `An administrator account already exists. Use --reset with the existing username to change its password.`,
    );
  }

  if (!existing && reset) {
    throw new Error('There is no administrator account to reset yet. Run the command without --reset.');
  }

  if (reset && !account) {
    throw new Error(`No administrator account called “${username}” was found.`);
  }

  if (account && !reset) {
    throw new Error(
      `“${account.username}” already exists. Run this command with --reset to set a new password.`,
    );
  }

  let password = String(options.password || process.env.ADMIN_PASSWORD || '');
  if (!password) {
    password = await readHidden(`New password for ${username} (at least 12 characters): `);
    const confirm = await readHidden('Confirm the password: ');
    if (password !== confirm) {
      throw new Error('The passwords did not match. Nothing was changed.');
    }
  }

  if (password.length < 12) {
    throw new Error('The password must be at least 12 characters long. Nothing was changed.');
  }

  if (reset && account) {
    updateAdminPassword(account.id, password);
    db.prepare(
      'UPDATE admins SET failed_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?',
    ).run(nowIso(), account.id);
    // Changing the password ends any other signed-in session.
    db.prepare('DELETE FROM sessions WHERE admin_id = ?').run(account.id);
    console.log(`\nPassword updated for “${account.username}”. Any signed-in sessions were ended.`);
    console.log('Sign in at /admin/login with the new password.\n');
  } else {
    const created = createAdmin(username, password);
    console.log(`\nAdministrator “${created.username}” created.`);
    console.log('Start the server with npm start, then sign in at /admin/login.\n');
  }
}

main()
  .catch((error) => {
    console.error(`\n${error.message || error}\n`);
    process.exitCode = 1;
  })
  .finally(() => {
    try {
      db.close();
    } catch {
      // The database may already be closed or never opened.
    }
  });
