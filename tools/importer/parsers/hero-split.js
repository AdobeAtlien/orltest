/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-split (visitorlando.com section.hero-primary).
 *
 * Block table (1 column):
 *   row 1: feature image (video poster / fallback image) - optional
 *   row 2: heading, intro paragraph, CTA links
 *
 * The source hero plays a video; the poster image is used as the still.
 * The Mindtrip chat form has no plain link and is skipped.
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Image: video poster, then any real image in the media column ---
  let imageEl = null;
  const video = element.querySelector('.media-col video[poster], video[poster], video[data-poster]');
  const posterSrc = video && (video.getAttribute('poster') || video.getAttribute('data-poster'));
  if (posterSrc) {
    imageEl = document.createElement('img');
    imageEl.src = posterSrc;
    imageEl.alt = '';
  } else {
    const mediaImg = element.querySelector('.media-col picture, .media-col img');
    if (mediaImg) imageEl = mediaImg;
  }
  if (imageEl) cells.push([imageEl]);

  // --- Text: heading, description, CTAs ---
  const content = [];
  const srcHeading = element.querySelector('.content-col h1, .content-col h2, h1, h2');
  if (srcHeading) {
    // Drop decorative sparkle images; normalise whitespace.
    const text = srcHeading.textContent.replace(/\s+/g, ' ').trim();
    if (text) {
      const h = document.createElement(srcHeading.tagName.toLowerCase() === 'h2' ? 'h2' : 'h1');
      h.textContent = text;
      content.push(h);
    }
  }

  element.querySelectorAll('.content-col p.desc, .content-col .content-inner > p').forEach((p) => {
    if (p.textContent.trim() && !content.includes(p)) content.push(p);
  });

  const ctaLinks = [...element.querySelectorAll('.content-col .button-row a[href], .content-col a.button-default[href]')]
    .filter((a, i, arr) => arr.indexOf(a) === i && !a.closest('form'));
  ctaLinks.forEach((a) => {
    const text = a.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = text;
    p.append(link);
    content.push(p);
  });

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-split', cells });
  element.replaceWith(block);
}
