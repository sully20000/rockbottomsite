import {
  cleanColour,
  cleanSingleLine,
  cleanText,
  phoneFromDisplay,
  rows,
  safeActionHref,
  safeEmail,
  safeImage,
  safeUrl,
  splitLines,
  splitParagraphs,
} from './content-utils.js';
import { ICON_NAMES } from './icons.js';

function safeIcon(value, fallback) {
  return ICON_NAMES.includes(value) ? value : fallback;
}

function websiteLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function object(value) {
  return value && typeof value === 'object' ? value : {};
}

export function applyHome(content, body) {
  const c = structuredClone(content);
  const site = object(body.site);
  const hero = object(body.hero);
  const letter = object(body.letter);
  const disclaimer = object(body.disclaimer);
  const helper = object(body.startHelper);
  const closing = object(body.closing);

  c.site.name = cleanSingleLine(site.name, c.site.name, 80);
  c.site.title = cleanSingleLine(site.title, c.site.title, 120);
  c.site.metaDescription = cleanText(site.metaDescription, c.site.metaDescription, 320);
  c.site.contactEmail = safeEmail(site.contactEmail);

  c.hero.eyebrow = cleanSingleLine(hero.eyebrow, c.hero.eyebrow, 100);
  c.hero.title = cleanSingleLine(hero.title, c.hero.title, 140);
  c.hero.intro = cleanText(hero.intro, c.hero.intro, 1600);
  c.hero.primaryCta = cleanSingleLine(hero.primaryCta, c.hero.primaryCta, 80);
  c.hero.secondaryCta = cleanSingleLine(hero.secondaryCta, c.hero.secondaryCta, 80);
  c.hero.scrollLabel = cleanSingleLine(hero.scrollLabel, c.hero.scrollLabel, 140);
  c.hero.image = safeImage(hero.image, c.hero.image);
  c.hero.imageAlt = cleanSingleLine(hero.imageAlt, c.hero.imageAlt, 240);

  c.letter.eyebrow = cleanSingleLine(letter.eyebrow, c.letter.eyebrow, 100);
  c.letter.heading = cleanSingleLine(letter.heading, c.letter.heading, 180);
  c.letter.paragraphs = splitParagraphs(letter.paragraphs, c.letter.paragraphs);
  c.letter.signature = cleanSingleLine(letter.signature, c.letter.signature, 100);

  c.disclaimer.label = cleanSingleLine(disclaimer.label, c.disclaimer.label, 100);
  c.disclaimer.text = cleanText(disclaimer.text, c.disclaimer.text, 1600);
  c.disclaimer.shortText = cleanSingleLine(disclaimer.shortText, c.disclaimer.shortText, 160);

  c.startHelper.eyebrow = cleanSingleLine(helper.eyebrow, c.startHelper.eyebrow, 100);
  c.startHelper.heading = cleanSingleLine(helper.heading, c.startHelper.heading, 160);
  c.startHelper.intro = cleanText(helper.intro, c.startHelper.intro, 900);
  c.startHelper.closeLabel = cleanSingleLine(helper.closeLabel, c.startHelper.closeLabel, 40);

  const optionRows = rows(helper.options);
  if (optionRows.length) {
    c.startHelper.options = optionRows.slice(0, 6).map((row, index) => {
      const current = c.startHelper.options[index] || c.startHelper.options[0];
      return {
        icon: safeIcon(row.icon, current.icon),
        title: cleanSingleLine(row.title, current.title, 80),
        text: cleanText(row.text, current.text, 600),
        actionLabel: cleanSingleLine(row.actionLabel, current.actionLabel, 70),
        actionHref: safeActionHref(row.actionHref, current.actionHref),
      };
    });
  }

  c.closing.eyebrow = cleanSingleLine(closing.eyebrow, c.closing.eyebrow, 100);
  c.closing.heading = cleanSingleLine(closing.heading, c.closing.heading, 180);
  c.closing.text = cleanText(closing.text, c.closing.text, 600);
  c.closing.buttonLabel = cleanSingleLine(closing.buttonLabel, c.closing.buttonLabel, 80);

  const donation = object(body.donation);
  const donationUrl = String(donation.url || '').trim();
  const donationUrlWithProtocol =
    donationUrl && !/^https?:\/\//i.test(donationUrl)
      ? `https://${donationUrl.replace(/^\/+/, '')}`
      : donationUrl;
  c.donation.eyebrow = cleanSingleLine(donation.eyebrow, c.donation.eyebrow, 100);
  c.donation.heading = cleanSingleLine(donation.heading, c.donation.heading, 180);
  c.donation.text = cleanText(donation.text, c.donation.text, 900);
  c.donation.buttonLabel = cleanSingleLine(donation.buttonLabel, c.donation.buttonLabel, 80);
  c.donation.url = safeUrl(donationUrlWithProtocol, c.donation.url);
  c.donation.note = cleanText(donation.note, c.donation.note, 500);

  return c;
}

