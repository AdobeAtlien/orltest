/**
 * Columns Split Panels: two half-width promo panels side by side, the
 * second a colored panel with a rounded corner. One row, one cell per panel.
 * Each panel gets a positional class (`-panel-1`, `-panel-2`, ...) so the
 * design pass can style them independently; image-only cells become media.
 * A paragraph holding nothing but one link is the panel's call to action.
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const count = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-split-panels-${count}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-split-panels-row');
    [...row.children].forEach((col, i) => {
      col.classList.add('columns-split-panels-panel', `columns-split-panels-panel-${i + 1}`);
      if (col.querySelector('picture') && col.textContent.trim() === '') {
        col.classList.add('columns-split-panels-media');
        return;
      }
      col.querySelectorAll(':scope > p').forEach((p) => {
        const links = p.querySelectorAll('a');
        if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
          p.classList.add('columns-split-panels-cta-wrapper');
          links[0].classList.add('columns-split-panels-cta');
        }
      });
    });
  });
}
