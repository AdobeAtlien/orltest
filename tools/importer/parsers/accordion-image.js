/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-image (section.core-side-by-side-accordion).
 *
 * Block table (2 columns), one row per accordion item:
 *   label | body text + CTA link(s) + the item's own image
 *
 * Images live in a separate asset column (div.asset-item#<id>) and are paired
 * with accordion items (li.accordion-item#<id>_<n>) by id, falling back to
 * document order. The Mindtrip chat form has no plain link and is skipped.
 */

function looksTruncated(src) {
  return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
}

function buildImage(document, assetItem) {
  if (!assetItem) return null;
  const srcImg = assetItem.querySelector('img');
  let src = srcImg ? (srcImg.getAttribute('src') || srcImg.getAttribute('data-src') || '') : '';
  if (looksTruncated(src)) {
    const source = [...assetItem.querySelectorAll('picture source[srcset]')]
      .map((s) => (s.getAttribute('srcset') || '').trim().split(/\s+/)[0])
      .find((u) => u && !looksTruncated(u));
    if (source) src = source;
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = ((srcImg && srcImg.getAttribute('alt')) || '').replace(/\s+/g, ' ').trim();
  return img;
}

export default function parse(element, { document }) {
  const cells = [];

  const assets = [...element.querySelectorAll('.asset-col .asset-item, .asset-item')]
    .filter((el, i, arr) => arr.indexOf(el) === i);
  const assetById = new Map(assets.filter((a) => a.id).map((a) => [a.id, a]));

  let items = [...element.querySelectorAll('.accordion-col .accordion-item')];
  if (!items.length) items = [...element.querySelectorAll('.accordion-item, li')];

  items.forEach((item, index) => {
    // --- label ---
    const titleEl = item.querySelector('.accordion-title, button, summary');
    const labelText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!labelText) return;
    const label = document.createElement('p');
    label.textContent = labelText;

    // --- body ---
    const body = [];
    const content = item.querySelector('.accordion-content, .answer') || item;
    content.querySelectorAll('p').forEach((p) => {
      if (p.closest('button, form')) return;
      const t = p.textContent.replace(/\s+/g, ' ').trim();
      if (!t) return;
      const np = document.createElement('p');
      np.textContent = t;
      body.push(np);
    });
    content.querySelectorAll('a[href]').forEach((a) => {
      if (a.closest('p')) return;
      const t = a.textContent.replace(/\s+/g, ' ').trim();
      if (!t) return;
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = t;
      p.append(link);
      body.push(p);
    });

    // --- image: by id prefix, else same index ---
    const idKey = (item.id || '').replace(/_\d+$/, '');
    const asset = (idKey && assetById.get(idKey)) || assets[index];
    const img = buildImage(document, asset);
    if (img) body.push(img);

    cells.push([label, body.length ? body : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-image', cells });
  element.replaceWith(block);
}
