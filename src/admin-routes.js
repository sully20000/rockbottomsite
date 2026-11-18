import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  addMedia,
  getContent,
  getContentMeta,
  getSetting,
  hasUnpublishedChanges,
  listMedia,
  publishDraft,
  discardDraft,
  removeMedia,
  saveDraft,
  setSetting,
  deleteSetting,
  getVisitorStats,
  helpfulVoteCount,
  dbPath,
  dataDir,
  root,
  uploadDir,
} from './db.js';
import {
  adminCount,
  authenticate,
  constantTimeEqual,
  createAdmin,
  createSession,
  destroyOtherSessions,
  destroySession,
  findAdminById,
  sha256,
  updateAdminPassword,
  verifyPassword,
} from './auth.js';
import {
  applyCommunity,
  applyDaily,
  applyDesign,
  applyEmergency,
  applyFaq,
  applyHome,
  applyPages,
  applySymptoms,
  applySupport,
  applyTips,
} from './content-editors.js';
import { dailyMessageIndex, safeImage } from './content-utils.js';
import { applyInlineChange } from './inline-edit.js';

export const adminRouter = express.Router();

const SESSION_COOKIE = 'rb_admin';
const SESSION_MAX_AGE = 12 * 60 * 60 * 1000;
const setupTokenFile = path.join(dataDir, 'setup-token.txt');

const NOTICES = {
  saved: 'Your changes have been saved to the draft. Nothing has changed on the public website yet.',
  published: 'Published. Your changes are now live on the public website.',
  discarded: 'The draft has been reset to the currently published version.',
  uploaded: 'Upload complete. The new image is available in the media library.',
  deleted: 'The image has been removed.',
  password: 'Your password has been updated. Other signed-in sessions have been ended.',
  setup: 'Welcome. Your administrator account is ready. Everything you save here is a draft until you press Publish.',
  'upload-error': 'The upload could not be completed. Please check the file type and size and try again.',
  'no-files': 'Please choose at least one image to upload.',
  'invalid-image': 'One or more files did not look like a valid image and were not uploaded.',
};

const BUILT_IN_IMAGES = [
  { url: '/images/hero-forest.jpg', label: 'Forest lake at first light (hero)' },
  { url: '/images/ferns.jpg', label: 'Forest path in sunlight' },
  { url: '/images/calm-lake.jpg', label: 'Calm mountain lake' },
  { url: '/images/sunrise-path.jpg', label: 'Lone tree under an open sky' },
];

function imageOptions(media = []) {
  return [
    ...BUILT_IN_IMAGES,
    ...media.map((item) => ({
      url: `/uploads/${item.filename}`,
      label: item.original_name || item.filename,
    })),
  ];
}

function noticeFor(req) {
  return NOTICES[String(req.query.notice || '')] || '';
}

function sessionCookieOptions(req) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

function requireAdmin(req, res, next) {
  if (!res.locals.admin) {
    return res.redirect('/admin/login');
  }
  next();
}

function renderMediaPage(req, res) {
  const media = listMedia();
  res.render('admin/media', {
    media,
    imageOptions: imageOptions(media),
    active: 'media',
    pageTitle: 'Media library',
    hasChanges: hasUnpublishedChanges(),
    notice: noticeFor(req),
  });
}

/* ------------------------------------------------------------------
   Public-facing setup and login
   ------------------------------------------------------------------ */

const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