export function applySymptoms(content, body) {
  const c = structuredClone(content);
  c.symptoms.eyebrow = cleanSingleLine(body.eyebrow, c.symptoms.eyebrow, 100);
  c.symptoms.heading = cleanSingleLine(body.heading, c.symptoms.heading, 160);
  c.symptoms.subtitle = cleanText(body.subtitle, c.symptoms.subtitle, 800);
  c.symptoms.closing = cleanText(body.closing, c.symptoms.closing, 500);
  c.symptoms.note = cleanText(body.note, c.symptoms.note, 400);

  const itemRows = rows(body.items);
  if (itemRows.length) {
    const items = itemRows
      .slice(0, 30)
      .map((row, index) => ({
        icon: safeIcon(row.icon, c.symptoms.items[index]?.icon || 'leaf'),
        title: cleanSingleLine(row.title, '', 120),
      }))
      .filter((item) => item.title);
    if (items.length) c.symptoms.items = items;
  }
  return c;
}

export function applyTips(content, body) {
  const c = structuredClone(content);
  c.tips.eyebrow = cleanSingleLine(body.eyebrow, c.tips.eyebrow, 100);
  c.tips.heading = cleanSingleLine(body.heading, c.tips.heading, 180);
  c.tips.subtitle = cleanText(body.subtitle, c.tips.subtitle, 900);
  c.tips.image = safeImage(body.image, c.tips.image);
  c.tips.imageAlt = cleanSingleLine(body.imageAlt, c.tips.imageAlt, 240);
  c.tips.closingHeading = cleanSingleLine(body.closingHeading, c.tips.closingHeading, 160);
  c.tips.closingText = cleanText(body.closingText, c.tips.closingText, 500);

  const itemRows = rows(body.items);
  if (itemRows.length) {
    const items = itemRows
      .slice(0, 20)
      .map((row, index) => {
        const current = c.tips.items[index] || {};
        const bodyParagraphs = splitParagraphs(row.body, current.body || []);
        return {
          icon: safeIcon(row.icon, current.icon || 'leaf'),
          title: cleanSingleLine(row.title, '', 140),
          summary: cleanSingleLine(row.summary, current.summary || '', 220),
          body: bodyParagraphs,
          note: cleanText(row.note, '', 500),
        };
      })
      .filter((item) => item.title && item.body.length);
    if (items.length) c.tips.items = items;
  }
  return c;
}

export function applyDaily(content, body) {
  const c = structuredClone(content);
  c.daily.eyebrow = cleanSingleLine(body.eyebrow, c.daily.eyebrow, 100);
  c.daily.heading = cleanSingleLine(body.heading, c.daily.heading, 160);
  c.daily.note = cleanSingleLine(body.note, c.daily.note, 160);
  c.daily.image = safeImage(body.image, c.daily.image);
  c.daily.imageAlt = cleanSingleLine(body.imageAlt, c.daily.imageAlt, 240);
  const messages = splitLines(body.messages, c.daily.messages).slice(0, 120);
  if (messages.length) c.daily.messages = messages;
  return c;
}

