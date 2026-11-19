/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import cardsCenteredParser from './parsers/cards-centered.js';
import columnsOverlapParser from './parsers/columns-overlap.js';
import cardsMosaicParser from './parsers/cards-mosaic.js';
import cardsCarouselParser from './parsers/cards-carousel.js';
import widgetUgcGalleryParser from './parsers/widget-ugc-gallery.js';
import cardsBoxedParser from './parsers/cards-boxed.js';
import accordionImageParser from './parsers/accordion-image.js';
import columnsMediaParser from './parsers/columns-media.js';
import accordionTwoColParser from './parsers/accordion-two-col.js';
import columnsBannerAdParser from './parsers/columns-banner-ad.js';
import columnsSplitPanelsParser from './parsers/columns-split-panels.js';
import cleanupTransformer from './transformers/visitorlando-cleanup.js';
import sectionsTransformer from './transformers/visitorlando-sections.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.visitorlando.com/"
  ],
  "representativeUrl": "https://www.visitorlando.com/",
  "description": "Visit Orlando homepage: split hero, promo bands, card grids, carousels, accordions, social gallery and partner panels",
  "urlPattern": "/",
  "blocks": [
    {
      "name": "hero-split",
      "instances": [
        "#slideshow-container section.hero-primary"
      ]
    },
    {
      "name": "cards-centered",
      "instances": [
        "#main-content section.ccl-widget.core-cards.double-highlight"
      ]
    },
    {
      "name": "columns-overlap",
      "instances": [
        ".contentRender_21 section.ccl-widget.core-side-by-side",
        ".dynamic_ab_panel section.core-side-by-side.side-by-side-1-across"
      ]
    },
    {
      "name": "cards-mosaic",
      "instances": [
        "#main-content div.mosaic.mosaic-grid"
      ]
    },
    {
      "name": "cards-carousel",
      "instances": [
        "#main-content div.custom-carousel"
      ]
    },
    {
      "name": "widget-ugc-gallery",
      "instances": [
        "#main-content div.panel-ugc-lazyloader"
      ]
    },
    {
      "name": "cards-boxed",
      "instances": [
        "#main-content section.ccl-widget.core-cards.cards-3-across"
      ]
    },
    {
      "name": "accordion-image",
      "instances": [
        "#main-content section.core-side-by-side-accordion"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "#main-content > div.contentRender_name_plugins_collections_template_custom_core_side_by_side_1_across > section.core-side-by-side",
        ".contentRender_35 > section.core-side-by-side"
      ]
    },
    {
      "name": "accordion-two-col",
      "instances": [
        "#main-content section.core-faqs"
      ]
    },
    {
      "name": "columns-banner-ad",
      "instances": [
        "#main-content div.partner-banner-ad"
      ]
    },
    {
      "name": "columns-split-panels",
      "instances": [
        "#main-content div.panel-container div.double-cta"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Hero - Orlando Welcomes You",
      "selector": [
        "#slideshow-container"
      ],
      "style": null,
      "blocks": [
        "hero-split"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Holly Jolly Guide to Holiday Fun",
      "selector": [
        "#main-content > div.contentRender_name_plugins_collections_template_custom_centered_cta",
        "#main-content > div.contentRender_15"
      ],
      "style": "blue, centered",
      "blocks": [],
      "defaultContent": [
        "#main-content section.centered-cta"
      ]
    },
    {
      "id": "section-3",
      "name": "Who Should Visit Orlando? Everyone.",
      "selector": [
        "#main-content > div.contentRender_16"
      ],
      "style": "teal, centered",
      "blocks": [
        "cards-centered"
      ],
      "defaultContent": [
        ".contentRender_17 section.widget-heading"
      ]
    },
    {
      "id": "section-4",
      "name": "Give the Gift of Memories (sponsored promo)",
      "selector": [
        "#main-content > div.contentRender_19"
      ],
      "style": null,
      "blocks": [
        "columns-overlap"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "Uncover the Wonders of Your Ultimate Destination",
      "selector": [
        "#main-content > div.contentRender_22",
        "#main-content > div.contentRender_23"
      ],
      "style": "centered",
      "blocks": [
        "cards-mosaic"
      ],
      "defaultContent": [
        ".contentRender_22 section.widget-heading"
      ]
    },
    {
      "id": "section-6",
      "name": "Unique Orlando Experiences",
      "selector": [
        "#main-content > div.contentRender_24"
      ],
      "style": null,
      "blocks": [
        "cards-carousel"
      ],
      "defaultContent": [
        ".contentRender_24 h2.template-title"
      ]
    },
    {
      "id": "section-7",
      "name": "#VisitOrlando social gallery",
      "selector": [
        "#main-content > div.contentRender_26",
        "#main-content > div.contentRender_27"
      ],
      "style": "centered",
      "blocks": [
        "widget-ugc-gallery"
      ],
      "defaultContent": [
        ".contentRender_26 section.widget-heading"
      ]
    },
    {
      "id": "section-8",
      "name": "Something Is Always Happening in Orlando",
      "selector": [
        "#main-content > div.contentRender_30"
      ],
      "style": "blue, centered",
      "blocks": [
        "cards-boxed"
      ],
      "defaultContent": [
        ".contentRender_31 section.widget-heading"
      ]
    },
    {
      "id": "section-9",
      "name": "Start Planning Your Getaway",
      "selector": [
        "#main-content > div.contentRender_33",
        "#main-content > div.contentRender_34"
      ],
      "style": null,
      "blocks": [
        "accordion-image"
      ],
      "defaultContent": [
        ".contentRender_33 section.widget-heading"
      ]
    },
    {
      "id": "section-10",
      "name": "Interactive Map",
      "selector": [
        "#main-content > div.contentRender_35"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-11",
      "name": "From Our Blog",
      "selector": [
        "#main-content > div.contentRender_36"
      ],
      "style": null,
      "blocks": [
        "cards-carousel"
      ],
      "defaultContent": [
        ".contentRender_36 h2.template-title"
      ]
    },
    {
      "id": "section-12",
      "name": "Frequently Asked Questions About Orlando",
      "selector": [
        "#main-content > div.contentRender_37",
        "#main-content > div.contentRender_38"
      ],
      "style": "centered",
      "blocks": [
        "accordion-two-col"
      ],
      "defaultContent": [
        ".contentRender_37 section.widget-heading"
      ]
    },
    {
      "id": "section-13",
      "name": "More to Explore (sponsored)",
      "selector": [
        "#main-content > div.contentRender_40",
        "#main-content > div.contentRender_43"
      ],
      "style": "centered",
      "blocks": [
        "cards-centered",
        "columns-banner-ad"
      ],
      "defaultContent": [
        ".contentRender_41 section.widget-heading"
      ]
    },
    {
      "id": "section-14",
      "name": "Free Planning Help / Fun for Everyone",
      "selector": [
        "#main-content > div.contentRender_44"
      ],
      "style": "light-grey",
      "blocks": [
        "columns-split-panels"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-split': heroSplitParser,
  'cards-centered': cardsCenteredParser,
  'columns-overlap': columnsOverlapParser,
  'cards-mosaic': cardsMosaicParser,
  'cards-carousel': cardsCarouselParser,
  'widget-ugc-gallery': widgetUgcGalleryParser,
  'cards-boxed': cardsBoxedParser,
  'accordion-image': accordionImageParser,
  'columns-media': columnsMediaParser,
  'accordion-two-col': accordionTwoColParser,
  'columns-banner-ad': columnsBannerAdParser,
  'columns-split-panels': columnsSplitPanelsParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const transformers = [cleanupTransformer, ...lateTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
