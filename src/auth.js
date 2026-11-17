import crypto from 'node:crypto';
import { db, nowIso } from './db.js';

const SESSION_HOURS = 12;

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const N = 16384;
  const r = 8;
  const p = 1;
  const derived = crypto.scryptSync(password, salt, 64, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt}$${derived.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  try {
    const parts = String(stored).split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const [, N, r, p, salt, expectedHex] = parts;
    const expected = Buffer.from(expectedHex, 'hex');
    const derived = crypto.scryptSync(password, salt, expected.length, {
      N: Number(N),
      r: Number(r),
      p: Number(p),
    });
    return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

// Used to keep login timing consistent when a username does not exist.
const DUMMY_HASH = hashPassword('this-is-not-a-real-password-4821');

export function findAdminByUsername(username) {
  return db
    .prepare('SELECT * FROM admins WHERE username = ? COLLATE NOCASE')
    .get(String(username || '').trim());
}

export function findAdminById(id) {
  return db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
}

export function adminCount() {
  return db.prepare('SELECT COUNT(*) AS count FROM admins').get().count;
}

export function createAdmin(username, password) {
  const clean = String(username || '').trim();
  if (!/^[a-zA-Z0-9._-]{3,40}$/.test(clean)) {
    throw new Error('Username must be 3–40 characters (letters, numbers, dots, dashes or underscores).');
  }
  if (String(password || '').length < 12) {
    throw new Error('Password must be at least 12 characters long.');
  }
  if (findAdminByUsername(clean)) {
    throw new Error('That username is already in use.');
  }
  const now = nowIso();
  db.prepare(
    'INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)',
  ).run(clean, hashPassword(password), now);
  return findAdminByUsername(clean);
}

export function authenticate(username, password) {
  const admin = findAdminByUsername(username);
  if (!admin) {
    verifyPassword(password, DUMMY_HASH);
    return null;
  }
  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    return { locked: true };
  }
  if (!verifyPassword(password, admin.password_hash)) {
    const attempts = admin.failed_attempts + 1;
    const lockUntil =
      attempts >= 8 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    db.prepare('UPDATE admins SET failed_attempts = ?, locked_until = ? WHERE id = ?').run(
      attempts,
      lockUntil,
      admin.id,
    );
    return null;
  }
  db.prepare(
    'UPDATE admins SET failed_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?',
  ).run(nowIso(), admin.id);
  return admin;
}

export function updateAdminPassword(adminId, newPassword) {
  if (String(newPassword || '').length < 12) {
    throw new Error('Password must be at least 12 characters long.');
  }
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(
    hashPassword(newPassword),
    adminId,
  );
}

export function createSession(adminId) {
  const token = randomToken(32);
  const csrf = randomToken(24);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_HOURS * 60 * 60 * 1000);
  db.prepare(
    'INSERT INTO sessions (token_hash, admin_id, csrf_token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
  ).run(sha256(token), adminId, csrf, now.toISOString(), expires.toISOString());
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now.toISOString());
  return { token, csrf, expires };
}

export function getSession(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT s.token_hash, s.admin_id, s.csrf_token, s.expires_at,
              a.username, a.last_login
       FROM sessions s JOIN admins a ON a.id = s.admin_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(sha256(token), nowIso());
  return row || null;
}

export function destroySession(token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
}

export function destroyOtherSessions(adminId, keepToken) {
  db.prepare('DELETE FROM sessions WHERE admin_id = ? AND token_hash != ?').run(
    adminId,
    sha256(keepToken || ''),
  );
}

export function constantTimeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export { SESSION_HOURS };
