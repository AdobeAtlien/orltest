import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Boxed: white boxed cards (image, centered title, text) that can hang
 * below a colored section band. One row per card: image cell | text cell.
 * When the text holds a single link, the whole card becomes clickable.
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
    li.className = 'cards-boxed-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && div.textContent.trim() === '') {
        div.className = 'cards-boxed-card-image';
      } else {
        div.className = 'cards-boxed-card-body';
      }
    });
    if (!li.children.length) return;
    const links = li.querySelectorAll('.cards-boxed-card-body a[href]');
    if (links.length === 1) {
      links[0].classList.add('cards-boxed-card-link');
      li.classList.add('cards-boxed-card-linked');
    }
    ul.append(li);
  });
  optimizePictures(ul);
  block.replaceChildren(ul);
}