function rateKey(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function rateLimited(req) {
  const entry = loginAttempts.get(rateKey(req));
  if (!entry) return false;
  if (entry.reset < Date.now()) {
    loginAttempts.delete(rateKey(req));
    return false;
  }
  return entry.count >= LOGIN_MAX_ATTEMPTS;
}

function recordLoginFailure(req) {
  const key = rateKey(req);
  const existing = loginAttempts.get(key);
  const now = Date.now();
  if (!existing || existing.reset < now) {
    loginAttempts.set(key, { count: 1, reset: now + LOGIN_WINDOW_MS });
  } else {
    existing.count += 1;
  }
}

export function ensureSetupToken() {
  if (adminCount() > 0) return null;
  let token = process.env.ADMIN_SETUP_TOKEN || '';
  if (!token && fs.existsSync(setupTokenFile)) {
    token = fs.readFileSync(setupTokenFile, 'utf8').trim();
  }
  if (!token) {
    token = crypto.randomBytes(24).toString('base64url');
    fs.writeFileSync(setupTokenFile, token, { mode: 0o600 });
  }
  setSetting('setup_token_hash', sha256(token));
  return token;
}

function clearSetupToken() {
  deleteSetting('setup_token_hash');
  try {
    if (fs.existsSync(setupTokenFile)) fs.unlinkSync(setupTokenFile);
  } catch {
    // Not fatal: the hash has already been removed, so the token cannot be used.
  }
}

adminRouter.get('/login', (req, res) => {
  if (res.locals.admin) return res.redirect('/admin');
  const setupComplete = req.query.setup === 'complete';
  const accountExists = req.query.notice === 'account-exists';
  res.render('admin/login', {
    error: '',
    notice: setupComplete
      ? 'Your administrator account is ready. Please sign in.'
      : accountExists
        ? 'An administrator account already exists. Please sign in below.'
        : '',
    canSetup: adminCount() === 0,
    csrfToken: res.locals.csrfToken,
  });
});

adminRouter.post('/login', (req, res) => {
  if (res.locals.admin) return res.redirect('/admin');
  if (rateLimited(req)) {
    res.status(429);
    return res.render('admin/login', {
      error: 'Too many sign-in attempts. Please wait a few minutes and try again.',
      notice: '',
      canSetup: adminCount() === 0,
      csrfToken: res.locals.csrfToken,
    });
  }
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const admin = authenticate(username, password);
  if (!admin) {
    recordLoginFailure(req);
    return res.status(401).render('admin/login', {
      error: admin === null ? 'Those details did not match. Please try again.' : 'That account is temporarily locked. Please try again later.',
      notice: '',
      canSetup: adminCount() === 0,
      csrfToken: res.locals.csrfToken,
    });
  }
  if (admin.locked) {
    return res.status(423).render('admin/login', {
      error: 'That account is temporarily locked after repeated attempts. Please try again in 15 minutes.',
      notice: '',
      canSetup: adminCount() === 0,
      csrfToken: res.locals.csrfToken,
    });
  }
  loginAttempts.delete(rateKey(req));
  const session = createSession(admin.id);
  res.cookie(SESSION_COOKIE, session.token, sessionCookieOptions(req));
  res.redirect('/admin');
});

adminRouter.get('/setup', (req, res) => {
  if (adminCount() > 0) return res.redirect('/admin/login?notice=account-exists');
  // Make sure a token exists, but never render it into the page by default.
  // It is only shown when the setup link itself supplies it.
  ensureSetupToken();
  res.render('admin/setup', {
    error: '',
    token: String(req.query.token || ''),
    csrfToken: res.locals.csrfToken,
  });
});

adminRouter.post('/setup', (req, res) => {
  if (adminCount() > 0) return res.redirect('/admin/login?notice=account-exists');
  const suppliedToken = String(req.body.setupToken || '').trim();
  const expected = getSetting('setup_token_hash') || '';
  if (!expected || !constantTimeEqual(sha256(suppliedToken), expected)) {
    res.status(403);
    return res.render('admin/setup', {
      error: 'That setup token is not valid. Please use the token shown in the server console or in data/setup-token.txt.',
      token: suppliedToken,
      csrfToken: res.locals.csrfToken,
    });
  }
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const confirm = String(req.body.confirmPassword || '');
  if (password !== confirm) {
    return res.status(400).render('admin/setup', {
      error: 'The passwords did not match.',
      token: suppliedToken,
      csrfToken: res.locals.csrfToken,
    });
  }
  try {
    const admin = createAdmin(username, password);
    const session = createSession(admin.id);
    clearSetupToken();
    res.cookie(SESSION_COOKIE, session.token, sessionCookieOptions(req));
    res.redirect('/admin?notice=setup');
  } catch (error) {
    return res.status(400).render('admin/setup', {
      error: error.message,
      token: suppliedToken,
      csrfToken: res.locals.csrfToken,
    });
  }
});

adminRouter.use(requireAdmin);

adminRouter.post('/logout', (req, res) => {
  destroySession(req.cookies?.[SESSION_COOKIE]);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.redirect('/admin/login');
});

/* ------------------------------------------------------------------
   Dashboard
   ------------------------------------------------------------------ */

adminRouter.get('/', (req, res) => {
  const draft = getContent('draft');
  const meta = getContentMeta();
  const stats = getVisitorStats();
  const media = listMedia();
  const maxViews = Math.max(1, ...stats.daily.map((day) => day.views));
  res.render('admin/overview', {
    draft,
    meta,
    stats,
    media,
    maxViews,
    active: 'overview',
    pageTitle: 'Overview',
    hasChanges: hasUnpublishedChanges(),
    notice: noticeFor(req),
    admin: res.locals.admin,
  });
});

adminRouter.post('/publish', (req, res) => {
  publishDraft();
  if (wantsJson(req)) return res.json({ ok: true, published: true });
  res.redirect('/admin?notice=published');
});

adminRouter.post('/discard', (req, res) => {
  discardDraft();
  if (wantsJson(req)) return res.json({ ok: true, discarded: true });
  res.redirect('/admin?notice=discarded');
});

/* ------------------------------------------------------------------
   On-page editing (authenticated)
   ------------------------------------------------------------------ */

function wantsJson(req) {
  if (req.is('application/json')) return true;
  return String(req.get('accept') || '').includes('application/json');
}

adminRouter.post('/inline-save', (req, res) => {
  if (!req.is('application/json')) {
    return res.status(415).json({ ok: false, error: 'That request was not understood.' });
  }

  const changes = req.body?.changes;
  if (!Array.isArray(changes) || changes.length === 0) {
    return res.status(400).json({ ok: false, error: 'There were no changes to save.' });
  }
  if (changes.length > 250) {
    return res.status(400).json({ ok: false, error: 'That is too many changes in one go.' });
  }

  const draft = getContent('draft');
  for (const change of changes) {
    const result = applyInlineChange(draft, change);
    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error,
        path: typeof change?.path === 'string' ? change.path : '',
      });
    }
  }

  saveDraft(draft);
  res.json({
    ok: true,
    saved: changes.length,
    hasChanges: hasUnpublishedChanges(),
  });
});

