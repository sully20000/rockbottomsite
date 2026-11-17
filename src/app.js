import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { getSession, constantTimeEqual } from './auth.js';
import { getContent } from './db.js';
import {
  dailyMessage,
  formatDate,
  formatNumber,
  safeActionHref,
  safeImage,
  safePhoneHref,
  safeUrl,
  smsHref,
} from './content-utils.js';
import { ICON_LABELS, ICON_NAMES, icon } from './icons.js';
import { publicRouter } from './public-routes.js';
import { adminRouter } from './admin-routes.js';
import { root } from './db.js';

const isProd = process.env.NODE_ENV === 'production';
const uploadDir = path.join(root, 'uploads');
mkdirSync(uploadDir, { recursive: true });

export const app = express();

app.disable('x-powered-by');
if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}
app.set('view engine', 'ejs');
app.set('views', path.join(root, 'views'));
app.set('view cache', isProd);

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  fontSrc: ["'self'"],
  connectSrc: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  objectSrc: ["'none'"],
};
if (isProd) cspDirectives.upgradeInsecureRequests = [];

app.use(
  helmet({
    contentSecurityPolicy: { directives: cspDirectives },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: isProd ? { maxAge: 15552000, includeSubDomains: false } : false,
  }),
);
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  );
  next();
});
app.use(compression());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '512kb' }));

app.use(
  '/uploads',
  express.static(uploadDir, {
    index: false,
    dotfiles: 'deny',
    maxAge: isProd ? '7d' : 0,
    immutable: false,
    setHeaders(res) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
    },
  }),
);

app.use(
  express.static(path.join(root, 'public'), {
    index: false,
    dotfiles: 'deny',
    maxAge: isProd ? '7d' : 0,
    setHeaders(res, filePath) {
      if (/\.(woff2|jpg|png|webp|svg)$/.test(filePath)) {
        res.setHeader('Cache-Control', isProd ? 'public, max-age=604800' : 'no-cache');
      }
    },
  }),
);

app.use((req, res, next) => {
  res.locals.icon = icon;
  res.locals.formatNumber = formatNumber;
  res.locals.formatDate = formatDate;
  res.locals.safeImage = safeImage;
  res.locals.safeUrl = safeUrl;
  res.locals.safeActionHref = safeActionHref;
  res.locals.safePhoneHref = safePhoneHref;
  res.locals.smsHref = smsHref;
  res.locals.dailyMessage = dailyMessage;
  res.locals.ICON_NAMES = ICON_NAMES;
  res.locals.ICON_LABELS = ICON_LABELS;

  res.locals.admin = null;
  res.locals.session = null;
  res.locals.preview = false;
  res.locals.isHome = false;
  res.locals.solidHeader = false;
  res.locals.pageTitle = '';
  res.locals.pageDescription = '';
  res.locals.canonicalUrl = '';
  res.locals.ogImage = '';
  res.locals.noindex = false;
  res.locals.bodyClass = '';
  res.locals.preloadImage = '';
  res.locals.canInlineEdit = false;
  res.locals.editing = false;
  res.locals.dailyIndex = 0;
  res.locals.helpfulCount = 0;
  res.locals.helpfulVoted = false;
  res.locals.editAttr = (path) => {
    if (!res.locals.canInlineEdit) return '';
    const safe = String(path).replace(/[^A-Za-z0-9_.-]/g, '');
    return safe ? ` data-edit="${safe}"` : '';
  };

  const token = req.cookies?.rb_admin;
  if (token) {
    const session = getSession(token);
    if (session) {
      req.adminSession = session;
      res.locals.session = session;
      res.locals.admin = {
        id: session.admin_id,
        username: session.username,
      };
    } else {
      res.clearCookie('rb_admin', { path: '/' });
    }
  }

  if (!res.locals.csrfToken) {
    if (req.adminSession) {
      res.locals.csrfToken = req.adminSession.csrf_token;
    } else {
      let csrf = req.cookies?.rb_csrf;
      if (typeof csrf !== 'string' || !/^[A-Za-z0-9_-]{20,80}$/.test(csrf)) {
        csrf = crypto.randomBytes(24).toString('base64url');
        res.cookie('rb_csrf', csrf, {
          httpOnly: true,
          sameSite: 'lax',
          secure: req.secure,
          path: '/',
          maxAge: 12 * 60 * 60 * 1000,
        });
      }
      res.locals.csrfToken = csrf;
    }
  }
  req.csrfToken = res.locals.csrfToken;
  next();
});

function csrfFailure(req, res) {
  res.status(403);
  try {
    const content = getContent('published');
    res.locals.content = content;
    res.locals.dailyText = dailyMessage(content.daily.messages);
    res.locals.origin = `${req.protocol}://${req.get('host')}`;
    res.locals.visitorCount = null;
    res.render('error', {
      code: '403',
      title: 'That request could not be verified',
      message:
        'For your security, the form has expired or the request did not come from this website. Please go back, refresh the page and try again.',
    });
  } catch {
    res.type('text/plain').send('Forbidden');
  }
}

app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.is('multipart/form-data')) return next();
  const supplied = req.body?._csrf;
  if (!constantTimeEqual(supplied, req.csrfToken)) return csrfFailure(req, res);
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

app.use('/admin', adminRouter);
app.use('/', publicRouter);

app.use((req, res) => {
  const content = getContent('published');
  res.status(404);
  res.locals.content = content;
  res.locals.dailyText = dailyMessage(content.daily.messages);
  res.locals.origin = `${req.protocol}://${req.get('host')}`;
  res.locals.visitorCount = null;
  res.render('error', {
    code: '404',
    title: 'This page has wandered off',
    message:
      'The page you are looking for does not exist, or it may have moved. You have not done anything wrong. Let’s get you back to somewhere steady.',
  });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  if (req.path.startsWith('/admin')) {
    return res.status(500).type('text/plain').send('An unexpected error occurred. Please try again.');
  }
  try {
    const content = getContent('published');
    res.status(500);
    res.locals.content = content;
    res.locals.dailyText = dailyMessage(content.daily.messages);
    res.locals.origin = `${req.protocol}://${req.get('host')}`;
    res.locals.visitorCount = null;
    res.render('error', {
      code: '500',
      title: 'Something went wrong for a moment',
      message:
        'The page could not load just now. This is not your fault. Please try again in a moment, or use the support links below if you need someone to talk to.',
    });
  } catch {
    res.status(500).type('text/plain').send('Internal Server Error');
  }
});

export { isProd };
