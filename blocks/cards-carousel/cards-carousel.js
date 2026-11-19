import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Carousel: horizontal slider of cards with prev/next arrows and an
 * "n of N" counter. One row per card: image cell | text cell (optional
 * "Sponsored" badge paragraph, optional tag list, title, text, link).
 */
function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

function buildCard(row) {
  const li = document.createElement('li');
  li.className = 'cards-carousel-card';
  while (row.firstElementChild) li.append(row.firstElementChild);
  [...li.children].forEach((div) => {
    if (div.querySelector('picture') && div.textContent.trim() === '') {
      div.className = 'cards-carousel-card-image';
    } else {
      div.className = 'cards-carousel-card-body';
    }
  });
  const body = li.querySelector('.cards-carousel-card-body');
  if (body) {
    const badge = [...body.querySelectorAll('p')].find((p) => /^sponsored$/i.test(p.textContent.trim()));
    if (badge) {
      badge.classList.add('cards-carousel-badge');
      (li.querySelector('.cards-carousel-card-image') || li).prepend(badge);
    }
    body.querySelectorAll(':scope > ul').forEach((list) => list.classList.add('cards-carousel-tags'));
  }
  return li;
}

/**
 * The source slider bleeds off the right edge of the page. Expose the distance between the
 * block's right edge and the page's right edge (scrollbar excluded, unlike 100vw) as
 * --cards-carousel-bleed so CSS can extend the scrolling viewport without causing page scroll.
 */
function trackBleed(block) {
  const update = () => {
    if (!block.offsetWidth) return;
    const bleed = document.documentElement.clientWidth - block.getBoundingClientRect().right;
    block.style.setProperty('--cards-carousel-bleed', `${Math.max(0, Math.floor(bleed))}px`);
  };
  const observer = new ResizeObserver(update);
  observer.observe(block);
  observer.observe(document.documentElement);
}

export default function decorate(block) {
  trackBleed(block);
  const track = document.createElement('ul');
  track.className = 'cards-carousel-track';
  [...block.children].forEach((row) => {
    const li = buildCard(row);
    if (li.children.length) track.append(li);
  });
  optimizePictures(track);

  const cards = [...track.children];
  const total = cards.length;

  const viewport = document.createElement('div');
  viewport.className = 'cards-carousel-viewport';
  viewport.append(track);

  if (total < 2) {
    block.replaceChildren(viewport);
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'cards-carousel-controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-carousel-prev';
  prev.setAttribute('aria-label', 'Previous');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-carousel-next';
  next.setAttribute('aria-label', 'Next');
  const counter = document.createElement('span');
  counter.className = 'cards-carousel-counter';
  counter.setAttribute('aria-live', 'polite');
  controls.append(prev, counter, next);

  let index = 0;
  const update = () => {
    counter.textContent = `${index + 1} of ${total}`;
    prev.disabled = index <= 0;
    next.disabled = index >= total - 1;
    cards.forEach((card, i) => card.classList.toggle('cards-carousel-active', i === index));
  };

  const goTo = (i) => {
    index = Math.max(0, Math.min(total - 1, i));
    const card = cards[index];
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    update();
  };

  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));

  let scrollTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const { scrollLeft } = track;
      let closest = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - track.offsetLeft - scrollLeft);
        if (d < best) {
          best = d;
          closest = i;
        }
      });
      if (closest !== index) {
        index = closest;
        update();
      }
    }, 100);
  }, { passive: true });

  update();
  block.replaceChildren(controls, viewport);
}
