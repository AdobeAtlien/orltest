/**
 * Accordion Two Col: FAQ accordion whose items flow into two columns on
 * wide screens. One row per item: question cell | answer cell.
 * Items are split into two independent lists so opening one item never
 * reflows the other column.
 */
export default function decorate(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture, img'));
    if (!cells.length) return;
    const [labelCell, ...bodyCells] = cells;

    const summary = document.createElement('summary');
    summary.className = 'accordion-two-col-item-label';
    summary.append(...labelCell.childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-two-col-item-body';
    bodyCells.forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-two-col-item';
    details.append(summary, body);
    if (!body.textContent.trim() && !body.querySelector('picture, img')) {
      details.classList.add('accordion-two-col-item-empty');
    }
    items.push(details);
  });

  if (!items.length) return;

  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)].map((group) => {
    const col = document.createElement('div');
    col.className = 'accordion-two-col-column';
    col.append(...group);
    return col;
  }).filter((col) => col.children.length);

  block.replaceChildren(...columns);
}