/* ------------------------------------------------------------------
   Draft preview (authenticated)
   ------------------------------------------------------------------ */

adminRouter.get('/preview', (req, res) => {
  const content = getContent('draft');
  const origin = `${req.protocol}://${req.get('host')}`;
  res.locals.content = content;
  res.locals.dailyIndex = dailyMessageIndex(content.daily.messages);
  res.locals.dailyText =
    Array.isArray(content.daily.messages) && content.daily.messages.length
      ? content.daily.messages[res.locals.dailyIndex]
      : '';
  res.locals.origin = origin;
  res.locals.visitorCount = null;
  res.locals.helpfulCount = helpfulVoteCount();
  res.locals.helpfulVoted = false;
  res.locals.pageTitle = '';
  res.locals.pageDescription = content.site.metaDescription;
  res.locals.canonicalUrl = `${origin}/admin/preview`;
  res.locals.ogImage = `${origin}${safeImage(content.hero.image, '/images/hero-forest.jpg')}`;
  res.locals.noindex = true;
  res.locals.bodyClass = 'page-home is-preview';
  res.locals.preview = true;
  res.locals.preloadImage = safeImage(content.hero.image, '/images/hero-forest.jpg');
  res.locals.canInlineEdit = true;
  res.locals.editing = String(req.query.edit || '') === '1';
  res.render('home');
});

adminRouter.get('/preview/disclaimer', (req, res) => {
  renderDraftPage(req, res, 'disclaimer');
});
adminRouter.get('/preview/privacy', (req, res) => {
  renderDraftPage(req, res, 'privacy');
});

adminRouter.get('/preview/faq', (req, res) => {
  const content = getContent('draft');
  const origin = `${req.protocol}://${req.get('host')}`;
  res.locals.content = content;
  res.locals.dailyText = '';
  res.locals.dailyIndex = 0;
  res.locals.origin = origin;
  res.locals.visitorCount = null;
  res.locals.pageTitle = 'Questions and where to get help';
  res.locals.pageDescription = content.faq.intro;
  res.locals.canonicalUrl = `${origin}/admin/preview/faq`;
  res.locals.ogImage = `${origin}${safeImage(content.hero.image, '/images/hero-forest.jpg')}`;
  res.locals.noindex = true;
  res.locals.bodyClass = 'page-faq is-preview';
  res.locals.preview = true;
  res.locals.preloadImage = '';
  res.locals.canInlineEdit = true;
  res.locals.editing = String(req.query.edit || '') === '1';
  res.render('faq');
});

