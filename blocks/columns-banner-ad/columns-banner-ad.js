/**
 * Columns Banner Ad: partner banner of photo | colored center panel
 * (heading, CTA, logo) | photo. Image-only cells become media columns,
 * the rest become panels. Works with fewer or more cells than three.
 * A short text-only paragraph before the panel heading ("Sponsored") becomes
 * a label over the first photo; a paragraph holding only a link is the CTA.
 */
function decorateLabel(row) {
  const panel = row.querySelector('.columns-banner-ad-panel');
  if (!panel) return;
  const first = panel.firstElementChild;
  if (!first || first.tagName !== 'P' || first.querySelector('a, picture, img')) return;
  const next = first.nextElementSibling;
  if (!next || !/^H[1-6]$/.test(next.tagName)) return;
  if (!first.textContent.trim() || first.textContent.trim().length > 40) return;
  first.classList.add('columns-banner-ad-label');
  const media = row.querySelector('.columns-banner-ad-media');
  if (media) media.prepend(first);
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const count = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-banner-ad-${count}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-banner-ad-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.textContent.trim() === '') {
        col.classList.add('columns-banner-ad-media');
      } else {
        col.classList.add('columns-banner-ad-panel');
        // a picture inside the text panel is the partner logo
        col.querySelectorAll('picture').forEach((logo) => {
          const holder = logo.closest('p') || logo;
          holder.classList.add('columns-banner-ad-logo');
        });
        // a paragraph that only holds one link is the call to action
        col.querySelectorAll(':scope > p').forEach((p) => {
          const links = p.querySelectorAll('a');
          if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
            p.classList.add('columns-banner-ad-cta');
          }
        });
      }
    });
    decorateLabel(row);
  });
}