export function applySupport(content, body) {
  const c = structuredClone(content);
  c.support.eyebrow = cleanSingleLine(body.eyebrow, c.support.eyebrow, 100);
  c.support.heading = cleanSingleLine(body.heading, c.support.heading, 160);
  c.support.subtitle = cleanText(body.subtitle, c.support.subtitle, 900);
  c.support.note = cleanText(body.note, c.support.note, 900);
  c.support.checkedLabel = cleanSingleLine(body.checkedLabel, c.support.checkedLabel, 120);

  const orgRows = rows(body.organisations);
  if (orgRows.length) {
    const organisations = orgRows
      .slice(0, 16)
      .map((row, index) => {
        const current = c.support.organisations[index] || {};
        const website = safeUrl(row.website, current.website || '');
        const phone = cleanSingleLine(row.phone, current.phone || '', 40);
        const textHref = phoneFromDisplay(row.textHref ?? current.textHref ?? '');
        return {
          name: cleanSingleLine(row.name, '', 120),
          mark: cleanSingleLine(row.mark, current.mark || '', 20),
          colour: cleanColour(row.colour, current.colour || '#6f8f83'),
          logo: safeImage(row.logo, ''),
          description: cleanText(row.description, current.description || '', 800),
          phone,
          phoneHref: phoneFromDisplay(phone),
          textLabel: cleanSingleLine(row.textLabel, current.textLabel || '', 100),
          textHref,
          hours: cleanSingleLine(row.hours, current.hours || '', 180),
          website,
          websiteLabel: cleanSingleLine(
            row.websiteLabel,
            current.websiteLabel || websiteLabel(website),
            100,
          ),
        };
      })
      .filter((org) => org.name);
    if (organisations.length) c.support.organisations = organisations;
  }
  return c;
}

export function applyEmergency(content, body) {
  const c = structuredClone(content);
  c.emergency.eyebrow = cleanSingleLine(body.eyebrow, c.emergency.eyebrow, 100);
  c.emergency.heading = cleanSingleLine(body.heading, c.emergency.heading, 160);
  c.emergency.intro = cleanText(body.intro, c.emergency.intro, 1200);
  c.emergency.note = cleanText(body.note, c.emergency.note, 700);

  const cardRows = rows(body.cards);
  if (cardRows.length) {
    const cards = cardRows
      .slice(0, 8)
      .map((row, index) => {
        const current = c.emergency.cards[index] || {};
        return {
          label: cleanSingleLine(row.label, current.label || '', 120),
          value: cleanSingleLine(row.value, current.value || '', 60),
          href: safeActionHref(row.href, current.href || ''),
          actionLabel: cleanSingleLine(row.actionLabel, current.actionLabel || '', 80),
          note: cleanSingleLine(row.note, current.note || '', 180),
          external: row.external === 'on' || row.external === '1' || row.external === true,
        };
      })
      .filter((card) => card.label && card.value && card.href);
    if (cards.length) c.emergency.cards = cards;
  }
  return c;
}

export function applyCommunity(content, body) {
  const c = structuredClone(content);
  c.community.eyebrow = cleanSingleLine(body.eyebrow, c.community.eyebrow, 100);
  c.community.heading = cleanSingleLine(body.heading, c.community.heading, 160);
  c.community.paragraphs = splitParagraphs(body.paragraphs, c.community.paragraphs);
  c.community.buttonLabel = cleanSingleLine(body.buttonLabel, c.community.buttonLabel, 100);
  c.community.url = safeUrl(body.url, c.community.url);
  c.community.disclaimer = cleanText(body.disclaimer, c.community.disclaimer, 900);
  c.community.image = safeImage(body.image, c.community.image);
  c.community.imageAlt = cleanSingleLine(body.imageAlt, c.community.imageAlt, 240);
  return c;
}

