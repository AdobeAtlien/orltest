/*
 * Header: data-driven from the nav fragment (content/nav.plain.html).
 * Fragment sections, in order:
 *   0 brand   – logo link
 *   1 main    – top-level items; a nested <ul> is a panel. In a panel, items with an image are
 *               image cards, the first other item is the "overview" link, the rest the link grid.
 *               An item with its own nested <ul> drills in place (first child = its overview link).
 *   2 tools   – bar links shown beside the MENU button (icon images + label)
 *   3 menu    – MENU overlay sidebar: quick links list, icon links list, language label + list
 *   4 labels  – search label (with icon) and control labels: Menu, Close, Back
 */

const DESKTOP = window.matchMedia('(width >= 1280px)');
const ANIMATION_MS = 300;

/**
 * Fetches the nav fragment. Metadata-independent: from /content on local preview pages
 * (/content/...), from the site root on published sites (no failing /content request there).
 * @returns {Promise<Element[]|null>} the fragment's top-level sections
 */
async function fetchNavSections() {
  // the local preview serves pages (and the nav) under /content; published sites at the root
  const local = window.location.pathname.startsWith('/content/');
  let resp = await fetch(local ? '/content/nav.plain.html' : '/nav.plain.html');
  if (!resp.ok && local) resp = await fetch('/nav.plain.html');
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
  // published content wraps list-item text in <p>; unwrap so items read as <li><a>…</a><ul>…</ul>
  doc.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  return [...doc.body.children].filter((node) => node.tagName === 'DIV');
}

/**
 * Parses a nested <ul> into plain item objects.
 * @param {Element} ul list element
 * @returns {Array<Object>} items
 */
function parseList(ul) {
  if (!ul) return [];
  return [...ul.children].filter((li) => li.tagName === 'LI').map((li) => {
    const a = li.querySelector(':scope > a');
    const sub = li.querySelector(':scope > ul');
    const imgs = a ? [...a.querySelectorAll('img')] : [...li.querySelectorAll(':scope > img')];
    const textOf = (node) => [...node.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent).join('').trim();
    return {
      label: a ? a.textContent.trim() : textOf(li),
      href: a ? a.getAttribute('href') : null,
      imgs,
      children: sub ? parseList(sub) : null,
    };
  });
}

/** Splits a panel's items into image cards, the overview link and the grid items. */
function splitPanel(items) {
  const cards = items.filter((it) => it.imgs.length);
  const rest = items.filter((it) => !it.imgs.length);
  return { cards, overview: rest[0] || null, items: rest.slice(1) };
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  });
  children.flat().forEach((c) => { if (c !== null && c !== undefined) node.append(c); });
  return node;
}

function imageCard(card, cls) {
  const img = card.imgs[0].cloneNode();
  img.className = `${cls}-image`;
  img.loading = 'lazy';
  img.alt = '';
  return el('a', { class: cls, href: card.href }, img, el('span', { class: `${cls}-title` }, card.label));
}

/**
 * Renders a drill-down level (overview link + item list) into a container; items with children
 * replace the level in place, "Back" returns to the parent level.
 * @param {Element} container target
 * @param {Object} level { overview, items }
 * @param {Array<Object>} stack parent levels
 * @param {Object} labels control labels
 */
