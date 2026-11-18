#!/usr/bin/env node
/**
 * Build a single, self-contained HTML copy of the public website.
 *
 * The output (rock-bottom.html) has the CSS, fonts, photography and JavaScript
 * embedded, so it can be double-clicked, emailed or uploaded to any static host.
 *
 * The public site must be running while this script runs, because the HTML is
 * taken from the rendered pages (so it uses the currently published content):
 *
 *   npm start
 *   npm run build:html
 *
 * The standalone copy is read-only: there is no administrator dashboard and no
 * server-side visitor counting. Legal pages open in on-page dialogs instead.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const outputFile = path.join(root, 'rock-bottom.html');

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

async function fetchPage(route) {
  let response;
  try {
    response = await fetch(baseUrl + route);
  } catch {
    throw new Error(
      `Could not reach ${baseUrl}. Start the website first with "npm start", then run this again.`,
    );
  }
  if (!response.ok) {
    throw new Error(`${baseUrl}${route} returned HTTP ${response.status}.`);
  }
  return response.text();
}

function dataUri(file, mime) {
  const bytes = fs.readFileSync(path.join(root, file));
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function legalContent(pageHtml) {
  const h1 = pageHtml.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]?.trim() || 'Information';
  const intro = pageHtml.match(/<p class="page-intro">([\s\S]*?)<\/p>/)?.[1]?.trim() || '';
  const updated = pageHtml.match(/<p class="page-updated">([\s\S]*?)<\/p>/)?.[1]?.trim() || '';
  let article = pageHtml.match(/<article class="legal-article reveal">([\s\S]*?)<\/article>/)?.[1] || '';

  article = article
    .replace(/<p class="legal-return">[\s\S]*?<\/p>/g, '')
    .replace(/<section class="legal-block" id="section-\d+">/g, '<section class="legal-block">')
    .trim();

  return { h1, intro, updated, article };
}

function legalDialog(id, label, content) {
  const closeIcon =
    '<svg class="icon " aria-hidden="true" focusable="false"><use href="#i-close"></use></svg>';
  const arrowIcon =
    '<svg class="icon " aria-hidden="true" focusable="false"><use href="#i-arrow-right"></use></svg>';

  return `
<dialog class="helper-dialog legal-dialog" id="${id}" aria-labelledby="${id}-title">
  <div class="dialog-inner">
    <form method="dialog" class="dialog-close-form">
      <button class="dialog-close" type="submit" aria-label="Close ${escapeAttribute(label)}">${closeIcon}</button>
    </form>
    <p class="eyebrow eyebrow-dark"><span class="eyebrow-line" aria-hidden="true"></span>Important information</p>
    <h2 id="${id}-title">${content.h1}</h2>
    <p class="page-intro">${content.intro}</p>
    <p class="page-updated">${content.updated}</p>
    <article class="legal-article">${content.article}</article>
    <p class="legal-return"><a class="text-link" href="#" data-close-dialog>Close this window ${arrowIcon}</a></p>
  </div>
</dialog>`;
}

const extraScript = `
(() => {
  'use strict';

  /* Legal information dialogs (static copy only) */
  const legalDialogs = Array.from(document.querySelectorAll('dialog.legal-dialog'));

  document.querySelectorAll('[data-open-legal]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.getElementById(link.getAttribute('data-open-legal'));
      if (!target) return;
      if (typeof target.showModal === 'function') target.showModal();
      else target.setAttribute('open', '');
      document.body.classList.add('dialog-open');
    });
  });

  legalDialogs.forEach((dialog) => {
    dialog.querySelectorAll('[data-close-dialog]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        dialog.close();
      });
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
    });
  });

  /* Honest local visit count: no server, nothing leaves the device. */
  const targets = document.querySelectorAll('[data-local-visits]');
  if (targets.length) {
    try {
      const totalKey = 'rb_static_visits';
      const sessionKey = 'rb_static_counted';
      let total = Number(localStorage.getItem(totalKey)) || 0;
      if (!sessionStorage.getItem(sessionKey)) {
        total += 1;
        localStorage.setItem(totalKey, String(total));
        sessionStorage.setItem(sessionKey, '1');
      }
      targets.forEach((target) => {
        target.textContent = String(total);
      });
    } catch {
      targets.forEach((target) => {
        target.textContent = '1';
      });
    }
  }
})();`;

const legalCss = `
    /* Standalone copy: the feedback form needs the server. */
    .helpful-card {
      display: none;
    }

    /* Standalone copy: legal pages appear in paper-coloured dialogs. */
    .legal-dialog {
      width: min(100% - 32px, 900px);
    }
    .legal-dialog .dialog-inner > h2 {
      font-size: clamp(2rem, 4vw, 2.8rem);
    }
    .legal-dialog .legal-article {
      max-width: none;
      margin-top: 26px;
    }
    .legal-dialog .page-intro {
      color: rgba(11, 36, 41, 0.7);
    }
    .legal-dialog .page-updated,
    .legal-dialog .legal-number {
      color: #56786b;
    }
    .legal-dialog .legal-block {
      padding-bottom: 28px;
    }
    .legal-dialog .legal-block + .legal-block {
      padding-top: 26px;
      border-top-color: rgba(11, 36, 41, 0.12);
    }
    .legal-dialog .legal-block p {
      color: rgba(11, 36, 41, 0.72);
    }
    .legal-dialog .legal-return {
      border-top-color: rgba(11, 36, 41, 0.12);
    }
    @media (max-width: 720px) {
      .legal-dialog .legal-article {
        margin-top: 20px;
      }
    }`;

async function build() {
  const [homeHtml, disclaimerHtml, privacyHtml] = await Promise.all([
    fetchPage('/'),
    fetchPage('/disclaimer'),
    fetchPage('/privacy'),
  ]);

  const css = read('public/css/styles.css').replace(
    /url\('(\/fonts\/[^']+)'\)/g,
    (match, fontPath) => `url('${dataUri(path.join('public', fontPath.replace(/^\//, '')), 'font/woff2')}')`,
  );
  const mainJs = read('public/js/main.js');
  const favicon = dataUri('public/favicon-192.png', 'image/png');

  const images = new Map();
  const embedImage = (src) => {
    if (!images.has(src)) {
      const file = path.join('public', src.replace(/^\//, ''));
      const mime = src.endsWith('.svg')
        ? 'image/svg+xml'
        : src.endsWith('.png')
          ? 'image/png'
          : 'image/jpeg';
      images.set(src, dataUri(file, mime));
    }
    return images.get(src);
  };

  let html = homeHtml;

  /* Remove URLs and preloads that only make sense on a server. */
  html = html
    .replace(/\s*<link rel="canonical"[^>]*>/g, '')
    .replace(/\s*<meta property="og:url"[^>]*>/g, '')
    .replace(/\s*<meta property="og:image"[^>]*>/g, '')
    .replace(/\s*<meta name="twitter:image"[^>]*>/g, '')
    .replace(/\s*<link rel="preload"[^>]*>/g, '');

  /* Embed fonts, stylesheet, favicon and photography. */
  html = html
    .replace('<link rel="stylesheet" href="/css/styles.css">', `<style>\n${css}\n${legalCss}\n  </style>`)
    .replace(/href="\/favicon-192\.png"/g, `href="${favicon}"`)
    .replace(/src="(\/images\/[^"]+)"/g, (match, src) => `src="${embedImage(src)}"`);

  /* Give the page a top anchor and keep every internal link local. */
  html = html
    .replace('<body class="page-home">', '<body class="page-home" id="top">')
    .replace(/href="\/disclaimer"/g, 'href="#legal-disclaimer" data-open-legal="legal-disclaimer"')
    .replace(/href="\/privacy"/g, 'href="#legal-privacy" data-open-legal="legal-privacy"')
    .replace(/href="\/faq"/g, 'href="https://rockbottomsupport.org/faq" target="_blank" rel="noopener noreferrer"')
    .replace(/href="\/#support"/g, 'href="#support"')
    .replace(/href="\/#emergency"/g, 'href="#emergency"')
    .replace(/href="\/"/g, 'href="#top"');

  /* Replace the server-side count with a local, device-only count. */
  html = html.replace(
    /<div class="visitor-strip">[\s\S]*?<\/div>\s*<\/div>/,
    `<div class="visitor-strip">
  <div class="container">
    <p><svg class="icon " aria-hidden="true" focusable="false"><use href="#i-eye"></use></svg> Visits on this device: <strong data-local-visits>1</strong> <span class="visitor-note">Counted once per browser session. Stored only on your device.</span></p>
  </div>
