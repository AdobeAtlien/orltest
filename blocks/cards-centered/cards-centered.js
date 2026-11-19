import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Centered: image above a centered title, text and arrow link.
 * One row per card: image cell | text cell. A first paragraph reading
 * "Sponsored" is turned into a badge over the image.
 */
function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-centered-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && div.textContent.trim() === '') {
        div.className = 'cards-centered-card-image';
      } else {
        div.className = 'cards-centered-card-body';
      }
    });
    if (!li.children.length) return;

    const body = li.querySelector('.cards-centered-card-body');
    const badge = body && [...body.querySelectorAll('p')]
      .find((p) => /^sponsored$/i.test(p.textContent.trim()));
    if (badge) {
      badge.classList.add('cards-centered-badge');
      const image = li.querySelector('.cards-centered-card-image');
      (image || li).prepend(badge);
    }
    ul.append(li);
  });
  optimizePictures(ul);
  block.replaceChildren(ul);
}