function renderLevel(container, level, stack, labels) {
  const depth = stack.length + 1;
  const top = el('div', { class: 'nav-level-top' });
  if (stack.length) {
    const back = el('button', { type: 'button', class: 'nav-back' }, labels.back);
    back.addEventListener('click', () => {
      const parent = stack[stack.length - 1];
      renderLevel(container, parent, stack.slice(0, -1), labels);
      container.querySelector('a, button')?.focus();
    });
    top.append(back);
  }
  if (level.overview) {
    top.append(el('a', { class: 'nav-overview', href: level.overview.href }, level.overview.label));
  }
  const grid = el('ul', { class: 'nav-level-grid' });
  level.items.forEach((item) => {
    const link = el('a', { class: 'nav-sub-link', href: item.href }, item.label);
    const control = el('div', { class: 'nav-sub-control' }, link);
    const li = el('li', { class: 'nav-sub-item' }, control);
    if (item.children) {
      li.classList.add('has-children');
      const toggle = el('button', { type: 'button', class: 'nav-sub-toggle', 'aria-label': `${labels.open} ${item.label}` });
      control.append(toggle);
      const drill = (e) => {
        e.preventDefault();
        const child = { overview: item.children[0] || null, items: item.children.slice(1) };
        renderLevel(container, child, [...stack, level], labels);
        container.querySelector('.nav-back')?.focus();
      };
      link.addEventListener('click', drill);
      toggle.addEventListener('click', drill);
    }
    grid.append(li);
  });
  const view = el('div', { class: 'nav-level', 'data-level': depth }, top, grid);
  container.replaceChildren(view);
}

/** Bar panel (desktop dropdown) for a top-level item. */
function buildPanel(item, labels) {
  const { cards, overview, items } = splitPanel(item.children);
  const drill = el('div', { class: 'nav-drill' });
  const root = { overview, items };
  const reset = () => renderLevel(drill, root, [], labels);
  reset();
  const panel = el(
    'div',
    { class: 'nav-panel' },
    el('div', { class: 'nav-panel-inner' }, el('div', { class: 'nav-cards' }, cards.map((c) => imageCard(c, 'nav-card'))), drill),
  );
  panel.reset = reset;
  return panel;
}

function linkWithIcons(item, cls) {
  // a second icon image is the hover state (e.g. outline ticket -> filled ticket)
  const icon = el('span', { class: `${cls}-icon`, 'aria-hidden': 'true' }, item.imgs.map((img, i) => {
    const clone = img.cloneNode();
    clone.alt = '';
    if (item.imgs.length > 1) clone.className = i ? 'is-hover' : 'is-default';
    return clone;
  }));
  const external = item.href && /^https?:/.test(item.href) && !item.href.includes(window.location.host);
  return el(
    'a',
    {
      class: cls, href: item.href, target: external ? '_blank' : null, rel: external ? 'noopener' : null,
    },
    icon,
    el('span', { class: `${cls}-text` }, item.label),
  );
}

function menuButton(label, cls, controls) {
  return el(
    'button',
    {
      type: 'button', class: cls, 'aria-controls': controls, 'aria-expanded': 'false', 'aria-label': label,
    },
    el('span', { class: 'nav-menu-label' }, label),
    el('span', { class: 'nav-lines', 'aria-hidden': 'true' }),
  );
}

