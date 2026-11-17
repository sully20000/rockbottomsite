import express from 'express';
import crypto from 'node:crypto';
import {
  addHelpfulVote,
  getContent,
  getContentMeta,
  hasHelpfulVote,
  helpfulVoteCount,
  recordPageView,
  touchVisitor,
  uniqueVisitorCount,
} from './db.js';
import { sha256 } from './auth.js';
import { dailyMessage, dailyMessageIndex, safeImage } from './content-utils.js';

export const publicRouter = express.Router();

const BOT_RE = /bot|crawler|spider|crawl|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|discord|preview|headless|python-requests|curl|wget|node-fetch|undici/i;

// These routes are used by crawlers, monitors and the container health check.
// They must never look like a person reading the website.
const UNCOUNTED_PATHS = new Set([
  '/favicon.ico',
  '/healthz',
  '/robots.txt',
  '/sitemap.xml',
]);

function visitorCookieOptions(req) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    path: '/',
    maxAge: 365 * 24 * 60 * 60 * 1000,
  };
}

function visitorHashFrom(req, res) {
  let token = req.cookies?.rb_visitor;
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(String(token || ''))) {
    token = crypto.randomBytes(18).toString('base64url');
    res.cookie('rb_visitor', token, visitorCookieOptions(req));
  }
  return sha256(token);
}

function recordVisit(req, res, next) {
  if (req.method !== 'GET' || req.path.startsWith('/admin')) return next();
  if (UNCOUNTED_PATHS.has(req.path)) return next();
  const userAgent = req.get('user-agent') || '';
  if (!userAgent || BOT_RE.test(userAgent)) return next();

  const visitorHash = visitorHashFrom(req, res);
  req.visitorHash = visitorHash;
  try {
    recordPageView(req.path.slice(0, 160), visitorHash);
    touchVisitor(visitorHash);
    res.locals.visitorCount = uniqueVisitorCount();
  } catch (error) {
    console.error('Visitor counting failed:', error.message);
  }
  next();
}

function absoluteImage(origin, value) {
  const image = safeImage(value, '/images/hero-forest.jpg');
  if (/^https?:\/\//i.test(image)) return image;
  return `${origin}${image}`;
}

function commonLocals(req, res, content) {
  const origin =
    (process.env.BASE_URL || '').replace(/\/$/, '') ||
    `${req.protocol}://${req.get('host')}`;
  res.locals.origin = origin;
  res.locals.content = content;
  res.locals.dailyText = dailyMessage(content.daily.messages);
  res.locals.dailyIndex = dailyMessageIndex(content.daily.messages);
  res.locals.helpfulCount = helpfulVoteCount();
  res.locals.helpfulVoted = hasHelpfulVote(req.visitorHash);
  // recordVisit has already counted this request where appropriate. Reading the
  // total again here keeps the number accurate for excluded or uncounted pages.
  res.locals.visitorCount = uniqueVisitorCount();
}

publicRouter.get('/', recordVisit, (req, res) => {
  const content = getContent('published');
  commonLocals(req, res, content);
  res.locals.pageTitle = '';
  res.locals.pageDescription = content.site.metaDescription;
  res.locals.canonicalUrl = `${res.locals.origin}/`;
  res.locals.ogImage = absoluteImage(res.locals.origin, content.hero.image);
  res.locals.noindex = false;
  res.locals.bodyClass = 'page-home';
  res.locals.preview = false;
  res.locals.preloadImage = safeImage(content.hero.image, '/images/hero-forest.jpg');
  res.locals.visitorCount = res.locals.visitorCount ?? 0;
  res.render('home');
});

publicRouter.post('/helpful', (req, res) => {
  const visitorHash = visitorHashFrom(req, res);
  const result = addHelpfulVote(visitorHash);
  if (
    req.is('application/json') ||
    String(req.get('accept') || '').includes('application/json')
  ) {
    return res.json({ ok: true, ...result });
  }
  res.redirect('/#helpful');
});

publicRouter.get('/disclaimer', recordVisit, (req, res) => {
  const content = getContent('published');
  commonLocals(req, res, content);
  const page = content.pages.disclaimer;
  res.locals.pageTitle = page.title;
  res.locals.pageDescription = page.intro;
  res.locals.canonicalUrl = `${res.locals.origin}/disclaimer`;
  res.locals.ogImage = absoluteImage(res.locals.origin, content.hero.image);
  res.locals.noindex = false;
  res.locals.bodyClass = 'page-legal';
  res.locals.preview = false;
  res.render('page', { pageKey: 'disclaimer', page });
});

publicRouter.get('/privacy', recordVisit, (req, res) => {
  const content = getContent('published');
  commonLocals(req, res, content);
  const page = content.pages.privacy;
  res.locals.pageTitle = page.title;
  res.locals.pageDescription = page.intro;
  res.locals.canonicalUrl = `${res.locals.origin}/privacy`;
  res.locals.ogImage = absoluteImage(res.locals.origin, content.hero.image);
  res.locals.noindex = false;
  res.locals.bodyClass = 'page-legal';
  res.locals.preview = false;
  res.render('page', { pageKey: 'privacy', page });
});

publicRouter.get('/support', (req, res) => res.redirect(301, '/#support'));
publicRouter.get('/emergency', (req, res) => res.redirect(301, '/#emergency'));
publicRouter.get('/cookies', (req, res) => res.redirect(301, '/privacy'));

publicRouter.get('/healthz', (req, res) => {
  res.type('text/plain').send('ok');
});

publicRouter.get('/robots.txt', (req, res) => {
  const origin =
    (process.env.BASE_URL || '').replace(/\/$/, '') ||
    `${req.protocol}://${req.get('host')}`;
  res
    .type('text/plain')
    .send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\n\nSitemap: ${origin}/sitemap.xml\n`,
    );
});

publicRouter.get('/sitemap.xml', (req, res) => {
  const origin =
    (process.env.BASE_URL || '').replace(/\/$/, '') ||
    `${req.protocol}://${req.get('host')}`;
  const meta = getContentMeta();
  const lastmod = (meta.published_at || new Date().toISOString()).slice(0, 10);
  const escapeXml = (value) =>
    String(value).replace(/[<>&'"]/g, (character) => {
      const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
      return map[character];
    });
  const urls = [
    { loc: `${origin}/`, priority: '1.0' },
    { loc: `${origin}/disclaimer`, priority: '0.4' },
    { loc: `${origin}/privacy`, priority: '0.3' },
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) =>
      `  <url><loc>${escapeXml(entry.loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>${entry.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>`;
  res.type('application/xml').send(body);
});