</div>`,
  );

  /* Remove the dashboard link from the footer. */
  html = html.replace(/\s*<a href="\/admin" rel="nofollow">Admin<\/a>/, '');

  /* Build the legal dialogs from the real legal pages. */
  const dialogs =
    legalDialog('legal-disclaimer', 'disclaimer', legalContent(disclaimerHtml)) +
    legalDialog('legal-privacy', 'privacy', legalContent(privacyHtml));

  html = html.replace('</main>', `</main>\n${dialogs}`);

  /* Inline the site script and the standalone-only behaviour. */
  html = html.replace(
    '<script src="/js/main.js" defer></script>',
    `<script>\n${mainJs}\n${extraScript}\n</script>`,
  );

  /* The static copy has no admin or preview state. */
  html = html.replace(/<div class="preview-banner"[\s\S]*?<\/div>\s*<\/div>/, '');

  html = html.replace(
    '<!DOCTYPE html>',
    '<!DOCTYPE html>\n<!-- Standalone copy of Rock Bottom - The Way Back. Open directly in a browser. -->',
  );

  fs.writeFileSync(outputFile, `${html.trimEnd()}\n`, 'utf8');

  const sizeMb = (fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2);
  console.log('');
  console.log('Standalone HTML built.');
  console.log(`  File: ${outputFile}`);
  console.log(`  Size: ${sizeMb} MB (all styles, fonts, images and scripts embedded)`);
  console.log('');
  console.log('Open it by double-clicking, or upload it to any static host.');
  console.log('The admin dashboard and server-side visitor counting are not included.');
  console.log('');
}

build().catch((error) => {
  console.error(`\nBuild failed: ${error.message}\n`);
  process.exitCode = 1;
});
