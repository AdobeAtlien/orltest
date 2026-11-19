/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-boxed (section.core-cards.cards-3-across).
 *
 * Block table (2 columns), one row per card:
 *   image | title heading (linked) + description
 *
 * The card link lives on the title (single link, so the block makes the whole
 * card clickable). Photo credits are an overlay on the image and are not part
 * of the cards-boxed content model, so they are omitted.
 */

function looksTruncated(src) {
  return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
}

function bestImageSrc(scope) {
  const img = scope.querySelector('img');
  const src = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
  if (!looksTruncated(src)) return src;
  const sources = [...scope.querySelectorAll('picture source[srcset]')];
  // prefer jpeg/png sources over avif/webp
  sources.sort((a, b) => (/image\/(avif|webp)/.test(a.getAttribute('type') || '') ? 1 : 0)
    - (/image\/(avif|webp)/.test(b.getAttribute('type') || '') ? 1 : 0));
  for (const s of sources) {
    const first = (s.getAttribute('srcset') || '').trim().split(/\s+/)[0];
    if (first && !looksTruncated(first)) return first;
  }
  return src;
}

export default function parse(element, { document }) {
  const cells = [];

  let cards = [...element.querySelectorAll(':scope > .slides > article.slide')];
  if (!cards.length) cards = [...element.querySelectorAll('article.slide, .slide')];

  cards.forEach((card) => {
    // --- image cell ---
    let imageCell = '';
    const imgScope = card.querySelector('.slide-top') || card;
    const src = bestImageSrc(imgScope);
    if (src) {
      const srcImg = imgScope.querySelector('img');
      const img = document.createElement('img');
      img.src = src;
      img.alt = ((srcImg && srcImg.getAttribute('alt')) || '').replace(/\s+/g, ' ').trim();
      imageCell = img;
    }

    // --- text cell ---
    const text = [];
    const titleEl = card.querySelector('.content-section .slide-title, .content-section h2, .content-section h3');
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const linkEl = (titleEl && titleEl.querySelector('a[href]'))
      || card.querySelector('.img-cont a[href], a[href]');
    if (titleText) {
      const h = document.createElement('h3');
      if (linkEl) {
        const a = document.createElement('a');
        a.href = linkEl.getAttribute('href');
        a.textContent = titleText;
        h.append(a);
      } else {
        h.textContent = titleText;
      }
      text.push(h);
    }

    const descParas = [...card.querySelectorAll('.content-section .slide-desc p')];
    if (descParas.length) {
      descParas.forEach((p) => {
        const t = p.textContent.replace(/\s+/g, ' ').trim();
        if (!t) return;
        const np = document.createElement('p');
        np.textContent = t;
        text.push(np);
      });
    } else {
      const desc = card.querySelector('.content-section .slide-desc, .content-section p');
      const t = desc ? desc.textContent.replace(/\s+/g, ' ').trim() : '';
      if (t) {
        const np = document.createElement('p');
        np.textContent = t;
        text.push(np);
      }
    }

    if (!imageCell && !text.length) return;
    cells.push([imageCell, text]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-boxed', cells });
  element.replaceWith(block);
}
