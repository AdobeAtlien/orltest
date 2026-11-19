/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-split (visitorlando.com section.hero-primary).
 *
 * Block table (1 column):
 *   row 1: feature image (video poster / fallback image) + optional video link - optional
 *   row 2: heading, intro paragraph, CTA links
 *
 * The source hero plays a looping video: the poster image is kept as the still and the
 * video file is added as a link in the same cell (the block plays it over the still).
 * The Mindtrip chat form has no plain link and is skipped.
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Image: video poster, then any real image in the media column ---
  let imageEl = null;
  const video = element.querySelector('.media-col video, video');
  const posterSrc = video && (video.getAttribute('poster') || video.getAttribute('data-poster'));
  if (posterSrc) {
    imageEl = document.createElement('img');
    imageEl.src = posterSrc;
    imageEl.alt = '';
  } else {
    const mediaImg = element.querySelector('.media-col picture, .media-col img');
    if (mediaImg) imageEl = mediaImg;
  }

  // --- Video file: first mp4/webm source of the hero video ---
  let videoLink = null;
  if (video) {
    const sources = [video.getAttribute('src'), ...[...video.querySelectorAll('source[src]')].map((s) => s.getAttribute('src'))]
      .filter(Boolean);
    const videoSrc = sources.find((s) => /\.(mp4|webm)(\?|$)/i.test(s)) || sources[0];
    if (videoSrc) {
      const href = new URL(videoSrc, 'https://www.visitorlando.com/').href;
      videoLink = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      videoLink.append(a);
    }
  }

  if (imageEl || videoLink) cells.push([[imageEl, videoLink].filter(Boolean)]);

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
