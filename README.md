# Rock Bottom – The Way Back

A calm, hopeful mental health support website with a secure, password-protected content dashboard. The public site is a single long-form homepage plus legal pages. Everything visitors read — every heading, symptom, step, daily message, support number, emergency card, colour and footer line — can be edited from the admin area without touching code.

The design is deliberately warm rather than clinical: deep navy and forest green, soft blue, warm paper, serif headlines and nature photography.

> **This website is a source of support and information, not a crisis service and not a diagnosis.** If someone is in immediate danger, call **999** or go to A&E. For urgent mental health support in England, use **NHS 111** and choose the mental health option. All support details shown on the site should be re-checked against each organisation's official website before launch and periodically afterwards.

---

## Contents

- [What is included](#what-is-included)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Standalone HTML copy](#standalone-html-copy)
- [First-time setup](#first-time-setup)
- [Using the dashboard](#using-the-dashboard)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Backups and restore](#backups-and-restore)
- [Deployment](#deployment)
- [Security model](#security-model)
- [Visitor statistics and privacy](#visitor-statistics-and-privacy)
- [Project structure](#project-structure)
- [Editing safely](#editing-safely)
- [Accessibility and performance](#accessibility-and-performance)
- [Troubleshooting](#troubleshooting)
- [Credits](#credits)

---

## What is included

**Public website**

- Full-bleed hero with smooth scrolling into the opening “about me” letter.
- An “I don't know where to start” dialog with three gentle routes: talk to someone, immediate support, and one small first step.
- A text-support shortcut for anyone who does not feel like talking on the phone: text SHOUT to 85258.
- Visible disclaimer, symptoms that are explicitly not a diagnosis, and a safety note about medication.
- Ten practical steps, written as expandable cards.
- An anonymous “This helped me” thumbs-up under the steps, counted once per device.
- A daily message that changes automatically each day.
- A questions page with practical answers and direct links to the right support or emergency section.
- Five UK support organisations with call, text and website links.
- A prominent emergency section for 999, A&E and NHS 111.
- A clearly labelled, independently operated community link that opens in a new tab.
- An optional Ko-fi donation card for hosting and running costs. Nothing on the site is locked behind a donation.
- A gentle, optional faith invitation to ask Jesus for help, with an external link to related Bible verses. It is explicitly not a requirement and not a substitute for professional or emergency care.
- A persistent, privacy-respecting visitor counter.
- Disclaimer and privacy pages.
- Responsive navigation, reduced-motion support, skip link, focus styles and semantic landmarks.
- SEO metadata, Open Graph tags, canonical URLs, `robots.txt` and `sitemap.xml`.

**Admin dashboard**

- Secure sign-in with server-side sessions and CSRF protection.
- Draft and published versions of the content, with preview, publish and discard.
- Separate editors for the homepage, symptoms, steps, daily messages, support organisations, emergency cards, community section, questions page, design palette and legal/footer pages.
- Owner-only on-page editing: signed-in administrators can edit text directly on the draft preview, then save and publish.
- Media library with validated image uploads (JPEG, PNG, WebP, AVIF, up to 8MB, up to 10 at once).
- Anonymous visitor statistics and a 14-day chart.
- Account page for changing the password.
- System information for deployment checks.
- All editing routes are protected on the server. The public site is entirely read-only.

---

## Requirements

- **Node.js 24 or newer** (developed and tested on Node 26). The site uses the built-in `node:sqlite` module, so there is no native database dependency to compile.
- npm 10 or newer.
- A persistent disk for `data/` and `uploads/`.
- For production: HTTPS via a reverse proxy such as Nginx, Caddy or a platform load balancer.

No external services, CDNs, analytics providers or databases are required. Fonts and photography are served locally.

---

## Quick start

```bash
npm install
npm start
```

Open <http://localhost:3000>. On first start the server creates `data/rockbottom.db`, seeds the published content and prints a one-time setup address to the console.

For development with automatic restart on file changes:

```bash
npm run dev
```

---

## Standalone HTML copy

If you want a single file that runs without Node.js, generate a self-contained copy:

```bash
npm run build:html
```

While the website is running, this writes **`rock-bottom.html`** in the project folder. Styles, both fonts, every photograph, the favicon and the JavaScript are embedded, so the file opens by double-clicking and can be emailed or uploaded to any static host.

For a static host, rename it to `index.html` so it loads at the root address.

The copy is **read-only**:

- The public pages, support details, emergency section and “where to start” dialog all work.
- The disclaimer and privacy pages open in on-page windows instead of separate URLs.
- There is no admin dashboard, no SQLite storage and no server-side visitor counting. The visitor strip instead shows visits on that device, stored locally.
- The thumbs-up feedback card is hidden because its counter needs the server.
- The questions page link opens the live website.
- To change the content of the standalone copy, edit the live site and run `npm run build:html` again.

Keep the full Node app for the editable, password-protected version.

---

## First-time setup

1. Start the server and look for the **First-time setup** block in the console. It contains a URL like:

   ```text
   http://localhost:3000/admin/setup?token=…
   ```

   The same token is written to `data/setup-token.txt`. You can also supply your own token before the first start with `ADMIN_SETUP_TOKEN`.

2. Open that address and create the administrator account. The username may contain letters, numbers, dots, dashes and underscores. The password must be at least 12 characters — a long passphrase is best.

3. After the account is created the setup token is deleted and the hash is removed from the database. `/admin/setup` will redirect to the sign-in page from then on.

4. Sign in at `/admin/login`.

If you prefer to create the account from the command line instead:

```bash
npm run create-admin
```

This prompts for a username and password. The environment variables `ADMIN_USERNAME` and `ADMIN_PASSWORD` can be used for unattended provisioning.

### Forgotten password

```bash
npm run create-admin -- --username your-username --reset
```

This sets a new password, clears any lockout, and ends existing sessions. The running server picks up the new password immediately.

---

## Using the dashboard

The dashboard is at `/admin`. The workflow is deliberately simple:

1. **Edit** any section. Saving writes to the **draft** only.
2. **Preview draft** opens the public site using the draft content and adds `noindex` so it cannot be indexed.
3. **Publish changes** copies the draft to the published version. The live site updates immediately.
4. **Discard draft** resets the draft to the published version. Unpublished edits are lost.

The sidebar always shows whether the live site matches the draft.

### Editing on the page

When you are signed in, a small **Edit this page** button appears on the public homepage and legal pages. It opens the draft preview in editing mode. Click any highlighted heading, paragraph, label or card text and type directly on the page.

- **Save draft** writes every changed field to the draft. Nothing changes publicly yet.
- **Publish** saves any remaining edits, then copies the draft to the live site.
- **Reload draft** discards unsaved changes by reloading the stored draft.
- **Stop editing** turns the outlines off; you are warned before losing unsaved changes.
- **Dashboard** returns to the full editor if you need to add, remove or reorder items.

The controls, editable markers and editor script are only included for an authenticated administrator. Visitors receive a normal read-only page with no editor markup. The save endpoint re-checks the session on the server, requires the session CSRF token, only accepts existing text fields (never colours, images, links, array lengths or prototype keys), and writes to the draft only.

### Homepage

Site name, metadata, hero copy and image, the opening letter, the disclaimer, the three “where to start” options, the optional faith invitation, the optional donation link, the closing section, and the visitor label/note.

### Symptoms section

Heading, supporting text, the important “this is not a diagnosis” note, and any number of symptom cards with icons.

### Ten steps

Heading, intro, closing line, and each step's icon, title, teaser, body paragraphs and optional safety note. Rows can be added or removed. Paragraphs are separated by line breaks. The “Did this help you today?” feedback card under the steps has editable wording and shows a genuine count of anonymous thumbs-up taps, one per device.

### Daily reminders

Background image plus 30–50 one-line messages. One is chosen deterministically from the date, so it stays the same all day and changes at midnight. Empty lines are ignored.

### Support organisations

Name, short mark, brand colour, optional logo, description, phone number, optional text support, opening hours, website and link label. Keep descriptions accurate: not every organisation is a charity, so avoid describing them as one unless verified.

**Periodically verify every phone number, opening time and website against the organisation's official page**, then update the “details checked” date in the same editor.

### Emergency support

The intro, the 999/A&E guidance, the NHS 111 guidance, and any additional emergency cards. Keep the wording direct and unambiguous.

### Community

The independently operated forum link, its description and the clear disclaimer that it is not run by this website. The public link opens in a new tab with `rel="noopener noreferrer"`.

### Design & navigation

Palette values (background, surfaces, text, muted text, accent, sage, glow, paper) and footer/navigation labels. The default palette is a fresh woodland green with soft sage and a warm sunlight accent, while the warm paper sections keep long copy readable. Changing colours changes the public site's CSS variables; use the preview to check contrast before publishing.

### Footer & legal pages

Footer text, photo credit, contact address, and the full text of the disclaimer and privacy pages. Each page is made of heading/paragraph sections that can be added, removed and reordered.

### Media library

Upload images and copy their paths into any image field. Files are checked by extension, MIME type and file signature. Use landscape photographs at least 1800px wide for backgrounds. Only upload images you have permission to use.

### Visitor statistics

Unique anonymous visitors, total page views, today's figures, a 14-day chart, and the most-viewed pages. See [Visitor statistics and privacy](#visitor-statistics-and-privacy).

---

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port. |
| `HOST` | `0.0.0.0` | Interface to bind. Use `127.0.0.1` when a reverse proxy runs on the same machine. |
| `NODE_ENV` | `development` | Set to `production` in production. Enables HSTS, view caching and long asset caching. |
| `TRUST_PROXY` | unset | Set to `1` when running behind Nginx, Caddy, a load balancer or a container platform. Required for correct `req.secure`, secure cookies and client IP rate limiting. |
| `DATA_DIR` | `./data` | Directory for the SQLite database and setup token. Must be persistent and writable. |
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded images. Must be persistent and writable. |
| `BACKUP_DIR` | `./backups` | Destination for `npm run backup`. |
| `BASE_URL` | request host | Optional canonical origin, for example `https://example.org`. Used for canonical URLs, Open Graph images, `robots.txt` and `sitemap.xml`. |
| `ADMIN_SETUP_TOKEN` | random | Optional fixed first-run setup token. Ignored once an administrator exists. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | unset | Optional input for `npm run create-admin` (not read by the web server). |

Environment variables are optional for local use. On a server, set them in a service unit or a `.env` file loaded by your process manager. **Do not commit `.env` to source control**; it is already ignored.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the production/development server. |
| `npm run dev` | Start with Node's file watcher. |
| `npm run create-admin` | Create the first administrator, or add creds interactively. |
| `npm run create-admin -- --username NAME --reset` | Reset an existing account's password. |
| `npm run backup` | Write a consistent database snapshot and copy `uploads/`. |
| `npm run build:html` | Build the read-only, self-contained `rock-bottom.html` copy. |

---

## Backups and restore

```bash
npm run backup
```

This creates `backups/rockbottom-YYYY-MM-DDTHH-MM-SS/` containing:

- `rockbottom.db` — a consistent snapshot made with SQLite `VACUUM INTO`.
- `uploads/` — every uploaded image.
- `manifest.json` — timestamp, source paths, restore steps.

Back up `data/` and `uploads/` together. The database references uploaded filenames, so restoring one without the other leaves broken images.

**Restore**

1. Stop the website.
2. Replace `data/rockbottom.db` with the backup copy. Delete `rockbottom.db-wal` and `rockbottom.db-shm` if they exist.
3. Replace `uploads/` with the backup's `uploads/`.
4. Start the website and check the homepage, media library and a draft preview.

Keep at least one recent copy off the server. Test a restore before you need one.

---

## Deployment

### 1. Prepare the server

- Install Node.js 24+.
- Create a dedicated, unprivileged user for the site.
- Put the project somewhere the user can read and write, for example `/srv/rock-bottom`.
- Run `npm ci --omit=dev`.
- Ensure `data/` and `uploads/` are writable by that user and are on persistent storage.

### 2. Run with production settings

```bash
NODE_ENV=production \
TRUST_PROXY=1 \
HOST=127.0.0.1 \
PORT=3000 \
DATA_DIR=/srv/rock-bottom/data \
node server.js
```

`TRUST_PROXY=1` is essential behind a proxy: without it Express cannot tell that the original request used HTTPS, so the admin session cookie will not be marked `Secure`, and login rate limiting will see the proxy's address for every visitor.

### 3. Terminate HTTPS

Never expose the Node process directly on port 80/443. Use Nginx, Caddy, Traefik or your platform's TLS termination, with a valid certificate (for example Let's Encrypt).

**Nginx example**

```nginx
server {
    listen 80;
    server_name example.org www.example.org;
    return 301 https://example.org$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.org;

    ssl_certificate     /etc/letsencrypt/live/example.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 60s;
    }
}
```

**systemd example** (`/etc/systemd/system/rock-bottom.service`)

```ini
[Unit]
Description=Rock Bottom – The Way Back
After=network.target

[Service]
Type=simple
User=rockbottom
WorkingDirectory=/srv/rock-bottom
Environment=NODE_ENV=production
Environment=TRUST_PROXY=1
Environment=HOST=127.0.0.1
Environment=PORT=3000
Environment=DATA_DIR=/srv/rock-bottom/data
ExecStart=/usr/bin/node /srv/rock-bottom/server.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/srv/rock-bottom/data /srv/rock-bottom/uploads

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now rock-bottom
sudo systemctl status rock-bottom
```

### 4. Container deployment (optional)

A `Dockerfile` is included. Mount persistent volumes for the database and uploads:

```bash
docker build -t rock-bottom .
docker run -d \
  --name rock-bottom \
  -p 127.0.0.1:3000:3000 \
  -e NODE_ENV=production \
  -e TRUST_PROXY=1 \
  -v rock-bottom-data:/app/data \
  -v rock-bottom-uploads:/app/uploads \
  rock-bottom
```

Read the setup URL from the container logs (`docker logs rock-bottom`), create the administrator account, then put HTTPS in front of it. Back up the volumes, not the container.

### 5. Launch checklist

- [ ] HTTPS works and redirects HTTP to HTTPS.
- [ ] `NODE_ENV=production` and `TRUST_PROXY=1` are set.
- [ ] Administrator password is long, unique and stored in a password manager.
- [ ] Setup token created during installation has been deleted (automatic after account creation).
- [ ] `data/` and `uploads/` are on persistent storage and included in backups.
- [ ] A test restore of a backup has succeeded.
- [ ] All five support organisations have been checked against their official sites.
- [ ] The disclaimer and privacy page read correctly.
- [ ] The homepage, menu and “where to start” dialog have been tried on a phone.
- [ ] Call and text links open the dialler/SMS app correctly.

---

## Security model

- **Passwords** are hashed with `scrypt` (N=16384, r=8, p=1, 64-byte output, random 16-byte salt) and compared with `timingSafeEqual`.
- **Sessions** are random 32-byte tokens stored only as SHA-256 hashes in SQLite. The cookie is `HttpOnly`, `SameSite=Lax`, `Secure` when the request is HTTPS, and expires after 12 hours. Expired sessions are pruned on login.
- **CSRF**: every state-changing form carries a per-session token, checked server-side with a constant-time comparison. Multipart uploads are checked separately after parsing.
- **Authorisation** is enforced by middleware on the server. Hiding buttons in the browser is never used as protection.
- **Login protection**: ten attempts per IP per 15 minutes, plus a 15-minute account lock after eight failed attempts for a known username. Unknown usernames still perform a dummy hash to reduce timing differences.
- **Setup** is only possible before the first administrator exists, and requires a one-time random token that is deleted after use.
- **Uploads** are limited to 8MB, ten files at once, with extension, MIME and file-signature checks. Files are stored under randomised names. Scripts cannot be executed from `uploads/`.
- **Headers**: Helmet with a strict Content Security Policy (`script-src 'self'`, no inline scripts), `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, MIME sniffing protection, a strict referrer policy and HSTS in production.
- **No third-party requests**: fonts and images are local, so visitor data is not shared with a CDN or analytics service.

This is a single-administrator site by design. If you need multiple editors with different permissions, add roles and per-route checks rather than sharing one account.

---

## Visitor statistics and privacy

The counter is intentionally simple and privacy-respecting.

- A first-party cookie (`rb_visitor`) holds a random anonymous token.
- The server stores only a SHA-256 hash of that token, the first and last seen times, and a page-view row containing the hashed token, page path and timestamp.
- **No IP address, user agent, name, email, location or fingerprint is stored** in the visitor tables.
- A thumbs-up uses the same anonymous hash, stored in a separate `helpful_votes` table with a timestamp. One device can add one vote; refreshing or pressing again does not increase the count.
- Refreshing adds page views but does not increase the unique visitor total.
- Requests with obvious bot/crawler user agents are ignored.
- An administrator's own visits are counted like anyone else's. Use a separate browser profile if you want a clean baseline.
- Deleting the database resets the count. It survives restarts and deployments as long as `data/` does.

The count is approximate: one person using two devices, or clearing cookies, may be counted twice; a shared device may be counted once. It is presented as a warm sign that others have been here, not as an analytics product.

This approach avoids analytics cookies and personal data. Still, keep the privacy page honest about the anonymous cookie and storage, and check whether your jurisdiction requires a cookie notice for strictly functional first-party cookies.

---

## Project structure

```text
.
├── server.js                 HTTP server, startup log, graceful shutdown
├── rock-bottom.html          Self-contained read-only copy (generated)
├── package.json
├── data/                     SQLite database (created at runtime, git-ignored)
├── uploads/                  Uploaded images (git-ignored except .gitkeep)
├── public/
│   ├── css/styles.css        Public design system
│   ├── css/admin.css         Dashboard design system
│   ├── js/main.js            Public navigation, dialog, reveal effects
│   ├── js/inline-edit.js     Owner-only on-page editor
│   ├── js/admin.js           Sidebar, repeaters, previews, uploads, copy buttons
│   ├── images/               Built-in nature photography
│   ├── fonts/                Local Fraunces and Manrope WOFF2 files
│   └── favicon-192.png
├── scripts/
│   ├── create-admin.js       Create or reset an administrator
│   ├── backup.js             Database snapshot plus uploads
│   └── build-standalone.js   Build the single-file HTML copy
├── src/
│   ├── app.js                Express setup, security headers, CSRF, locals
│   ├── auth.js               Password hashing, sessions, lockouts
│   ├── db.js                 SQLite schema, content, visitors, feedback, media
│   ├── default-content.js    All seeded copy and theme values
│   ├── content-editors.js    Sanitising for every editable section
│   ├── inline-edit.js        Path validation for on-page edits
│   ├── content-utils.js      Text, URL, phone, image and formatting helpers
│   ├── icons.js              Inline SVG icon set
│   ├── public-routes.js      Public pages, visitor counting, SEO routes
│   └── admin-routes.js       Auth, editors, preview, publish, media, stats
└── views/
    ├── home.ejs              Public homepage
    ├── page.ejs              Legal pages
    ├── faq.ejs               Questions and signposting page
    ├── error.ejs             403/404/500 page
    ├── admin/                Dashboard and editor templates
    └── partials/             Headers, footers, sidebar, icons, image field
```

Content lives in a single JSON document with separate `draft_json` and `published_json` columns. Publishing copies draft to published. The public site reads only `published_json`; previews read `draft_json` and are marked `noindex`.

---

## Editing safely

- Keep the tone personal, specific and hopeful. Avoid promising recovery, diagnosing anyone, or implying that a support organisation is a crisis service unless it says so.
- Do not describe every organisation as a charity. Check each one's official wording.
- Support numbers and opening hours change. Put a recurring reminder in your calendar to verify all five, and check the NHS 111 and emergency wording at the same time.
- Use images you have permission to use. The built-in photographs are credited to Unsplash; update the credit in **Footer & legal pages** if you replace them.
- Changing colours can reduce text contrast. Preview before publishing and keep body text comfortably readable.
- The site is designed to work without JavaScript for reading and for the standard admin forms. JavaScript adds the mobile menu, dialog, repeaters, upload previews and the on-page editor; the on-page editor itself requires JavaScript.

---

## Accessibility and performance

- Semantic landmarks, a skip link, visible focus styles and logical heading order.
- The mobile menu, dialog and admin drawer manage `aria-expanded`, labels, Escape and focus return.
- `prefers-reduced-motion` disables reveal animations and smooth transitions.
- Call and text links use `tel:` and `sms:` URLs; external links use `rel="noopener noreferrer"`.
- Images have alt text fields in the dashboard; decorative images use empty alt text.
- Local fonts are preloaded, images are lazy-loaded below the fold, CSS is compressed, and assets are cached in production.
- No client-side framework, database server or third-party script is required.

---

## Troubleshooting

**“Port 3000 is already in use.”** Stop the other process or start with `PORT=3001 npm start`.

**Login succeeds but immediately redirects back to the sign-in page.** The session cookie is probably being rejected because the site is behind HTTPS but `TRUST_PROXY` is not set. Set `TRUST_PROXY=1` and restart.

**The setup page says the token is invalid.** Use the token from the console or `data/setup-token.txt` exactly. If an administrator already exists, setup is disabled; use `/admin/login` or `npm run create-admin -- --username NAME --reset`.

**Uploads fail.** Check the file is JPEG, PNG, WebP or AVIF, under 8MB, and that `uploads/` is writable. Check the proxy's `client_max_body_size`; the example allows 12MB.

**Content changes are not visible.** Saving writes a draft. Press **Publish changes**. Check the sidebar's draft status.

**The visitor count is zero.** It only counts public pages requested with a browser-like user agent. Bot/preview requests are ignored. Load `/` in a normal browser, then check **Visitor statistics**.

**`node:sqlite` warnings appear.** Node 24+ supports the module; use a current Node 24 or 26 release. On very old Node versions the module is unavailable.

**Everything looks unstyled after deployment.** Confirm the app is serving `/css/styles.css` and that your proxy passes requests for `/css`, `/js`, `/images` and `/fonts` through to Node. The CSP forbids external styles.

---

## Credits

- Photography via [Unsplash](https://unsplash.com), stored locally.
- Typefaces: **Fraunces** and **Manrope**, both licensed under the SIL Open Font License and stored locally.
- Icons: original inline SVG set included with the project.

Support organisation names, numbers and hours belong to those organisations. Verify them directly before publishing:

- Samaritans — 116 123, free, 24/7.
- Mind — 0300 102 1234, Monday–Friday 9am–6pm excluding bank holidays.
- CALM — 0800 58 58 58, daily 5pm–midnight.
- Shout — text SHOUT to 85258, 24/7.
- SANE — 0300 304 7000, daily 4pm–10pm.

For immediate danger: **999** or A&E. For urgent mental health support in England: **NHS 111**, mental health option.
