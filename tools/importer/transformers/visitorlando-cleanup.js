/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for www.visitorlando.com (Simpleview CMS).
 *
 * beforeTransform: removes non-authorable chrome (header, footer, cookie
 * consent, chat drawer, skip links, language picker, portals), the dynamic
 * A/B variation switchers and their empty inner panels, and moves the
 * carousel headings (h2.template-title) out of div.custom-carousel so they
 * become default content placed right before the cards-carousel block.
 *
 * afterTransform: final cleanup of leftover non-content elements and
 * tracking attributes. HTML comments are intentionally left untouched.
 */

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

function getBlockInstanceSelectors(payload) {
  const blocks = (payload && payload.template && payload.template.blocks) || [];
  const selectors = [];
  blocks.forEach((b) => (b.instances || []).forEach((s) => selectors.push(s)));
  return selectors;
}

function isInsideBlockInstance(el, instanceSelectors) {
  return instanceSelectors.some((sel) => {
    try {
      return !!el.closest(sel);
    } catch (e) {
      return false;
    }
  });
}

function isEmptyElement(el) {
  return el.textContent.trim() === ''
    && !el.querySelector('img, picture, video, iframe, a[href]');
}

export default function transform(hookName, element, payload) {
  const root = element;

  if (hookName === 'beforeTransform') {
    // Site chrome and overlays
    removeAll(root, [
      'div.header-container',
      'div.footer-container',
      '#onetrust-consent-sdk',
      '[id^="onetrust-"]',
      '#mindtrip-container',
      '#mindtrip-open',
      'a.skip-link',
      '#ie-warning',
      '.gtranslate_wrapper',
      '#gallery-portal',
      '#quickview-detail',
      '#cr__fs-wrap',
    ]);

    // Dynamic A/B variation switchers ("Dynamic Variation:" select)
    removeAll(root, ['.dynamic_ab_switcher', '.dynamic_testing_switcher']);

    // Empty dynamic content inner panels
    root.querySelectorAll('.contentRender_name_plugins_dynamic_content_inner').forEach((el) => {
      if (isEmptyElement(el)) el.remove();
    });

    // Layout spacers (no content)
    root.querySelectorAll('.contentRender_name_plugins_common_spacer').forEach((el) => {
      if (isEmptyElement(el)) el.remove();
    });

    // Tracking pixels / scripts / iframes
    removeAll(root, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
      'img[width="1"][height="1"]',
      'img[src*="doubleclick.net"]',
      'img[src*="facebook.com/tr"]',
      'img[src*="google-analytics.com"]',
    ]);

    // Carousel headings: move h2.template-title out of the carousel block
    // element so it stays as default content before the cards-carousel block.
    root.querySelectorAll('#main-content div.custom-carousel').forEach((carousel) => {
      const title = carousel.querySelector('header.template-header h2.template-title');
      if (title && carousel.parentElement) {
        carousel.parentElement.insertBefore(title, carousel);
      }
    });

    // Carousel controls / gradients only when outside block instances
    const instanceSelectors = getBlockInstanceSelectors(payload);
    root.querySelectorAll('.glide__arrow, .slide-counter, .slider-gradient, .glide__arrows').forEach((el) => {
      if (!isInsideBlockInstance(el, instanceSelectors)) el.remove();
    });

    // Default-content CTA buttons: author them as EDS buttons (bold link = primary,
    // italic link = secondary/outlined). Links inside blocks are left to the parsers.
    root.querySelectorAll('#main-content a.button-default').forEach((a) => {
      if (isInsideBlockInstance(a, instanceSelectors) || a.closest('strong, em')) return;
      const wrap = root.ownerDocument.createElement(a.classList.contains('outlined') ? 'em' : 'strong');
      a.replaceWith(wrap);
      wrap.append(a);
    });
  }

  if (hookName === 'afterTransform') {
    removeAll(root, [
      'div.header-container',
      'div.footer-container',
      '#onetrust-consent-sdk',
      '#mindtrip-container',
      '#mindtrip-open',
      'a.skip-link',
      '.dynamic_ab_switcher',
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
    ]);

    // Strip tracking / inline handler attributes
    const attrs = ['onclick', 'onload', 'data-track', 'data-tracking', 'data-gtm', 'data-ga', 'data-analytics'];
    root.querySelectorAll('*').forEach((el) => {
      attrs.forEach((a) => el.removeAttribute(a));
    });
  }
}
