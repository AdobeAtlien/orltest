import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Accordion Image: expand/collapse items beside a large photo that swaps to
 * the open item's image. One row per item: label cell | content cell (text,
 * links and an optional image). An image may also sit in its own cell.
 * Only one item is open at a time; the first item opens by default.
 */
function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]));
  });
}

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

/** Moves the first picture out of a cell, removing a now-empty wrapper paragraph. */
function takePicture(cell) {
  const pic = cell.querySelector('picture');
  if (!pic) return null;
  const parent = pic.parentElement;
  pic.remove();
  if (parent && parent !== cell && parent.textContent.trim() === '' && !parent.children.length) {
    parent.remove();
  }
  return pic;
}

export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'accordion-image-media';
  const list = document.createElement('div');
  list.className = 'accordion-image-items';

  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    let picture = null;
    const textCells = [];
    cells.forEach((cell) => {
      if (!picture && isPictureOnly(cell)) picture = takePicture(cell);
      else if (cell.textContent.trim() || cell.querySelector('picture, img')) textCells.push(cell);
    });
    if (!textCells.length) return;

    const [labelCell, ...bodyCells] = textCells;
    const summary = document.createElement('summary');
    summary.className = 'accordion-image-item-label';
    summary.append(...labelCell.childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-image-item-body';
    bodyCells.forEach((cell) => body.append(...cell.childNodes));
    if (!picture) picture = takePicture(body);

    const details = document.createElement('details');
    details.className = 'accordion-image-item';
    details.append(summary, body);
    list.append(details);

    const slide = document.createElement('div');
    slide.className = 'accordion-image-slide';
    if (picture) slide.append(picture);
    media.append(slide);
    items.push({ details, slide, hasImage: !!picture });
  });

  if (!items.length) return;

  const show = (active) => {
    // fall back to the nearest earlier image when the open item has none
    let imageIndex = items.indexOf(active);
    while (imageIndex > 0 && !items[imageIndex].hasImage) imageIndex -= 1;
    items.forEach((item, i) => {
      item.slide.classList.toggle('accordion-image-slide-active', i === imageIndex && item.hasImage);
    });
  };

  items.forEach((item) => {
    item.details.addEventListener('toggle', () => {
      if (!item.details.open) return;
      items.forEach((other) => {
        if (other !== item && other.details.open) other.details.open = false;
      });
      show(item);
    });
  });

  items[0].details.open = true;
  show(items[0]);

  optimizePictures(media);
  optimizePictures(list);
  block.replaceChildren();
  if (items.some((item) => item.hasImage)) {
    block.append(media);
    block.classList.add('accordion-image-has-media');
  }
  block.append(list);
}
