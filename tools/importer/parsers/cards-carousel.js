/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-carousel (div.custom-carousel, Glide.js slider).
 *
 * Two instances on the home page:
 *   - listing cards ("Unique Orlando Experiences"), one may be Sponsored
 *   - blog post cards ("From Our Blog") with category tags
 *
 * Block table (2 columns), one row per card:
 *   image | [Sponsored] + [tag list] + title heading (linked) + description + Read More link
 *
 * Notes:
 *   - The carousel heading (h2.template-title) is moved out of the block by
 *     the cleanup transformer, so no title row is emitted here.
 *   - Glide clones (.glide__slide--clone) are duplicates and are skipped.
 *   - Arrows / counter / gradient are ignored.
 *   - Items are iterated on the stable <article.slide> wrapper; every part is
 *     queried inside its own article (the invalid button-in-anchor nesting
 *     never crosses an article boundary).
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

// Source <img src> is truncated at the first comma of Cloudinary-style URLs
// (".../upload/c_fill"); the <source srcset> entries keep the full URL.
function looksTruncated(src) {
  // Truncated URLs end right after the transformation segment, e.g.
  // ".../image/upload/c_fill" or ".../image/fetch/c_fill".
  return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
}

function bestImageSrc(card) {
  const img = card.querySelector('.img-cont img, img');
  const src = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
  if (!looksTruncated(src)) return src;
  const sources = [...card.querySelectorAll('.img-cont picture source[srcset], picture source[srcset], source[data-srcset]')];
  for (const s of sources) {
    const set = (s.getAttribute('srcset') || s.getAttribute('data-srcset') || '').trim();
    const first = set.split(/\s+/)[0];
    if (first && !looksTruncated(first)) return first;
  }
  return src;
}

export default function parse(element, { document }) {
  const cells = [];

  let cards = [...element.querySelectorAll('.glide__slides > article.slide:not(.glide__slide--clone)')];
  if (!cards.length) cards = [...element.querySelectorAll('article.slide:not(.glide__slide--clone)')];
  if (!cards.length) cards = [...element.querySelectorAll('article.slide, .slide')];

  cards.forEach((card) => {
    const wrapper = card.querySelector('a.slide-wrapper[href]') || card.querySelector('a[href]');
    const href = wrapper ? cleanHref(wrapper.getAttribute('href')) : '';
    const titleEl = card.querySelector('.slide-title, h3, h2');
    const titleText = titleEl
      ? titleEl.textContent.replace(/\s+/g, ' ').trim()
      : ((wrapper && wrapper.getAttribute('title')) || '').trim();

    // --- image cell ---
    let imageCell = '';
    const src = bestImageSrc(card);
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      const srcImg = card.querySelector('.img-cont img, img');
      img.alt = (srcImg && srcImg.getAttribute('alt')) || titleText || '';
      imageCell = img;
    }

    // --- text cell ---
    const text = [];
    if (card.querySelector('.sponsored')) {
      const p = document.createElement('p');
      p.textContent = 'Sponsored';
      text.push(p);
    }

    const cats = [...card.querySelectorAll('.categories .cat')]
      .map((c) => c.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (cats.length) {
      const ul = document.createElement('ul');
      cats.forEach((c) => {
        const li = document.createElement('li');
        li.textContent = c;
        ul.append(li);
      });
      text.push(ul);
    }

    if (titleText) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = titleText;
        h.append(a);
      } else {
        h.textContent = titleText;
      }
      text.push(h);
    }

    const desc = card.querySelector('.slide-desc');
    if (desc && desc.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
      text.push(p);
    }

    const more = card.querySelector('.read-more');
    const moreText = more ? more.textContent.replace(/\s+/g, ' ').trim() : '';
    if (href && moreText) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = moreText;
      p.append(a);
      text.push(p);
    }

    if (!imageCell && !text.length) return;
    cells.push([imageCell, text]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-carousel', cells });
  element.replaceWith(block);
}
