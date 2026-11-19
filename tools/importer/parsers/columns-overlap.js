/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-overlap (section.core-side-by-side, 1-across sponsored promo).
 *
 * Block table (2 columns), one row per slide:
 *   image (+ optional "Sponsored" paragraph) | heading + paragraph + CTA
 * Skeleton loaders are ignored.
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

function linkPara(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = cleanHref(href);
  a.textContent = text;
  p.append(a);
  return p;
}

export default function parse(element, { document }) {
  const cells = [];

  let slides = [...element.querySelectorAll(':scope > .slides > article.slide, :scope > .slides > .slide')];
  slides = slides.filter((s, i) => slides.indexOf(s) === i);
  if (!slides.length) slides = [...element.querySelectorAll('article.slide')];
  if (!slides.length) slides = [element];

  slides.forEach((slide) => {
    // --- media cell ---
    const media = [];
    const img = slide.querySelector('.slide-top img, .img-cont img');
    if (img) {
      const pic = document.createElement('img');
      pic.src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      pic.alt = img.getAttribute('alt') || '';
      media.push(pic);
    }
    if (slide.querySelector('.sponsored')) {
      const p = document.createElement('p');
      p.textContent = 'Sponsored';
      media.push(p);
    }

    // --- text cell ---
    const text = [];
    const titleEl = slide.querySelector('.content-section .slide-title, .content-section h2, .content-section h3');
    if (titleEl) {
      const titleText = titleEl.textContent.replace(/\s+/g, ' ').trim();
      if (titleText) {
        const h = document.createElement('h2');
        const a = titleEl.querySelector('a[href]');
        if (a) {
          const link = document.createElement('a');
          link.href = cleanHref(a.getAttribute('href'));
          link.textContent = titleText;
          h.append(link);
        } else {
          h.textContent = titleText;
        }
        text.push(h);
      }
    }
    slide.querySelectorAll('.content-section .content-top > p, .content-section .content-top p').forEach((p) => {
      if (p.textContent.trim() && !text.includes(p)) text.push(p);
    });
    slide.querySelectorAll('.content-section .slide-footer a[href]').forEach((a) => {
      const t = a.textContent.replace(/\s+/g, ' ').trim();
      if (t) text.push(linkPara(document, a.getAttribute('href'), t));
    });

    if (!media.length && !text.length) return;
    cells.push([media.length ? media : '', text.length ? text : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-overlap', cells });
  element.replaceWith(block);
}
