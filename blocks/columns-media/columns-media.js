/**
 * Columns Media: text with CTA beside a rounded image.
 * One row (or more) of cells; image-only cells are flagged as media,
 * the rest as text. Authors may put the image on either side.
 * A text paragraph holding nothing but one link is styled as the CTA button.
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const count = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-media-${count}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.textContent.trim() === '') {
        col.classList.add('columns-media-img-col');
      } else {
        col.classList.add('columns-media-text-col');
        col.querySelectorAll(':scope > p').forEach((p) => {
          const links = p.querySelectorAll('a');
          if (links.length === 1 && !p.querySelector('picture')
            && p.textContent.trim() === links[0].textContent.trim()) {
            p.classList.add('columns-media-cta-wrapper');
            links[0].classList.add('columns-media-cta');
          }
        });
      }
    });
  });
}
