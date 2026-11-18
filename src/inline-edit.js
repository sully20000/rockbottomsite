/**
 * Validation for the authenticated on-page editor.
 *
 * A change is a path such as "hero.intro" or "tips.items.2.title" plus the new
 * text. Only existing string fields in known content sections may be changed,
 * so the endpoint can never be used to add fields, alter arrays, change theme
 * colours or reach Object.prototype.
 */

const EDITABLE_ROOTS = new Set([
  'nav',
  'hero',
  'letter',
  'disclaimer',
  'startHelper',
  'symptoms',
  'tips',
  'daily',
  'support',
  'emergency',
  'community',
  'faith',
  'donation',
  'closing',
  'footer',
  'pages',
  'ui',
]);

const PAGE_KEYS = new Set(['disclaimer', 'privacy']);
const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_VALUE_LENGTH = 4000;
const MAX_PATH_LENGTH = 160;
const SEGMENT_RE = /^[A-Za-z0-9_-]{1,64}$/;
const INDEX_RE = /^\d{1,4}$/;

function fail(error) {
  return { ok: false, error };
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function cleanValue(value) {
  if (typeof value !== 'string') return null;
  const text = value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  if (text.length > MAX_VALUE_LENGTH) return null;
  return text;
}

export function applyInlineChange(content, change) {
  if (!change || typeof change !== 'object') return fail('That change was not understood.');

  const path = typeof change.path === 'string' ? change.path : '';
  if (!path || path.length > MAX_PATH_LENGTH) return fail('That field could not be found.');

  const parts = path.split('.');
  if (parts.length < 2) return fail('That field cannot be edited here.');
  if (!EDITABLE_ROOTS.has(parts[0])) return fail('That field cannot be edited here.');
  if (parts[0] === 'pages' && (!PAGE_KEYS.has(parts[1]) || parts.length < 3)) {
    return fail('That page cannot be edited here.');
  }

  for (const part of parts) {
    if (!SEGMENT_RE.test(part) || BLOCKED_KEYS.has(part)) {
      return fail('That field could not be found.');
    }
  }

  let node = content;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (Array.isArray(node)) {
      if (!INDEX_RE.test(part)) return fail('That field could not be found.');
      const arrayIndex = Number(part);
      if (arrayIndex >= node.length) return fail('That field could not be found.');
      node = node[arrayIndex];
    } else if (node && typeof node === 'object' && hasOwn(node, part)) {
      node = node[part];
    } else {
      return fail('That field could not be found.');
    }
    if (node === null || typeof node !== 'object') {
      return fail('That field could not be found.');
    }
  }

  const value = cleanValue(change.value);
  if (value === null) {
    return fail('Please enter some text (up to 4,000 characters).');
  }

  const last = parts[parts.length - 1];
  if (Array.isArray(node)) {
    if (!INDEX_RE.test(last)) return fail('That field could not be found.');
    const arrayIndex = Number(last);
    if (arrayIndex >= node.length || typeof node[arrayIndex] !== 'string') {
      return fail('That field could not be found.');
    }
    node[arrayIndex] = value;
  } else if (node && typeof node === 'object' && hasOwn(node, last) && typeof node[last] === 'string') {
    node[last] = value;
  } else {
    return fail('That field could not be found.');
  }

  return { ok: true, path, value };
}
