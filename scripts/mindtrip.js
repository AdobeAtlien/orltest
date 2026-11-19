/*
 * Mindtrip "OPAL AI" chat, as on the source site: Mindtrip's partner overlay script.
 * Once loaded it adds the floating "ASK OPAL AI" launcher to the page and provides
 * `window.mindtrip.showFrame`, which opens the chat drawer.
 */
import { loadScript } from './aem.js';

const EMBED_URL = 'https://partner.mindtrip.ai/overlay/embed.js?orgid=visitorlando&locale=en';

let loading;

/** Loads the Mindtrip overlay script once; resolves when it has run. */
export function loadMindtrip() {
  if (!loading) loading = loadScript(EMBED_URL).catch(() => { loading = null; });
  return loading;
}

/**
 * Reads an authored chat link (`#mindtrip.ai/?q=<prompt>&hint=<hint>`).
 * @param {string} href link href
 * @returns {{prompt: string, hint: string}|null} chat options, or null for other links
 */
export function parseMindtripLink(href) {
  if (!href || !href.startsWith('#mindtrip.ai')) return null;
  const query = href.split('?')[1] || '';
  const params = new URLSearchParams(query);
  return { prompt: params.get('q') || '', hint: params.get('hint') || '' };
}

/**
 * Builds the source's chat CTA: a `.mindtrip-form` holding the hidden prompt and hint and a
 * `.mindtrip-button`. A click loads the Mindtrip script if needed and opens the chat with the
 * prompt and hint (also before the delayed load has run).
 * @param {string} label button text
 * @param {{prompt: string, hint: string}} options chat prompt and hint
 * @param {Element} icon optional icon element shown before the label
 * @returns {HTMLFormElement} the CTA
 */
export function buildMindtripCta(label, { prompt, hint }, icon) {
  const form = document.createElement('form');
  form.className = 'mindtrip-form';
  form.addEventListener('submit', (e) => e.preventDefault());

  const promptField = document.createElement('textarea');
  promptField.className = 'mindtrip-prompt';
  promptField.hidden = true;
  promptField.value = prompt;
  const hintField = document.createElement('input');
  hintField.className = 'mindtrip-hint';
  hintField.type = 'hidden';
  hintField.value = hint;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mindtrip-button';
  const text = document.createElement('span');
  text.className = 'mindtrip-button-text';
  text.textContent = label;
  if (icon) button.append(icon);
  button.append(text);

  // open through Mindtrip's public API (it queues the request until the chat is ready),
  // and keep the click from also reaching Mindtrip's page-wide listener (no double open)
  button.addEventListener('click', async (e) => {
    e.stopPropagation();
    await loadMindtrip();
    window.mindtrip?.showFrame?.(null, {
      trigger: 'cta', prompt, hint, button: label,
    });
  });

  form.append(promptField, hintField, button);
  return form;
}
