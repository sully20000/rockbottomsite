#!/usr/bin/env node
/**
 * Create a timestamped backup of the database and uploaded images.
 *
 * Usage:
 *   npm run backup
 *   BACKUP_DIR=D:\Backups\rock-bottom npm run backup
 *
 * The database is captured with SQLite's VACUUM INTO, which produces a clean,
 * consistent copy even while the website is running. Uploaded images are
 * copied alongside it.
 */

import fs from 'node:fs';
import path from 'node:path';
import { db, dbPath, dataDir, root } from '../src/db.js';

const uploadsDir = path.join(root, 'uploads');
const targetRoot = process.env.BACKUP_DIR
  ? path.resolve(process.env.BACKUP_DIR)
  : path.join(root, 'backups');

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const destination = path.join(targetRoot, `rockbottom-${stamp}`);

function countFiles(directory) {
  try {
    return fs
      .readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
      .length;
  } catch {
    return 0;
  }
}

function main() {
  fs.mkdirSync(destination, { recursive: true });

  const databaseCopy = path.join(destination, 'rockbottom.db');
  let method = 'VACUUM INTO';
  try {
    db.prepare('VACUUM INTO ?').run(databaseCopy);
  } catch {
    // Fall back to a checkpoint plus a straight file copy for unusual builds.
    method = 'checkpoint and copy';
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    fs.copyFileSync(dbPath, databaseCopy);
  }

  let uploaded = 0;
  if (fs.existsSync(uploadsDir)) {
    fs.cpSync(uploadsDir, path.join(destination, 'uploads'), { recursive: true });
    uploaded = countFiles(path.join(destination, 'uploads'));
  } else {
    fs.mkdirSync(path.join(destination, 'uploads'), { recursive: true });
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    source: {
      root,
      dataDir,
      database: dbPath,
      uploads: uploadsDir,
    },
    databaseMethod: method,
    uploadedImages: uploaded,
    restore: [
      'Stop the website.',
      'Copy rockbottom.db into the data folder (replace the existing file, and remove rockbottom.db-wal / rockbottom.db-shm if present).',
      'Copy the uploads folder into the project folder, replacing the existing uploads folder.',
      'Start the website again.',
    ],
  };

  fs.writeFileSync(
    path.join(destination, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  const sizeOf = (file) => (fs.statSync(file).size / (1024 * 1024)).toFixed(2);
  console.log('');
  console.log('Backup complete.');
  console.log(`  Folder:   ${destination}`);
  console.log(`  Database: ${sizeOf(databaseCopy)} MB (${method})`);
  console.log(`  Uploads:  ${uploaded} file${uploaded === 1 ? '' : 's'}`);
  console.log('');
  console.log('Keep this folder somewhere separate from the server, and test a restore occasionally.');
  console.log('');
}

try {
  main();
  db.close();
} catch (error) {
  console.error(`\nBackup failed: ${error.message}\n`);
  process.exitCode = 1;
  try {
    db.close();
  } catch {
    // Ignore close errors after a failure.
  }
}
