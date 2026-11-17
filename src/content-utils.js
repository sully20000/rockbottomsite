export function cleanText(value, fallback = '', maxLength = 8000) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.replace(/\r\n/g, '\n').trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

export function cleanSingleLine(value, fallback = '', maxLength = 400) {
  const text = cleanText(value, fallback, maxLength);
  return text.replace(/\s+/g, ' ').trim();
}

export function splitParagraphs(value, fallback = []) {
  if (typeof value !== 'string') return fallback;
  const paragraphs = value
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 120);
  return paragraphs.length ? paragraphs : fallback;
}

export function splitLines(value, fallback = []) {
  if (typeof value !== 'string') return fallback;
  const lines = value
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 250);
  return lines.length ? lines : fallback;
}

export function rows(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === 'object');
  }
  if (typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => value[key])
      .filter((item) => item && typeof item === 'object');
  }
  return [];
}

export function cleanColour(value, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback;
}

export function safeUrl(value, fallback = '#') {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (raw.startsWith('#')) return raw;
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function safePhoneHref(value, fallback = '') {
  const raw = String(value || '').trim();
  const cleaned = raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  if (!cleaned) return fallback;
  return `tel:${cleaned}`;
}

export function phoneFromDisplay(value) {
  return String(value || '').replace(/[^\d+]/g, '');
}

export function safeActionHref(value, fallback = '#') {
  const raw = String(value || '').trim();
  if (/^(tel|sms):[+\d?=&\w.-]+$/.test(raw)) return raw;
  return safeUrl(raw, fallback);
}

export function smsHref(value, fallback = '#') {
  const digits = String(value || '').replace(/[^\d+]/g, '');
  return digits ? `sms:${digits}` : fallback;
}

export function safeImage(value, fallback = '/images/hero-forest.jpg') {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (/^\/uploads\/[a-zA-Z0-9._-]+$/.test(raw)) return raw;
  if (/^\/images\/[a-zA-Z0-9._-]+$/.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw) && safeUrl(raw, '') !== '') return raw;
  return fallback;
}

export function safeEmail(value) {
  const email = String(value || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-GB').format(Number(value) || 0);
}

export function formatDate(value, options = {}) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function dailyMessageIndex(messages) {
  if (!Array.isArray(messages) || !messages.length) return 0;
  const days = Math.floor(Date.now() / 86_400_000);
  return Math.abs(days) % messages.length;
}

export function dailyMessage(messages) {
  if (!Array.isArray(messages) || !messages.length) {
    return "You don't have to climb the whole mountain today. Just take the next step.";
  }
  return messages[dailyMessageIndex(messages)];
}

export function externalLink(url, fallback = '#') {
  const safe = safeUrl(url, fallback);
  return safe;
}

export function normalisePath(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > 160) return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}
