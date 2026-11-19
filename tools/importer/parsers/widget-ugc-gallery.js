/* eslint-disable */
/* global WebImporter */

/**
 * Parser for widget-ugc-gallery (div.panel-ugc-lazyloader, CrowdRiff embed).
 *
 * The captured photos are rendered client-side by CrowdRiff and are not
 * authorable. The block only needs a reference to the gallery embed: the
 * CrowdRiff loader script with the gallery id. The block JS turns
 *   https://starling.crowdriff.com/js/crowdriff.js?id=cr-init__<galleryId>
 * into <script id="cr-init__<galleryId>" src="...crowdriff.js" async>.
 *
 * Block table (1 column): one cell with the gallery script link.
 */
const CROWDRIFF_SCRIPT = 'https://starling.crowdriff.com/js/crowdriff.js';

function findGalleryId(element) {
  // 1. Original embed script, if it survived cleanup.
  const script = element.querySelector('script[id^="cr-init__"]');
  if (script) return script.id.replace(/^cr-init__/, '');

  // 2. Gallery mount point: <div id="cr__<hex id>"> (skip cr__app, cr__css-..., etc.)
  const mounts = [...element.querySelectorAll('[id^="cr__"]')];
  for (const el of mounts) {
    const m = el.id.match(/^cr__([0-9a-f]{8,})$/i);
    if (m) return m[1];
  }

  // 3. Stylesheet id written by the loader: cr__css-<hex id>
  for (const el of mounts) {
    const m = el.id.match(/^cr__css-([0-9a-f]{8,})$/i);
    if (m) return m[1];
  }
  return null;
}

export default function parse(element, { document }) {
  const cells = [];

  const galleryId = findGalleryId(element);
  let href = null;
  if (galleryId) {
    href = `${CROWDRIFF_SCRIPT}?id=cr-init__${galleryId}`;
  } else {
    // Fallback: any other embed script / iframe source in the panel.
    const other = element.querySelector('script[src], iframe[src]');
    if (other) href = other.getAttribute('src');
  }

  if (href) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = href;
    p.append(a);
    cells.push([p]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'widget-ugc-gallery', cells });
  element.replaceWith(block);
}