export default async function decorate(block) {
  const sections = await fetchNavSections();
  if (!sections) return;
  const [brandSec, mainSec, toolsSec, menuSec, labelsSec] = sections;

  const labelList = parseList(labelsSec?.querySelector('ul')).map((i) => i.label);
  const searchP = labelsSec?.querySelector('p');
  const labels = {
    menu: labelList[0] || '',
    close: labelList[1] || '',
    back: labelList[2] || '',
    backToMain: labelList[3] || '',
    open: '+',
    search: searchP ? searchP.textContent.trim() : '',
    searchIcon: searchP?.querySelector('img'),
  };

  const brandLink = brandSec.querySelector('a');
  const brand = () => {
    const a = brandLink.cloneNode(true);
    a.className = 'nav-brand-link';
    a.setAttribute('aria-label', a.querySelector('img')?.alt || a.textContent.trim());
    return el('div', { class: 'nav-brand' }, a);
  };
  const mainItems = parseList(mainSec.querySelector('ul'));
  const toolItems = parseList(toolsSec?.querySelector('ul'));

  // ---- bar ----
  const sectionsList = el('ul', { class: 'nav-sections' });
  const barItems = [];
  mainItems.forEach((item) => {
    const link = el('a', { class: 'nav-link', href: item.href }, item.label, el('span', { class: 'nav-underline', 'aria-hidden': 'true' }));
    const control = el('div', { class: 'nav-item-control' }, link);
    const li = el('li', { class: 'nav-item' }, control);
    if (item.children) {
      li.classList.add('has-panel');
      const toggle = el('button', {
        type: 'button', class: 'nav-toggle', 'aria-expanded': 'false', 'aria-label': `${item.label} ${labels.open}`,
      });
      control.append(toggle);
      const panel = buildPanel(item, labels);
      li.append(panel);
      barItems.push({ li, toggle, panel });
    }
    sectionsList.append(li);
  });

  const closePanel = (entry) => {
    if (!entry.li.classList.contains('is-open')) return;
    entry.li.classList.remove('is-open');
    entry.li.classList.add('is-closing');
    entry.toggle.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      entry.li.classList.remove('is-closing');
      entry.panel.reset();
    }, ANIMATION_MS);
  };
  const closeAllPanels = () => barItems.forEach(closePanel);
  barItems.forEach((entry) => {
    entry.toggle.addEventListener('click', () => {
      const open = entry.li.classList.contains('is-open');
      closeAllPanels();
      if (!open) {
        entry.li.classList.add('is-open');
        entry.toggle.setAttribute('aria-expanded', 'true');
      }
    });
    // like the source: once the pointer has entered the open panel, leaving it closes it
    entry.panel.addEventListener('mouseenter', () => {
      entry.panel.addEventListener('mouseleave', () => closePanel(entry), { once: true });
    });
  });

  const tools = el('div', { class: 'nav-tools' }, toolItems.map((t) => linkWithIcons(t, 'nav-tool-link')));
  const menuOpen = menuButton(labels.menu, 'nav-menu-toggle', 'nav-menu');
  tools.append(menuOpen);

  const bar = el(
    'div',
    { class: 'nav-bar' },
    el('div', { class: 'nav-bar-inner' }, brand(), el('div', { class: 'nav-main' }, sectionsList), tools),
  );

  // ---- MENU overlay ----
  const [quickUl, iconUl, langUl] = menuSec ? [...menuSec.querySelectorAll(':scope > ul')] : [];
  const langP = menuSec?.querySelector(':scope > p');
  const sidebar = el('div', { class: 'nav-menu-sidebar' }, brand());
  sidebar.append(el('ul', { class: 'nav-menu-quick' }, parseList(quickUl).map((q) => el('li', {}, el('a', { href: q.href }, q.label)))));
  sidebar.append(el('ul', { class: 'nav-menu-icons' }, parseList(iconUl).map((q) => el('li', {}, linkWithIcons(q, 'nav-tool-link')))));
  if (langUl) {
    const langIcon = langP?.querySelector('img')?.cloneNode();
    if (langIcon) langIcon.className = 'nav-locale-icon';
    const langToggle = el('button', { type: 'button', class: 'nav-locale-toggle', 'aria-expanded': 'false' }, langP ? langP.textContent.trim() : '', langIcon);
    const options = el('ul', { class: 'nav-locale-options' }, parseList(langUl).map((l) => {
      let { href } = l;
      try {
        const u = new URL(href);
        if (u.searchParams.get('tl') === 'en') href = window.location.href;
        else if (u.searchParams.has('u')) { u.searchParams.set('u', window.location.href); href = u.href; }
      } catch { /* keep authored href */ }
      return el('li', {}, el('a', { href }, l.label));
    }));
    const locale = el('div', { class: 'nav-locale' }, langToggle, options);
    langToggle.addEventListener('click', () => {
      const open = langToggle.getAttribute('aria-expanded') === 'true';
      langToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    sidebar.append(locale);
  }

  const searchInput = el('input', {
    type: 'search', name: 'q', id: 'nav-search-input', placeholder: labels.search, autocomplete: 'off',
  });
  const searchIcon = labels.searchIcon ? labels.searchIcon.cloneNode() : null;
  const search = el(
    'form',
    {
      class: 'nav-search', action: '/search/', method: 'get', role: 'search',
    },
    el('button', { type: 'submit', class: 'nav-search-submit', 'aria-label': labels.search }, searchIcon),
    el('label', { class: 'nav-visually-hidden', for: 'nav-search-input' }, labels.search),
    searchInput,
  );

  const menuClose = menuButton(labels.close, 'nav-menu-close', 'nav-menu');
  const menuList = el('ul', { class: 'nav-menu-main' });
  const flyouts = [];
  mainItems.forEach((item) => {
    const control = el('div', { class: 'nav-menu-control' }, el('a', { class: 'nav-menu-link', href: item.href }, item.label));
    const li = el('li', { class: 'nav-menu-item' }, control);
    if (item.children) {
      const { cards, overview, items } = splitPanel(item.children);
      const toggle = el('button', {
        type: 'button', class: 'nav-menu-plus', 'aria-expanded': 'false', 'aria-label': `${item.label} ${labels.open}`,
      });
      control.append(toggle);
      const drill = el('div', { class: 'nav-drill' });
      const reset = () => renderLevel(drill, { overview, items }, [], labels);
      reset();
      const flyout = el('div', { class: 'nav-flyout' }, drill, el('div', { class: 'nav-flyout-cards' }, cards.map((c) => imageCard(c, 'nav-card'))));
      // below the desktop breakpoint the slide-in panel has a "back to main menu" button
      const backToMain = el('button', { type: 'button', class: 'nav-flyout-back' }, labels.backToMain);
      li.append(flyout, backToMain);
      flyouts.push({
        li, toggle, reset, backToMain,
      });
    }
    menuList.append(li);
  });
  const menu = el(
    'div',
    { class: 'nav-menu', id: 'nav-menu', 'aria-hidden': 'true' },
    sidebar,
    el('div', { class: 'nav-menu-top' }, brand(), menuClose),
    el('div', { class: 'nav-menu-search' }, search),
    el('div', { class: 'nav-menu-body' }, menuList),
  );

  const closeFlyouts = (except) => flyouts.forEach((f) => {
    if (f === except || !f.li.classList.contains('is-open')) return;
    f.li.classList.remove('is-open');
    f.toggle.setAttribute('aria-expanded', 'false');
    setTimeout(f.reset, ANIMATION_MS);
  });
  flyouts.forEach((f) => {
    f.toggle.addEventListener('click', () => {
      const open = f.li.classList.contains('is-open');
      closeFlyouts(f);
      f.li.classList.toggle('is-open', !open);
      f.toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      menu.classList.toggle('has-flyout', !open);
    });
    f.backToMain.addEventListener('click', () => {
      closeFlyouts();
      menu.classList.remove('has-flyout');
      f.toggle.focus();
    });
  });

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menuOpen.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuClose.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-menu-open', open);
    if (!open) {
      closeFlyouts();
      menu.classList.remove('has-flyout');
    }
    (open ? menuClose : menuOpen).focus();
  };
  menuOpen.addEventListener('click', () => { closeAllPanels(); setMenu(true); });
  menuClose.addEventListener('click', () => setMenu(false));

  // ---- global behaviour ----
  const nav = el('nav', { id: 'nav', 'aria-label': 'Main' }, bar, menu);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menu.classList.contains('is-open')) setMenu(false);
    else closeAllPanels();
  });
  document.addEventListener('click', (e) => {
    // composedPath: drill-down clicks re-render the list, detaching the clicked node
    if (!e.composedPath().includes(sectionsList)) closeAllPanels();
  });
  // crossing the desktop breakpoint resets open panels and the overlay
  DESKTOP.addEventListener('change', () => {
    closeAllPanels();
    if (menu.classList.contains('is-open')) setMenu(false);
  });

  block.textContent = '';
  block.append(el('div', { class: 'nav-wrapper' }, nav));
}
