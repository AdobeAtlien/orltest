/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-banner-ad (div.partner-banner-ad).
 *
 * Block table (3 columns), one row per slide:
 *   left photo | panel: [Sponsored] + heading + CTA + partner logo | right photo
 *
 * The "Sponsored" disclosure overlays the left photo in the source; it is
 * kept as the first paragraph of the center panel so image cells stay
 * image-only (the block treats image-only cells as media columns).
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

function looksTruncated(src) {
  return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
}

function buildImage(document, scope, imgSelector) {
  if (!scope) return null;
  const srcImg = scope.querySelector(imgSelector || 'img');
  if (!srcImg) return null;
  let src = srcImg.getAttribute('src') || srcImg.getAttribute('data-src') || '';
  if (looksTruncated(src)) {
    const pic = srcImg.closest('picture') || scope;
    const alt = [...pic.querySelectorAll('source[srcset]')]
      .map((s) => (s.getAttribute('srcset') || '').trim().split(/\s+/)[0])
      .find((u) => u && !looksTruncated(u));
    if (alt) src = alt;
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = (srcImg.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
  return img;
}

export default function parse(element, { document }) {
  const cells = [];

  let slides = [...element.querySelectorAll(':scope > .slides > article.slide')];
  if (!slides.length) slides = [...element.querySelectorAll('article.slide')];
  if (!slides.length) slides = [element];

  slides.forEach((slide) => {
    const left = buildImage(document, slide.querySelector('.first-img-cont'), 'img.slide-img, img');
    const right = buildImage(document, slide.querySelector('.second-img-cont'), 'img.slide-img, img');

    const panel = [];
    if (slide.querySelector('.sponsored')) {
      const p = document.createElement('p');
      p.textContent = 'Sponsored';
      panel.push(p);
    }
    const content = slide.querySelector('.content-section') || slide;
    const titleEl = content.querySelector('.widget-title, h1, h2, h3, h4, h5');
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (titleText) {
      const h = document.createElement('h2');
      h.textContent = titleText;
      panel.push(h);
    }
    content.querySelectorAll('a[href]').forEach((a) => {
      const t = a.textContent.replace(/\s+/g, ' ').trim();
      if (!t) return;
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = cleanHref(a.getAttribute('href'));
      link.textContent = t;
      p.append(link);
      panel.push(p);
    });
    const logo = buildImage(document, content.querySelector('img.logo-img') ? content : null, 'img.logo-img');
    if (logo) {
      const p = document.createElement('p');
      p.append(logo);
      panel.push(p);
    }

    if (!left && !right && !panel.length) return;
    cells.push([left || '', panel.length ? panel : '', right || '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-banner-ad', cells });
  element.replaceWith(block);
}
