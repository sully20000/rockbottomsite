import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultContent } from './default-content.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(root, 'data');

mkdirSync(dataDir, { recursive: true });

export const dbPath = path.join(dataDir, 'rockbottom.db');
export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    draft_json TEXT NOT NULL,
    published_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_login TEXT,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    csrf_token TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS visitors (
    visitor_hash TEXT PRIMARY KEY,
    first_seen TEXT NOT NULL,
    last_seen TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 1
  );
  CREATE INDEX IF NOT EXISTS visitors_first_seen ON visitors(first_seen);

  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_hash TEXT NOT NULL,
    path TEXT NOT NULL,
    viewed_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS page_views_viewed_at ON page_views(viewed_at);
  CREATE INDEX IF NOT EXISTS page_views_path ON page_views(path);

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES admins(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS helpful_votes (
    visitor_hash TEXT PRIMARY KEY,
    voted_at TEXT NOT NULL
  );
`);

export function nowIso() {
  return new Date().toISOString();
}

export function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

export function setSetting(key, value) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  ).run(key, value);
}

export function deleteSetting(key) {
  db.prepare('DELETE FROM settings WHERE key = ?').run(key);
}

function mergeDefaults(value, fallback) {
  if (fallback && typeof fallback === 'object' && !Array.isArray(fallback)) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const merged = {};
    for (const key of Object.keys(fallback)) {
      merged[key] = mergeDefaults(source[key], fallback[key]);
    }
    for (const key of Object.keys(source)) {
      if (!(key in merged)) merged[key] = source[key];
    }
    return merged;
  }
  return value === undefined || value === null ? structuredClone(fallback) : value;
}

export function getContent(mode = 'published') {
  const column = mode === 'draft' ? 'draft_json' : 'published_json';
  const row = db.prepare(`SELECT ${column} AS json FROM content WHERE id = 1`).get();
  if (!row) return structuredClone(defaultContent);
  try {
    return mergeDefaults(JSON.parse(row.json), defaultContent);
  } catch {
    return structuredClone(defaultContent);
  }
}

export function getContentMeta() {
  return db
    .prepare('SELECT updated_at, published_at FROM content WHERE id = 1')
    .get() ?? { updated_at: null, published_at: null };
}

export function saveDraft(content) {
  db.prepare('UPDATE content SET draft_json = ?, updated_at = ? WHERE id = 1').run(
    JSON.stringify(content),
    nowIso(),
  );
}

export function publishDraft() {
  const now = nowIso();
  const row = db.prepare('SELECT draft_json FROM content WHERE id = 1').get();
  if (!row) throw new Error('No draft content found');
  db.prepare(
    'UPDATE content SET published_json = draft_json, published_at = ?, updated_at = ? WHERE id = 1',
  ).run(now, now);
  return now;
}

export function discardDraft() {
  db.prepare(
    'UPDATE content SET draft_json = published_json, updated_at = ? WHERE id = 1',
  ).run(nowIso());
}

export function hasUnpublishedChanges() {
  const row = db
    .prepare(
      'SELECT draft_json, published_json, updated_at, published_at FROM content WHERE id = 1',
    )
    .get();
  if (!row) return false;
  return row.draft_json !== row.published_json;
}

export function seedContent() {
  const existing = db.prepare('SELECT id FROM content WHERE id = 1').get();
  if (!existing) {
    const now = nowIso();
    const json = JSON.stringify(defaultContent);
    db.prepare(
      'INSERT INTO content (id, draft_json, published_json, updated_at, published_at) VALUES (1, ?, ?, ?, ?)',
    ).run(json, json, now, now);
  }
}

export function recordPageView(pathname, visitorHash) {
  const now = nowIso();
  db.prepare(
    `INSERT INTO page_views (visitor_hash, path, viewed_at) VALUES (?, ?, ?)`,
  ).run(visitorHash, pathname, now);
}

export function touchVisitor(visitorHash) {
  const now = nowIso();
  const existing = db
    .prepare('SELECT visitor_hash FROM visitors WHERE visitor_hash = ?')
    .get(visitorHash);
  if (existing) {
    db.prepare(
      'UPDATE visitors SET last_seen = ?, views = views + 1 WHERE visitor_hash = ?',
    ).run(now, visitorHash);
    return false;
  }
  db.prepare(
    'INSERT INTO visitors (visitor_hash, first_seen, last_seen, views) VALUES (?, ?, ?, 1)',
  ).run(visitorHash, now, now);
  return true;
}

export function uniqueVisitorCount() {
  return db.prepare('SELECT COUNT(*) AS count FROM visitors').get().count;
}

export function helpfulVoteCount() {
  return db.prepare('SELECT COUNT(*) AS count FROM helpful_votes').get().count;
}

export function hasHelpfulVote(visitorHash) {
  if (!visitorHash) return false;
  return Boolean(
    db.prepare('SELECT 1 AS voted FROM helpful_votes WHERE visitor_hash = ?').get(visitorHash),
  );
}

export function addHelpfulVote(visitorHash) {
  db.prepare('INSERT OR IGNORE INTO helpful_votes (visitor_hash, voted_at) VALUES (?, ?)').run(
    visitorHash,
    nowIso(),
  );
  return {
    count: helpfulVoteCount(),
    voted: true,
  };
}

export function getVisitorStats() {
  const totalVisitors = uniqueVisitorCount();
  const totalViews = db.prepare('SELECT COUNT(*) AS count FROM page_views').get().count;
  const today = db
    .prepare(
      "SELECT COUNT(*) AS count FROM page_views WHERE viewed_at >= strftime('%Y-%m-%dT00:00:00.000Z','now')",
    )
    .get().count;
  const visitorsToday = db
    .prepare(
      "SELECT COUNT(*) AS count FROM visitors WHERE first_seen >= strftime('%Y-%m-%dT00:00:00.000Z','now')",
    )
    .get().count;
  const last7 = db
    .prepare(
      "SELECT COUNT(*) AS count FROM page_views WHERE viewed_at >= strftime('%Y-%m-%dT00:00:00.000Z','now','-6 days')",
    )
    .get().count;
  const daily = db
    .prepare(
      `SELECT substr(viewed_at, 1, 10) AS day, COUNT(*) AS views,
              COUNT(DISTINCT visitor_hash) AS visitors
       FROM page_views
       WHERE viewed_at >= strftime('%Y-%m-%dT00:00:00.000Z','now','-13 days')
       GROUP BY day ORDER BY day ASC`,
    )
    .all();
  const topPages = db
    .prepare(
      `SELECT path, COUNT(*) AS views FROM page_views
       GROUP BY path ORDER BY views DESC LIMIT 6`,
    )
    .all();

  return {
    totalVisitors,
    totalViews,
    today,
    visitorsToday,
    last7,
    daily,
    topPages,
  };
}

export function listMedia() {
  return db.prepare('SELECT * FROM media ORDER BY created_at DESC').all();
}

export function addMedia({ filename, originalName, mime, size, uploadedBy }) {
  db.prepare(
    'INSERT INTO media (filename, original_name, mime, size, created_at, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(filename, originalName, mime, size, nowIso(), uploadedBy ?? null);
}

export function removeMedia(filename) {
  db.prepare('DELETE FROM media WHERE filename = ?').run(filename);
}

seedContent();

export { root, dataDir };
