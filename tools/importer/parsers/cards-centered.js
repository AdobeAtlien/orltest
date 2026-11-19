/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-centered (section.core-cards.double-highlight).
 *
 * Two instances on the home page:
 *   - regular vacation-idea cards (article.slide)
 *   - sponsored ad cards (article.slide.dtn-slide) with "Sponsored" labels
 *
 * Block table (2 columns), one row per card:
 *   image | [Sponsored] + title heading + description + CTA link
 */

// Ad click-trackers (doubleclick) carry the real destination in `adurl`.
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
  const cells = [];

  // Stable card wrapper; fall back to any article.slide.
  let cards = [...element.querySelectorAll(':scope > .slides > article.slide')];
  if (!cards.length) cards = [...element.querySelectorAll('article.slide, .slide')];

  cards.forEach((card) => {
    // --- image cell ---
    const img = card.querySelector('.slide-top img, .img-cont img, img');
    let imageCell = '';
    if (img) {
      const pic = document.createElement('img');
      pic.src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      pic.alt = img.getAttribute('alt') || '';
      imageCell = pic;
    }

    // --- text cell ---
    const text = [];
    if (card.querySelector('.sponsored')) {
      const p = document.createElement('p');
      p.textContent = 'Sponsored';
      text.push(p);
    }

    const titleEl = card.querySelector('.slide-title, h2, h3');
    if (titleEl) {
      const h = document.createElement('h3');
      const titleText = titleEl.textContent.replace(/\s+/g, ' ').trim();
      const titleLink = titleEl.querySelector('a[href]');
      if (titleLink) h.append(makeLink(document, titleLink.getAttribute('href'), titleText));
      else h.textContent = titleText;
      if (titleText) text.push(h);
    }

    card.querySelectorAll('.content-section .inner > p, .content-section p').forEach((p) => {
      if (p.textContent.trim() && !text.includes(p)) text.push(p);
    });

    const cta = card.querySelector('.slide-footer a[href], a.button-arrow[href]');
    if (cta) {
      const ctaText = cta.textContent.replace(/\s+/g, ' ').trim();
      if (ctaText) {
        const p = document.createElement('p');
        p.append(makeLink(document, cta.getAttribute('href'), ctaText));
        text.push(p);
      }
    }

    if (!imageCell && !text.length) return;
    cells.push([imageCell, text]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-centered', cells });
  element.replaceWith(block);
}
