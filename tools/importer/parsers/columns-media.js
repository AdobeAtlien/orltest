/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-media (section.core-side-by-side 1-across, text + rounded image).
 *
 * Block table (2 columns), one row per slide:
 *   text (heading, paragraph, CTA) | image      (.slides.slide-right, default)
 *   image | text                                 (.slides.slide-left)
 * Skeleton loaders are ignored.
 */

function looksTruncated(src) {
  return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
}

function buildImage(document, scope) {
  const srcImg = scope.querySelector('.img-cont img, img');
  if (!srcImg) return null;
  let src = srcImg.getAttribute('src') || srcImg.getAttribute('data-src') || '';
  if (looksTruncated(src)) {
    const alt = [...scope.querySelectorAll('picture source[srcset]')]
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
  const slidesWrap = element.querySelector('.slides');
  const imageFirst = !!(slidesWrap && slidesWrap.classList.contains('slide-left'));

  let slides = [...element.querySelectorAll(':scope > .slides > article.slide')];
  if (!slides.length) slides = [...element.querySelectorAll('article.slide')];
  if (!slides.length) slides = [element];

  slides.forEach((slide) => {
    const img = buildImage(document, slide.querySelector('.slide-top') || slide);

    const text = [];
    const titleEl = slide.querySelector('.content-section .slide-title, .content-section h2, .content-section h3');
    if (titleEl) {
      const t = titleEl.textContent.replace(/\s+/g, ' ').trim();
      if (t) {
        const h = document.createElement('h2');
        const a = titleEl.querySelector('a[href]');
        if (a) {
          const link = document.createElement('a');
          link.href = a.getAttribute('href');
          link.textContent = t;
          h.append(link);
        } else {
          h.textContent = t;
        }
        text.push(h);
      }
    }
    slide.querySelectorAll('.content-section .content-top p').forEach((p) => {
      const t = p.textContent.replace(/\s+/g, ' ').trim();
      if (!t) return;
      const np = document.createElement('p');
      np.textContent = t;
      text.push(np);
    });
    slide.querySelectorAll('.content-section .slide-footer a[href]').forEach((a) => {
      const t = a.textContent.replace(/\s+/g, ' ').trim();
      if (!t) return;
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = t;
      p.append(link);
      text.push(p);
    });

    if (!img && !text.length) return;
    const textCell = text.length ? text : '';
    const imageCell = img || '';
    cells.push(imageFirst ? [imageCell, textCell] : [textCell, imageCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
