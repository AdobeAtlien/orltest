/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-mosaic (div.mosaic.mosaic-grid).
 *
 * Block table (2 columns), one row per tile:
 *   image | label link (+ optional photo credit paragraph)
 *
 * The whole tile is an <a.content-link>; its href is rebuilt on the label.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each tile is div.slide (sizes: medium / wide / tall / small).
  let tiles = [...element.querySelectorAll('.cols > .slide')];
  if (!tiles.length) tiles = [...element.querySelectorAll('.slide')];

  tiles.forEach((tile) => {
    const img = tile.querySelector('.img-cont img, img');
    let imageCell = '';
    if (img) {
      const pic = document.createElement('img');
      pic.src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      pic.alt = (img.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
      imageCell = pic;
    }

    const text = [];
    const titleEl = tile.querySelector('.content-title, h2, h3, h4');
    const label = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const linkEl = tile.querySelector('a.content-link[href], a[href]');
    if (label) {
      const p = document.createElement('p');
      if (linkEl) {
        const a = document.createElement('a');
        a.href = linkEl.getAttribute('href');
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      text.push(p);
    }

    const credit = tile.querySelector('.credits');
    const creditText = credit ? credit.textContent.replace(/\s+/g, ' ').trim() : '';
    if (creditText) {
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = creditText;
      p.append(em);
      text.push(p);
    }

    if (!imageCell && !text.length) return;
    cells.push([imageCell, text]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-mosaic', cells });
  element.replaceWith(block);
}