export function applyDesign(content, body) {
  const c = structuredClone(content);
  const theme = object(body.theme);
  c.theme.background = cleanColour(theme.background, c.theme.background);
  c.theme.surface = cleanColour(theme.surface, c.theme.surface);
  c.theme.surfaceSoft = cleanColour(theme.surfaceSoft, c.theme.surfaceSoft);
  c.theme.ink = cleanColour(theme.ink, c.theme.ink);
  c.theme.muted = cleanColour(theme.muted, c.theme.muted);
  c.theme.accent = cleanColour(theme.accent, c.theme.accent);
  c.theme.sage = cleanColour(theme.sage, c.theme.sage);
  c.theme.glow = cleanColour(theme.glow, c.theme.glow);
  c.theme.paper = cleanColour(theme.paper, c.theme.paper);
  c.theme.paperInk = cleanColour(theme.paperInk, c.theme.paperInk);

  const nav = object(body.nav);
  c.nav.stepsLabel = cleanSingleLine(nav.stepsLabel, c.nav.stepsLabel, 60);
  c.nav.supportLabel = cleanSingleLine(nav.supportLabel, c.nav.supportLabel, 60);
  c.nav.emergencyLabel = cleanSingleLine(nav.emergencyLabel, c.nav.emergencyLabel, 60);
  c.nav.startLabel = cleanSingleLine(nav.startLabel, c.nav.startLabel, 80);
  return c;
}

function parseLegalSections(value, existing) {
  const list = rows(value)
    .slice(0, 24)
    .map((row) => ({
      heading: cleanSingleLine(row.heading, '', 140),
      paragraphs: splitParagraphs(row.paragraphs, []),
    }))
    .filter((section) => section.heading || section.paragraphs.length);
  return list.length ? list : existing;
}

export function applyPages(content, body) {
  const c = structuredClone(content);
  const footer = object(body.footer);
  c.footer.message = cleanText(footer.message, c.footer.message, 500);
  c.footer.closing = cleanText(footer.closing, c.footer.closing, 400);
  c.footer.copyright = cleanSingleLine(footer.copyright, c.footer.copyright, 120);
  c.footer.disclaimerLabel = cleanSingleLine(footer.disclaimerLabel, c.footer.disclaimerLabel, 60);
  c.footer.privacyLabel = cleanSingleLine(footer.privacyLabel, c.footer.privacyLabel, 60);
  c.footer.supportLabel = cleanSingleLine(footer.supportLabel, c.footer.supportLabel, 60);
  c.footer.forumLabel = cleanSingleLine(footer.forumLabel, c.footer.forumLabel, 80);
  c.footer.emergencyNote = cleanSingleLine(footer.emergencyNote, c.footer.emergencyNote, 180);
  c.footer.credits = cleanSingleLine(footer.credits, c.footer.credits, 160);

  c.pages.disclaimer.title = cleanSingleLine(
    body.disclaimerTitle,
    c.pages.disclaimer.title,
    80,
  );
  c.pages.disclaimer.updated = cleanSingleLine(
    body.disclaimerUpdated,
    c.pages.disclaimer.updated,
    60,
  );
  c.pages.disclaimer.intro = cleanText(
    body.disclaimerIntro,
    c.pages.disclaimer.intro,
    800,
  );
  c.pages.disclaimer.sections = parseLegalSections(
    body.disclaimerSections,
    c.pages.disclaimer.sections,
  );

  c.pages.privacy.title = cleanSingleLine(body.privacyTitle, c.pages.privacy.title, 80);
  c.pages.privacy.updated = cleanSingleLine(body.privacyUpdated, c.pages.privacy.updated, 60);
  c.pages.privacy.intro = cleanText(body.privacyIntro, c.pages.privacy.intro, 800);
  c.pages.privacy.sections = parseLegalSections(
    body.privacySections,
    c.pages.privacy.sections,
  );
  return c;
}
