import { loadCSS } from '../../scripts/aem.js';

/**
 * Widget UGC Gallery: lazy-loads a third-party user-generated-content
 * social photo gallery when the block nears the viewport.
 *
 * The block holds one link. Supported link types:
 * - a widget page under `/widgets/` (`.html`): its html, css and js are loaded
 *   the same way the project widget block does;
 * - a gallery script (`.js`): injected as a script tag; query params become
 *   data attributes and an `id` param becomes the script id
 *   (e.g. CrowdRiff `cr-init__<galleryId>`);
 * - any other URL: embedded in an iframe.
 * Any other authored content in the block is kept as a caption.
 */

function codeBasePath() {
  return (window.hlx && window.hlx.codeBasePath) || '';
}

async function loadWidgetPage(container, url) {
  const segments = url.pathname.split('/').filter((p) => p);
  const name = segments[segments.length - 1].split('.')[0];
  const folder = segments.slice(1, -1).join('/');
  const base = `${codeBasePath()}/widgets/${folder ? `${folder}/` : ''}${name}`;
  container.classList.add(name);
  url.searchParams.forEach((value, key) => {
    container.dataset[key] = value;
  });
  const resp = await fetch(`${base}.html`);
  if (!resp.ok) throw new Error(`widget html ${resp.status}`);
  container.innerHTML = await resp.text();
  await Promise.all([
    loadCSS(`${base}.css`),
    import(`${base}.js`).then((mod) => (mod.default ? mod.default(container) : null)),
  ]);
}

function loadScriptEmbed(container, url) {
  const script = document.createElement('script');
  const id = url.searchParams.get('id');
  if (id) script.id = id;
  url.searchParams.forEach((value, key) => {
    if (key !== 'id') script.dataset[key] = value;
  });
  script.async = true;
  script.src = url.href;
  container.append(script);
}

function loadIframeEmbed(container, url, title) {
  const iframe = document.createElement('iframe');
  iframe.src = url.href;
  iframe.title = title || 'Social gallery';
  iframe.loading = 'lazy';
  iframe.setAttribute('allowfullscreen', '');
  container.append(iframe);
}

async function loadGallery(block, container, url, title) {
  try {
    if (url.pathname.includes('/widgets/') && /\.html$/i.test(url.pathname)) {
      await loadWidgetPage(container, url);
    } else if (/\.js$/i.test(url.pathname)) {
      loadScriptEmbed(container, url);
    } else {
      loadIframeEmbed(container, url, title);
    }
    block.classList.add('widget-ugc-gallery-loaded');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('widget-ugc-gallery: failed to load gallery', error);
    block.classList.add('widget-ugc-gallery-error');
  }
}

export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) {
    block.classList.add('widget-ugc-gallery-empty');
    return;
  }

  let url;
  try {
    url = new URL(link.href, window.location.href);
  } catch {
    block.classList.add('widget-ugc-gallery-empty');
    return;
  }
  const title = link.title || link.textContent.trim();

  // remove the link (and its paragraph if it held only the link); keep other content
  const linkParent = link.parentElement;
  link.remove();
  if (linkParent && linkParent !== block && linkParent.textContent.trim() === '' && !linkParent.children.length) {
    linkParent.remove();
  }
  const caption = document.createElement('div');
  caption.className = 'widget-ugc-gallery-caption';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => caption.append(...cell.childNodes));

  const container = document.createElement('div');
  container.className = 'widget-ugc-gallery-embed';
  block.replaceChildren(container);
  if (caption.textContent.trim() || caption.querySelector('picture, img')) block.prepend(caption);

  const start = () => loadGallery(block, container, url, title);
  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      start();
    }
  }, { rootMargin: '300px' });
  observer.observe(block);
}
