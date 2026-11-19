/**
 * Hero Split: text column (heading, intro, CTAs) beside a feature image.
 * Accepts either one row per part (image row, text row) or a single row
 * with an image cell and a text cell. Missing parts are tolerated.
 */
function isPictureOnly(el) {
  const pic = el.querySelector('picture');
  if (!pic) return false;
  return el.textContent.trim() === '';
}

export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'hero-split-media';
  const content = document.createElement('div');
  content.className = 'hero-split-content';

  const cells = [...block.children].flatMap((row) => [...row.children]);
  cells.forEach((cell) => {
    if (isPictureOnly(cell)) {
      media.append(...cell.childNodes);
    } else {
      content.append(...cell.childNodes);
    }
  });

  // a picture authored inside the text cell (e.g. wrapped in a paragraph) still goes to media
  if (!media.querySelector('picture')) {
    const strayPic = content.querySelector('picture');
    if (strayPic) {
      const parent = strayPic.parentElement;
      media.append(strayPic);
      if (parent && parent !== content && parent.textContent.trim() === '' && !parent.children.length) {
        parent.remove();
      }
    }
  }

  // group trailing CTA paragraphs so they can sit in one row
  const ctas = [...content.querySelectorAll(':scope > p')].filter((p) => {
    const links = p.querySelectorAll('a');
    return links.length > 0 && p.textContent.trim() === [...links].map((a) => a.textContent).join('').trim();
  });
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-split-actions';
    ctas[0].before(actions);
    actions.append(...ctas);
  }

  block.replaceChildren(content);
  if (media.querySelector('picture, img')) {
    block.append(media);
    block.classList.add('hero-split-has-media');
    // a hero in the first section holds the LCP image: fetch it eagerly at high priority
    const heroImg = media.querySelector('img');
    if (heroImg && block.closest('.section') === document.querySelector('main .section')) {
      heroImg.loading = 'eager';
      heroImg.fetchPriority = 'high';
    }
  }
}
