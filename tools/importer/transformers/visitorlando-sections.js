/* eslint-disable */
/* global WebImporter */

/**
 * Sections transformer for www.visitorlando.com.
 *
 * Uses payload.template.sections. For each section the FIRST selector that
 * matches marks the start of the section (later selectors are subsequent
 * parts of the same section).
 *
 * beforeTransform: inserts <hr> before every non-first section (while the
 * parser target elements still exist). Breaks for styled sections carry a
 * temporary data-excat-section-id marker. A styled first section gets a
 * temporary marked <hr> too.
 *
 * afterTransform: inserts a Section Metadata block (style) after each marker,
 * removes the marker attribute, and removes the first section's temporary <hr>.
 */

const MARKER = 'data-excat-section-id';

function findSectionStart(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const document = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const start = findSectionStart(element, section);
      if (!start || !start.parentElement) continue;
      if (i === 0) {
        if (section.style) {
          const hr = document.createElement('hr');
          hr.setAttribute(MARKER, section.id);
          hr.setAttribute('data-excat-first', 'true');
          start.parentElement.insertBefore(hr, start);
        }
        continue;
      }
      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      start.parentElement.insertBefore(hr, start);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      let anchor = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      let isMarker = !!anchor;
      if (!anchor) {
        anchor = findSectionStart(element, section);
        isMarker = false;
      }
      if (!anchor || !anchor.parentElement) continue;

      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (isMarker) {
        anchor.after(metadata);
        if (anchor.hasAttribute('data-excat-first')) {
          anchor.remove();
        } else {
          anchor.removeAttribute(MARKER);
        }
      } else {
        anchor.after(metadata);
      }
    }
    // Safety: drop any leftover markers
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => {
      if (hr.hasAttribute('data-excat-first')) hr.remove();
      else hr.removeAttribute(MARKER);
    });
  }
}
