/**
 * Columns Overlap: a large photo with a text panel overlapping it.
 * One row: image cell | text cell (either order). A paragraph reading
 * "Sponsored" in the image cell becomes a badge.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-overlap-row');
    const cols = [...row.children];
    cols.forEach((col) => {
      const pic = col.querySelector('picture');
      const textOnlyBadge = [...col.querySelectorAll('p')]
        .every((p) => p.querySelector('picture') || /^sponsored$/i.test(p.textContent.trim()));
      const hasHeading = col.querySelector('h1, h2, h3, h4, h5, h6');
      if (pic && textOnlyBadge && !hasHeading) {
        col.classList.add('columns-overlap-media');
        col.querySelectorAll('p').forEach((p) => {
          if (!p.querySelector('picture')) p.classList.add('columns-overlap-badge');
        });
      } else {
        col.classList.add('columns-overlap-panel');
        // a paragraph holding nothing but one link is the panel's call to action
        col.querySelectorAll(':scope > p').forEach((p) => {
          const links = p.querySelectorAll('a');
          if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
            p.classList.add('columns-overlap-cta-wrapper');
            links[0].classList.add('columns-overlap-cta');
          }
        });
      }
    });
    if (cols.length && !row.querySelector('.columns-overlap-media')) {
      row.classList.add('columns-overlap-no-media');
    }
    const first = cols[0];
    if (first && first.classList.contains('columns-overlap-panel') && row.querySelector('.columns-overlap-media')) {
      row.classList.add('columns-overlap-reversed');
    }
  });
}
