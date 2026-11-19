/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-split-panels (div.double-cta).
 *
 * Block table: one row, one cell per panel:
 *   panel 1 (heading link, text, CTA) | panel 2 (heading link, text, CTA)
 *
 * Doubleclick click-trackers are unwrapped to their `adurl` destination.
 */

function cleanHref(href) {
  if (!href) return href;
  try {
    const url = new URL(href, 'https://www.visitorlando.com/');
    if (/doubleclick\.net$/i.test(url.hostname) && url.searchParams.get('adurl')) {
      return url.searchParams.get('adurl');
    }
  } catch (e) {
    // keep original
  }
  return href;
}

function makeLink(document, href, text) {
  const a = document.createElement('a');
  a.href = cleanHref(href);
  a.textContent = text;
  return a;
}

export default function parse(element, { document }) {
  let panels = [...element.querySelectorAll(':scope > .slides > .slide')];
  if (!panels.length) panels = [...element.querySelectorAll('.slide')];

  const row = [];
  panels.forEach((panel) => {
    const content = panel.querySelector('.content-section') || panel;
    const out = [];

    // optional image (none on the home page, kept for other instances)
    const srcImg = panel.querySelector('img');
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      img.alt = srcImg.getAttribute('alt') || '';
      out.push(img);
    }

    const titleEl = content.querySelector('h1, h2, h3, h4, h5, .title');
    const heading = titleEl && (titleEl.closest('h1, h2, h3, h4, h5') || titleEl);
    const titleText = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : '';
    if (titleText) {
      const h = document.createElement('h3');
      const a = heading.querySelector('a[href]') || (heading.matches('a[href]') ? heading : null);
      if (a) h.append(makeLink(document, a.getAttribute('href'), titleText));
      else h.textContent = titleText;
      out.push(h);
    }

    content.querySelectorAll('p').forEach((p) => {
      const t = p.textContent.replace(/\s+/g, ' ').trim();
      if (!t) return;
      const np = document.createElement('p');
      np.textContent = t;
      out.push(np);
    });

    content.querySelectorAll('a[href]').forEach((a) => {
      if (heading && heading.contains(a)) return;
      if (a.closest('p')) return;
      const t = a.textContent.replace(/\s+/g, ' ').trim();
      if (!t) return;
      const p = document.createElement('p');
      p.append(makeLink(document, a.getAttribute('href'), t));
      out.push(p);
    });

    if (out.length) row.push(out);
  });

  const cells = row.length ? [row] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-split-panels', cells });
  element.replaceWith(block);
}
