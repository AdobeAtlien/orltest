/*
 * Footer: data-driven from the footer fragment (content/footer.plain.html).
 * Fragment sections, in order:
 *   0 brand  – logo link, social links list (icon images), copyright line, partner logo link
 *   1 links  – link list (rendered as two columns)
 *   2 signup – heading, text and a sign-up link (rendered as a button)
 */

/**
 * Fetches the footer fragment. Metadata-independent: from /content on local preview pages
 * (/content/...), from the site root on published sites (no failing /content request there).
 * @returns {Promise<Element[]|null>} the fragment's top-level sections
 */
async function fetchFooterSections() {
  // the local preview serves pages (and the footer) under /content; published sites at the root
  const local = window.location.pathname.startsWith('/content/');
  let resp = await fetch(local ? '/content/footer.plain.html' : '/footer.plain.html');
  if (!resp.ok && local) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', new URL(img.getAttribute('src'), resp.url).href);
  });
  doc.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = source.getAttribute('srcset').split(',')
      .map((c) => c.trim().replace(/^\S+/, (u) => new URL(u, resp.url).href)).join(', ');
  });
  return [...doc.body.children].filter((node) => node.tagName === 'DIV');
}

/** Image links (social icons, partner logos) to other sites open in a new tab, as on the source. */
function markExternal(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.getAttribute('href'), window.location.href);
    if (url.host !== window.location.host && a.querySelector('img')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });
}

/**
 * Classifies the brand section: the paragraph holding only a linked image is a logo,
 * a list is the social links, a text paragraph is the copyright line.
 */
function decorateBrand(section) {
  section.className = 'footer-brand';
  const logos = [...section.querySelectorAll(':scope > p')].filter((p) => p.querySelector('a img') && !p.textContent.trim());
  logos.forEach((p, i) => p.classList.add(i ? 'footer-partner' : 'footer-logo'));
  section.querySelectorAll(':scope > p').forEach((p) => {
    if (!p.className) p.classList.add('footer-copyright');
  });
  const social = section.querySelector(':scope > ul');
  if (social) {
    social.className = 'footer-social';
    social.querySelectorAll('a').forEach((a) => {
      const img = a.querySelector('img');
      if (img && !a.getAttribute('aria-label')) a.setAttribute('aria-label', img.alt);
    });
  }
}

/**
 * "Cookie Settings" (authored as a `#consent` link) opens the consent tool's preferences on the
 * source. The site has no consent tool yet, so the item stays hidden; a consent tool shows it
 * with `document.body.classList.add('has-consent-settings')` and listens for the
 * `consent.settings` event the link dispatches. Matched by text too, in case an upload rewrote
 * the href.
 */
function decorateConsentLink(list) {
  list.querySelectorAll('li > a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href.endsWith('#consent') && !/^cookie settings$/i.test(a.textContent.trim())) return;
    a.setAttribute('href', '#consent');
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('consent.settings'));
    });
    a.parentElement.classList.add('footer-consent');
  });
}

export default async function decorate(block) {
  const sections = await fetchFooterSections();
  if (!sections) return;
  const [brand, links, signup] = sections;

  if (brand) decorateBrand(brand);
  let nav = null;
  if (links) {
    nav = document.createElement('nav');
    nav.className = 'footer-nav';
    const list = links.querySelector('ul');
    if (list) {
      list.className = 'footer-links';
      decorateConsentLink(list);
      nav.append(list);
    }
  }
  if (signup) {
    signup.className = 'footer-signup';
    const cta = signup.querySelector('p:last-child > a:only-child');
    if (cta) {
      cta.className = 'footer-signup-button';
      cta.parentElement.classList.add('footer-signup-cta');
    }
  }

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  inner.append(...[brand, nav, signup].filter(Boolean));
  // like the source, small screens show the partner logo at the end of the footer:
  // a copy is placed there and each copy is shown only at its own breakpoint
  const partner = brand?.querySelector('.footer-partner');
  if (partner) {
    const endCopy = partner.cloneNode(true);
    endCopy.classList.add('footer-partner-end');
    partner.classList.add('footer-partner-brand');
    inner.append(endCopy);
  }
  markExternal(inner);

  block.textContent = '';
  block.append(inner);
}
