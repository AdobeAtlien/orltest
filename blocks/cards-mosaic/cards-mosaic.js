import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Mosaic: photo tiles of mixed sizes with the label overlaid.
 * One row per tile: image cell | text cell (label, optional link,
 * optional photo credit). When the text holds a link, the whole tile
 * becomes clickable.
 */
function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]));
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-mosaic-tile';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && div.textContent.trim() === '') {
        div.className = 'cards-mosaic-tile-image';
      } else {
        div.className = 'cards-mosaic-tile-body';
      }
    });
    if (!li.children.length) return;
    if (!li.querySelector('.cards-mosaic-tile-image')) li.classList.add('cards-mosaic-tile-no-image');

    const body = li.querySelector('.cards-mosaic-tile-body');
    const link = body && body.querySelector('a[href]');
    if (link) {
      // stretch the first link over the tile; keep its text as the label
      link.classList.add('cards-mosaic-tile-link');
      link.classList.remove('button');
      link.closest('.button-container')?.classList.remove('button-container');
      const label = document.createElement('span');
      label.className = 'cards-mosaic-tile-label';
      label.append(...link.childNodes);
      link.append(label);
    }
    ul.append(li);
  });
  optimizePictures(ul);
  block.replaceChildren(ul);
}
