/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-two-col (section.core-faqs).
 *
 * Block table (2 columns), one row per FAQ item, in source order
 * (first column items, then second column items):
 *   question | answer (rich text, inline links kept)
 *
 * The block JS splits items into two columns with ceil(n / 2) in the first,
 * which matches the source split.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Document order covers .first-col then .second-col.
  let items = [...element.querySelectorAll('.faqs-container li.accordion-item')];
  if (!items.length) items = [...element.querySelectorAll('.accordion-item, .faq-item')];
  items = items.filter((el, i, arr) => arr.indexOf(el) === i);

  items.forEach((item) => {
    const q = item.querySelector('.accordion-title, .question, button');
    const qText = q ? q.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!qText) return;
    const question = document.createElement('p');
    question.textContent = qText;

    const answerRoot = item.querySelector('.accordion-content .inner')
      || item.querySelector('.accordion-content, .answer');
    const answer = [];
    if (answerRoot) {
      answerRoot.querySelectorAll('meta, script, style, button').forEach((el) => el.remove());
      [...answerRoot.childNodes].forEach((node) => {
        if (node.nodeType === 3) {
          const t = node.textContent.replace(/\s+/g, ' ').trim();
          if (t) {
            const p = document.createElement('p');
            p.textContent = t;
            answer.push(p);
          }
        } else if (node.nodeType === 1) {
          if (node.textContent.trim() || node.querySelector('img, picture, a[href]')) answer.push(node);
        }
      });
    }

    cells.push([question, answer.length ? answer : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-two-col', cells });
  element.replaceWith(block);
}