function renderDraftPage(req, res, key) {
  const content = getContent('draft');
  const page = content.pages[key];
  const origin = `${req.protocol}://${req.get('host')}`;
  res.locals.content = content;
  res.locals.dailyText = '';
  res.locals.origin = origin;
  res.locals.visitorCount = null;
  res.locals.pageTitle = page.title;
  res.locals.pageDescription = page.intro;
  res.locals.canonicalUrl = `${origin}/admin/preview/${key}`;
  res.locals.ogImage = `${origin}${safeImage(content.hero.image, '/images/hero-forest.jpg')}`;
  res.locals.noindex = true;
  res.locals.bodyClass = 'page-legal is-preview';
  res.locals.preview = true;
  res.locals.preloadImage = '';
  res.locals.canInlineEdit = true;
  res.locals.editing = String(req.query.edit || '') === '1';
  res.render('page', { pageKey: key, page });
}

/* ------------------------------------------------------------------
   Content editors
   ------------------------------------------------------------------ */

const EDITORS = {
  home: { title: 'Homepage', apply: applyHome },
  symptoms: { title: 'Symptoms section', apply: applySymptoms },
  tips: { title: 'Ten steps', apply: applyTips },
  daily: { title: 'Daily reminders', apply: applyDaily },
  support: { title: 'Support organisations', apply: applySupport },
  emergency: { title: 'Emergency support', apply: applyEmergency },
  community: { title: 'Community', apply: applyCommunity },
  faq: { title: 'Questions page', apply: applyFaq },
  design: { title: 'Design & navigation', apply: applyDesign },
  pages: { title: 'Footer & legal pages', apply: applyPages },
};

adminRouter.get('/edit/:section', (req, res, next) => {
  const editor = EDITORS[req.params.section];
  if (!editor) return next();
  const draft = getContent('draft');
  const media = listMedia();
  res.render(`admin/edit-${req.params.section}`, {
    draft,
    meta: getContentMeta(),
    media,
    imageOptions: imageOptions(media),
    active: req.params.section,
    pageTitle: editor.title,
    hasChanges: hasUnpublishedChanges(),
    notice: noticeFor(req),
    error: '',
  });
});

adminRouter.post('/edit/:section', (req, res, next) => {
  const editor = EDITORS[req.params.section];
  if (!editor) return next();
  try {
    const draft = getContent('draft');
    const updated = editor.apply(draft, req.body);
    saveDraft(updated);
    res.redirect(`/admin/edit/${req.params.section}?notice=saved`);
  } catch (error) {
    console.error('Content save failed:', error);
    res.status(400).render(`admin/edit-${req.params.section}`, {
      draft: getContent('draft'),
      meta: getContentMeta(),
      media: listMedia(),
      imageOptions: imageOptions(listMedia()),
      active: req.params.section,
      pageTitle: editor.title,
      hasChanges: hasUnpublishedChanges(),
      notice: '',
      error: 'Those changes could not be saved. Please check the fields and try again.',
    });
  }
});

/* ------------------------------------------------------------------
   Media library
   ------------------------------------------------------------------ */

const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDir),
  filename: (req, file, callback) => {
    const extension = MIME_EXTENSIONS[file.mimetype] || '.img';
    callback(
      null,
      `${Date.now()}-${crypto.randomBytes(7).toString('hex')}${extension}`,
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, callback) => {
    if (!MIME_EXTENSIONS[file.mimetype]) {
      return callback(new Error('Unsupported file type'));
    }
    callback(null, true);
  },
});

function validImageSignature(filePath, mime) {
  let descriptor;
  try {
    descriptor = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(16);
    const bytes = fs.readSync(descriptor, header, 0, 16, 0);
    if (mime === 'image/jpeg') return bytes >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    if (mime === 'image/png') {
      return bytes >= 8 && header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }
    if (mime === 'image/webp') {
      return bytes >= 12 && header.subarray(0, 4).toString() === 'RIFF' && header.subarray(8, 12).toString() === 'WEBP';
    }
    if (mime === 'image/avif') {
      return bytes >= 12 && header.subarray(4, 8).toString() === 'ftyp' && /avi[fs]/.test(header.subarray(8, 12).toString());
    }
    return false;
  } catch {
    return false;
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function cleanupFiles(files = []) {
  files.forEach((file) => {
    try {
      fs.unlinkSync(file.path);
    } catch {
      // Ignore cleanup errors.
    }
  });
}

function verifyMultipartCsrf(req, res, next) {
  const supplied = req.body?._csrf;
  if (!constantTimeEqual(supplied, req.csrfToken)) {
    cleanupFiles(req.files);
    return res.status(403).type('text/plain').send('Forbidden: invalid security token.');
  }
  next();
}

adminRouter.get('/media', renderMediaPage);

adminRouter.post(
  '/media/upload',
  (req, res, next) => {
    upload.array('images', 10)(req, res, (error) => {
      if (error) {
        cleanupFiles(req.files);
        return res.redirect('/admin/media?notice=upload-error');
      }
      next();
    });
  },
  verifyMultipartCsrf,
  (req, res) => {
    const files = req.files || [];
    if (!files.length) return res.redirect('/admin/media?notice=no-files');
    let invalid = 0;
    files.forEach((file) => {
      if (!validImageSignature(file.path, file.mimetype)) {
        invalid += 1;
        cleanupFiles([file]);
        return;
      }
      addMedia({
        filename: file.filename,
        originalName: file.originalname.slice(0, 200),
        mime: file.mimetype,
        size: file.size,
        uploadedBy: res.locals.admin.id,
      });
    });
    if (invalid) return res.redirect('/admin/media?notice=invalid-image');
    res.redirect('/admin/media?notice=uploaded');
  },
);

adminRouter.post('/media/:id/delete', (req, res) => {
  const item = listMedia().find((entry) => entry.id === Number(req.params.id));
  if (item) {
    try {
      const filename = path.basename(item.filename);
      fs.unlinkSync(path.join(uploadDir, filename));
    } catch {
      // The file may already be gone; remove the database row anyway.
    }
    removeMedia(item.filename);
  }
  res.redirect('/admin/media?notice=deleted');
});

/* ------------------------------------------------------------------
   Visitor statistics and account
   ------------------------------------------------------------------ */

adminRouter.get('/visitors', (req, res) => {
  const stats = getVisitorStats();
  const maxViews = Math.max(1, ...stats.daily.map((day) => day.views));
  res.render('admin/visitors', {
    stats,
    maxViews,
    active: 'visitors',
    pageTitle: 'Visitor statistics',
    hasChanges: hasUnpublishedChanges(),
    notice: noticeFor(req),
  });
});

adminRouter.get('/account', (req, res) => {
  const admin = findAdminById(res.locals.admin.id);
  res.render('admin/account', {
    admin,
    active: 'account',
    pageTitle: 'Your account',
    hasChanges: hasUnpublishedChanges(),
    notice: noticeFor(req),
    error: '',
  });
});

adminRouter.post('/account/password', (req, res) => {
  const admin = findAdminById(res.locals.admin.id);
  const current = String(req.body.currentPassword || '');
  const next = String(req.body.newPassword || '');
  const confirm = String(req.body.confirmPassword || '');
  const renderError = (message) =>
    res.status(400).render('admin/account', {
      admin,
      active: 'account',
      pageTitle: 'Your account',
      hasChanges: hasUnpublishedChanges(),
      notice: '',
      error: message,
    });

  if (!verifyPassword(current, admin.password_hash)) {
    return renderError('Your current password was not correct.');
  }
  if (next.length < 12) {
    return renderError('Your new password must be at least 12 characters long.');
  }
  if (next !== confirm) {
    return renderError('The new passwords did not match.');
  }
  updateAdminPassword(admin.id, next);
  destroyOtherSessions(admin.id, req.cookies?.[SESSION_COOKIE]);
  res.redirect('/admin/account?notice=password');
});

/* ------------------------------------------------------------------
   Small diagnostics help for the overview page
   ------------------------------------------------------------------ */

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function directorySize(directory) {
  try {
    return fs
      .readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .reduce((total, entry) => {
        try {
          return total + fs.statSync(path.join(directory, entry.name)).size;
        } catch {
          return total;
        }
      }, 0);
  } catch {
    return 0;
  }
}

adminRouter.get('/system', (req, res) => {
  const databaseSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
  const memory = process.memoryUsage();
  res.render('admin/system', {
    active: 'system',
    pageTitle: 'System information',
    hasChanges: hasUnpublishedChanges(),
    notice: noticeFor(req),
    dbPath,
    dataDir,
    uploadDir,
    databaseSize: formatBytes(databaseSize),
    uploadsSize: formatBytes(directorySize(uploadDir)),
    nodeVersion: process.version,
    platform: `${process.platform} (${process.arch})`,
    uptime: process.uptime(),
    memoryUsed: formatBytes(memory.rss),
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    mediaCount: listMedia().length,
    contentMeta: getContentMeta(),
  });
});
