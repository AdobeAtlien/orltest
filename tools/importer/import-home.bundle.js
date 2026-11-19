/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-split.js
  function parse(element, { document }) {
    const cells = [];
    let imageEl = null;
    const video = element.querySelector(".media-col video, video");
    const posterSrc = video && (video.getAttribute("poster") || video.getAttribute("data-poster"));
    if (posterSrc) {
      imageEl = document.createElement("img");
      imageEl.src = posterSrc;
      imageEl.alt = "";
    } else {
      const mediaImg = element.querySelector(".media-col picture, .media-col img");
      if (mediaImg) imageEl = mediaImg;
    }
    let videoLink = null;
    if (video) {
      const sources = [video.getAttribute("src"), ...[...video.querySelectorAll("source[src]")].map((s) => s.getAttribute("src"))].filter(Boolean);
      const videoSrc = sources.find((s) => /\.(mp4|webm)(\?|$)/i.test(s)) || sources[0];
      if (videoSrc) {
        const href = new URL(videoSrc, "https://www.visitorlando.com/").href;
        videoLink = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        videoLink.append(a);
      }
    }
    if (imageEl || videoLink) cells.push([[imageEl, videoLink].filter(Boolean)]);
    const content = [];
    const srcHeading = element.querySelector(".content-col h1, .content-col h2, h1, h2");
    if (srcHeading) {
      const text = srcHeading.textContent.replace(/\s+/g, " ").trim();
      if (text) {
        const h = document.createElement(srcHeading.tagName.toLowerCase() === "h2" ? "h2" : "h1");
        h.textContent = text;
        content.push(h);
      }
    }
    element.querySelectorAll(".content-col p.desc, .content-col .content-inner > p").forEach((p) => {
      if (p.textContent.trim() && !content.includes(p)) content.push(p);
    });
    const ctaLinks = [...element.querySelectorAll(".content-col .button-row a[href], .content-col a.button-default[href]")].filter((a, i, arr) => arr.indexOf(a) === i && !a.closest("form"));
    ctaLinks.forEach((a) => {
      const text = a.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = text;
      p.append(link);
      content.push(p);
    });
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-centered.js
  function cleanHref(href) {
    if (!href) return href;
    try {
      const url = new URL(href, "https://www.visitorlando.com/");
      if (/doubleclick\.net$/i.test(url.hostname) && url.searchParams.get("adurl")) {
        return url.searchParams.get("adurl");
      }
    } catch (e) {
    }
    return href;
  }
  function makeLink(document, href, text) {
    const a = document.createElement("a");
    a.href = cleanHref(href);
    a.textContent = text;
    return a;
  }
  function parse2(element, { document }) {
    const cells = [];
    let cards = [...element.querySelectorAll(":scope > .slides > article.slide")];
    if (!cards.length) cards = [...element.querySelectorAll("article.slide, .slide")];
    cards.forEach((card) => {
      const img = card.querySelector(".slide-top img, .img-cont img, img");
      let imageCell = "";
      if (img) {
        const pic = document.createElement("img");
        pic.src = img.getAttribute("src") || img.getAttribute("data-src") || "";
        pic.alt = img.getAttribute("alt") || "";
        imageCell = pic;
      }
      const text = [];
      if (card.querySelector(".sponsored")) {
        const p = document.createElement("p");
        p.textContent = "Sponsored";
        text.push(p);
      }
      const titleEl = card.querySelector(".slide-title, h2, h3");
      if (titleEl) {
        const h = document.createElement("h3");
        const titleText = titleEl.textContent.replace(/\s+/g, " ").trim();
        const titleLink = titleEl.querySelector("a[href]");
        if (titleLink) h.append(makeLink(document, titleLink.getAttribute("href"), titleText));
        else h.textContent = titleText;
        if (titleText) text.push(h);
      }
      card.querySelectorAll(".content-section .inner > p, .content-section p").forEach((p) => {
        if (p.textContent.trim() && !text.includes(p)) text.push(p);
      });
      const cta = card.querySelector(".slide-footer a[href], a.button-arrow[href]");
      if (cta) {
        const ctaText = cta.textContent.replace(/\s+/g, " ").trim();
        if (ctaText) {
          const p = document.createElement("p");
          p.append(makeLink(document, cta.getAttribute("href"), ctaText));
          text.push(p);
        }
      }
      if (!imageCell && !text.length) return;
      cells.push([imageCell, text]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-centered", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-overlap.js
  function cleanHref2(href) {
    if (!href) return href;
    try {
      const url = new URL(href, "https://www.visitorlando.com/");
      if (/doubleclick\.net$/i.test(url.hostname) && url.searchParams.get("adurl")) {
        return url.searchParams.get("adurl");
      }
    } catch (e) {
    }
    return href;
  }
  function linkPara(document, href, text) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = cleanHref2(href);
    a.textContent = text;
    p.append(a);
    return p;
  }
  function parse3(element, { document }) {
    const cells = [];
    let slides = [...element.querySelectorAll(":scope > .slides > article.slide, :scope > .slides > .slide")];
    slides = slides.filter((s, i) => slides.indexOf(s) === i);
    if (!slides.length) slides = [...element.querySelectorAll("article.slide")];
    if (!slides.length) slides = [element];
    slides.forEach((slide) => {
      const media = [];
      const img = slide.querySelector(".slide-top img, .img-cont img");
      if (img) {
        const pic = document.createElement("img");
        pic.src = img.getAttribute("src") || img.getAttribute("data-src") || "";
        pic.alt = img.getAttribute("alt") || "";
        media.push(pic);
      }
      if (slide.querySelector(".sponsored")) {
        const p = document.createElement("p");
        p.textContent = "Sponsored";
        media.push(p);
      }
      const text = [];
      const titleEl = slide.querySelector(".content-section .slide-title, .content-section h2, .content-section h3");
      if (titleEl) {
        const titleText = titleEl.textContent.replace(/\s+/g, " ").trim();
        if (titleText) {
          const h = document.createElement("h2");
          const a = titleEl.querySelector("a[href]");
          if (a) {
            const link = document.createElement("a");
            link.href = cleanHref2(a.getAttribute("href"));
            link.textContent = titleText;
            h.append(link);
          } else {
            h.textContent = titleText;
          }
          text.push(h);
        }
      }
      slide.querySelectorAll(".content-section .content-top > p, .content-section .content-top p").forEach((p) => {
        if (p.textContent.trim() && !text.includes(p)) text.push(p);
      });
      slide.querySelectorAll(".content-section .slide-footer a[href]").forEach((a) => {
        const t = a.textContent.replace(/\s+/g, " ").trim();
        if (t) text.push(linkPara(document, a.getAttribute("href"), t));
      });
      if (!media.length && !text.length) return;
      cells.push([media.length ? media : "", text.length ? text : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-overlap", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-mosaic.js
  function parse4(element, { document }) {
    const cells = [];
    let tiles = [...element.querySelectorAll(".cols > .slide")];
    if (!tiles.length) tiles = [...element.querySelectorAll(".slide")];
    tiles.forEach((tile) => {
      const img = tile.querySelector(".img-cont img, img");
      let imageCell = "";
      if (img) {
        const pic = document.createElement("img");
        pic.src = img.getAttribute("src") || img.getAttribute("data-src") || "";
        pic.alt = (img.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
        imageCell = pic;
      }
      const text = [];
      const titleEl = tile.querySelector(".content-title, h2, h3, h4");
      const label = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const linkEl = tile.querySelector("a.content-link[href], a[href]");
      if (label) {
        const p = document.createElement("p");
        if (linkEl) {
          const a = document.createElement("a");
          a.href = linkEl.getAttribute("href");
          a.textContent = label;
          p.append(a);
        } else {
          p.textContent = label;
        }
        text.push(p);
      }
      const credit = tile.querySelector(".credits");
      const creditText = credit ? credit.textContent.replace(/\s+/g, " ").trim() : "";
      if (creditText) {
        const p = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = creditText;
        p.append(em);
        text.push(p);
      }
      if (!imageCell && !text.length) return;
      cells.push([imageCell, text]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-mosaic", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-carousel.js
  function cleanHref3(href) {
    if (!href) return href;
    try {
      const url = new URL(href, "https://www.visitorlando.com/");
      if (/doubleclick\.net$/i.test(url.hostname) && url.searchParams.get("adurl")) {
        return url.searchParams.get("adurl");
      }
    } catch (e) {
    }
    return href;
  }
  function looksTruncated(src) {
    return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
  }
  function bestImageSrc(card) {
    const img = card.querySelector(".img-cont img, img");
    const src = img ? img.getAttribute("src") || img.getAttribute("data-src") || "" : "";
    if (!looksTruncated(src)) return src;
    const sources = [...card.querySelectorAll(".img-cont picture source[srcset], picture source[srcset], source[data-srcset]")];
    for (const s of sources) {
      const set = (s.getAttribute("srcset") || s.getAttribute("data-srcset") || "").trim();
      const first = set.split(/\s+/)[0];
      if (first && !looksTruncated(first)) return first;
    }
    return src;
  }
  function parse5(element, { document }) {
    const cells = [];
    let cards = [...element.querySelectorAll(".glide__slides > article.slide:not(.glide__slide--clone)")];
    if (!cards.length) cards = [...element.querySelectorAll("article.slide:not(.glide__slide--clone)")];
    if (!cards.length) cards = [...element.querySelectorAll("article.slide, .slide")];
    cards.forEach((card) => {
      const wrapper = card.querySelector("a.slide-wrapper[href]") || card.querySelector("a[href]");
      const href = wrapper ? cleanHref3(wrapper.getAttribute("href")) : "";
      const titleEl = card.querySelector(".slide-title, h3, h2");
      const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : (wrapper && wrapper.getAttribute("title") || "").trim();
      let imageCell = "";
      const src = bestImageSrc(card);
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        const srcImg = card.querySelector(".img-cont img, img");
        img.alt = srcImg && srcImg.getAttribute("alt") || titleText || "";
        imageCell = img;
      }
      const text = [];
      if (card.querySelector(".sponsored")) {
        const p = document.createElement("p");
        p.textContent = "Sponsored";
        text.push(p);
      }
      const cats = [...card.querySelectorAll(".categories .cat")].map((c) => c.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
      if (cats.length) {
        const ul = document.createElement("ul");
        cats.forEach((c) => {
          const li = document.createElement("li");
          li.textContent = c;
          ul.append(li);
        });
        text.push(ul);
      }
      if (titleText) {
        const h = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = titleText;
          h.append(a);
        } else {
          h.textContent = titleText;
        }
        text.push(h);
      }
      const desc = card.querySelector(".slide-desc");
      if (desc && desc.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = desc.textContent.replace(/\s+/g, " ").trim();
        text.push(p);
      }
      const more = card.querySelector(".read-more");
      const moreText = more ? more.textContent.replace(/\s+/g, " ").trim() : "";
      if (href && moreText) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = moreText;
        p.append(a);
        text.push(p);
      }
      if (!imageCell && !text.length) return;
      cells.push([imageCell, text]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/widget-ugc-gallery.js
  var CROWDRIFF_SCRIPT = "https://starling.crowdriff.com/js/crowdriff.js";
  function findGalleryId(element) {
    const script = element.querySelector('script[id^="cr-init__"]');
    if (script) return script.id.replace(/^cr-init__/, "");
    const mounts = [...element.querySelectorAll('[id^="cr__"]')];
    for (const el of mounts) {
      const m = el.id.match(/^cr__([0-9a-f]{8,})$/i);
      if (m) return m[1];
    }
    for (const el of mounts) {
      const m = el.id.match(/^cr__css-([0-9a-f]{8,})$/i);
      if (m) return m[1];
    }
    return null;
  }
  function parse6(element, { document }) {
    const cells = [];
    const galleryId = findGalleryId(element);
    let href = null;
    if (galleryId) {
      href = `${CROWDRIFF_SCRIPT}?id=cr-init__${galleryId}`;
    } else {
      const other = element.querySelector("script[src], iframe[src]");
      if (other) href = other.getAttribute("src");
    }
    if (href) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = href;
      p.append(a);
      cells.push([p]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "widget-ugc-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-boxed.js
  function looksTruncated2(src) {
    return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
  }
  function bestImageSrc2(scope) {
    const img = scope.querySelector("img");
    const src = img ? img.getAttribute("src") || img.getAttribute("data-src") || "" : "";
    if (!looksTruncated2(src)) return src;
    const sources = [...scope.querySelectorAll("picture source[srcset]")];
    sources.sort((a, b) => (/image\/(avif|webp)/.test(a.getAttribute("type") || "") ? 1 : 0) - (/image\/(avif|webp)/.test(b.getAttribute("type") || "") ? 1 : 0));
    for (const s of sources) {
      const first = (s.getAttribute("srcset") || "").trim().split(/\s+/)[0];
      if (first && !looksTruncated2(first)) return first;
    }
    return src;
  }
  function parse7(element, { document }) {
    const cells = [];
    let cards = [...element.querySelectorAll(":scope > .slides > article.slide")];
    if (!cards.length) cards = [...element.querySelectorAll("article.slide, .slide")];
    cards.forEach((card) => {
      let imageCell = "";
      const imgScope = card.querySelector(".slide-top") || card;
      const src = bestImageSrc2(imgScope);
      if (src) {
        const srcImg = imgScope.querySelector("img");
        const img = document.createElement("img");
        img.src = src;
        img.alt = (srcImg && srcImg.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
        imageCell = img;
      }
      const text = [];
      const titleEl = card.querySelector(".content-section .slide-title, .content-section h2, .content-section h3");
      const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const linkEl = titleEl && titleEl.querySelector("a[href]") || card.querySelector(".img-cont a[href], a[href]");
      if (titleText) {
        const h = document.createElement("h3");
        if (linkEl) {
          const a = document.createElement("a");
          a.href = linkEl.getAttribute("href");
          a.textContent = titleText;
          h.append(a);
        } else {
          h.textContent = titleText;
        }
        text.push(h);
      }
      const descParas = [...card.querySelectorAll(".content-section .slide-desc p")];
      if (descParas.length) {
        descParas.forEach((p) => {
          const t = p.textContent.replace(/\s+/g, " ").trim();
          if (!t) return;
          const np = document.createElement("p");
          np.textContent = t;
          text.push(np);
        });
      } else {
        const desc = card.querySelector(".content-section .slide-desc, .content-section p");
        const t = desc ? desc.textContent.replace(/\s+/g, " ").trim() : "";
        if (t) {
          const np = document.createElement("p");
          np.textContent = t;
          text.push(np);
        }
      }
      if (!imageCell && !text.length) return;
      cells.push([imageCell, text]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-boxed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-image.js
  function looksTruncated3(src) {
    return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
  }
  function buildImage(document, assetItem) {
    if (!assetItem) return null;
    const srcImg = assetItem.querySelector("img");
    let src = srcImg ? srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "" : "";
    if (looksTruncated3(src)) {
      const source = [...assetItem.querySelectorAll("picture source[srcset]")].map((s) => (s.getAttribute("srcset") || "").trim().split(/\s+/)[0]).find((u) => u && !looksTruncated3(u));
      if (source) src = source;
    }
    if (!src) return null;
    const img = document.createElement("img");
    img.src = src;
    img.alt = (srcImg && srcImg.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
    return img;
  }
  function parse8(element, { document }) {
    const cells = [];
    const assets = [...element.querySelectorAll(".asset-col .asset-item, .asset-item")].filter((el, i, arr) => arr.indexOf(el) === i);
    const assetById = new Map(assets.filter((a) => a.id).map((a) => [a.id, a]));
    let items = [...element.querySelectorAll(".accordion-col .accordion-item")];
    if (!items.length) items = [...element.querySelectorAll(".accordion-item, li")];
    items.forEach((item, index) => {
      const titleEl = item.querySelector(".accordion-title, button, summary");
      const labelText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (!labelText) return;
      const label = document.createElement("p");
      label.textContent = labelText;
      const body = [];
      const content = item.querySelector(".accordion-content, .answer") || item;
      content.querySelectorAll("p").forEach((p) => {
        if (p.closest("button, form")) return;
        const t = p.textContent.replace(/\s+/g, " ").trim();
        if (!t) return;
        const np = document.createElement("p");
        np.textContent = t;
        body.push(np);
      });
      content.querySelectorAll("a[href]").forEach((a) => {
        if (a.closest("p")) return;
        const t = a.textContent.replace(/\s+/g, " ").trim();
        if (!t) return;
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = t;
        p.append(link);
        body.push(p);
      });
      const idKey = (item.id || "").replace(/_\d+$/, "");
      const asset = idKey && assetById.get(idKey) || assets[index];
      const img = buildImage(document, asset);
      if (img) body.push(img);
      cells.push([label, body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-image", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function looksTruncated4(src) {
    return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
  }
  function buildImage2(document, scope) {
    const srcImg = scope.querySelector(".img-cont img, img");
    if (!srcImg) return null;
    let src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
    if (looksTruncated4(src)) {
      const alt = [...scope.querySelectorAll("picture source[srcset]")].map((s) => (s.getAttribute("srcset") || "").trim().split(/\s+/)[0]).find((u) => u && !looksTruncated4(u));
      if (alt) src = alt;
    }
    if (!src) return null;
    const img = document.createElement("img");
    img.src = src;
    img.alt = (srcImg.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
    return img;
  }
  function parse9(element, { document }) {
    const cells = [];
    const slidesWrap = element.querySelector(".slides");
    const imageFirst = !!(slidesWrap && slidesWrap.classList.contains("slide-left"));
    let slides = [...element.querySelectorAll(":scope > .slides > article.slide")];
    if (!slides.length) slides = [...element.querySelectorAll("article.slide")];
    if (!slides.length) slides = [element];
    slides.forEach((slide) => {
      const img = buildImage2(document, slide.querySelector(".slide-top") || slide);
      const text = [];
      const titleEl = slide.querySelector(".content-section .slide-title, .content-section h2, .content-section h3");
      if (titleEl) {
        const t = titleEl.textContent.replace(/\s+/g, " ").trim();
        if (t) {
          const h = document.createElement("h2");
          const a = titleEl.querySelector("a[href]");
          if (a) {
            const link = document.createElement("a");
            link.href = a.getAttribute("href");
            link.textContent = t;
            h.append(link);
          } else {
            h.textContent = t;
          }
          text.push(h);
        }
      }
      slide.querySelectorAll(".content-section .content-top p").forEach((p) => {
        const t = p.textContent.replace(/\s+/g, " ").trim();
        if (!t) return;
        const np = document.createElement("p");
        np.textContent = t;
        text.push(np);
      });
      slide.querySelectorAll(".content-section .slide-footer a[href]").forEach((a) => {
        const t = a.textContent.replace(/\s+/g, " ").trim();
        if (!t) return;
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = t;
        p.append(link);
        text.push(p);
      });
      if (!img && !text.length) return;
      const textCell = text.length ? text : "";
      const imageCell = img || "";
      cells.push(imageFirst ? [imageCell, textCell] : [textCell, imageCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-two-col.js
  function parse10(element, { document }) {
    const cells = [];
    let items = [...element.querySelectorAll(".faqs-container li.accordion-item")];
    if (!items.length) items = [...element.querySelectorAll(".accordion-item, .faq-item")];
    items = items.filter((el, i, arr) => arr.indexOf(el) === i);
    items.forEach((item) => {
      const q = item.querySelector(".accordion-title, .question, button");
      const qText = q ? q.textContent.replace(/\s+/g, " ").trim() : "";
      if (!qText) return;
      const question = document.createElement("p");
      question.textContent = qText;
      const answerRoot = item.querySelector(".accordion-content .inner") || item.querySelector(".accordion-content, .answer");
      const answer = [];
      if (answerRoot) {
        answerRoot.querySelectorAll("meta, script, style, button").forEach((el) => el.remove());
        [...answerRoot.childNodes].forEach((node) => {
          if (node.nodeType === 3) {
            const t = node.textContent.replace(/\s+/g, " ").trim();
            if (t) {
              const p = document.createElement("p");
              p.textContent = t;
              answer.push(p);
            }
          } else if (node.nodeType === 1) {
            if (node.textContent.trim() || node.querySelector("img, picture, a[href]")) answer.push(node);
          }
        });
      }
      cells.push([question, answer.length ? answer : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-two-col", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-banner-ad.js
  function cleanHref4(href) {
    if (!href) return href;
    try {
      const url = new URL(href, "https://www.visitorlando.com/");
      if (/doubleclick\.net$/i.test(url.hostname) && url.searchParams.get("adurl")) {
        return url.searchParams.get("adurl");
      }
    } catch (e) {
    }
    return href;
  }
  function looksTruncated5(src) {
    return !src || /\/image\/(upload|fetch)\/[^/]*$/.test(src);
  }
  function buildImage3(document, scope, imgSelector) {
    if (!scope) return null;
    const srcImg = scope.querySelector(imgSelector || "img");
    if (!srcImg) return null;
    let src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
    if (looksTruncated5(src)) {
      const pic = srcImg.closest("picture") || scope;
      const alt = [...pic.querySelectorAll("source[srcset]")].map((s) => (s.getAttribute("srcset") || "").trim().split(/\s+/)[0]).find((u) => u && !looksTruncated5(u));
      if (alt) src = alt;
    }
    if (!src) return null;
    const img = document.createElement("img");
    img.src = src;
    img.alt = (srcImg.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
    return img;
  }
  function parse11(element, { document }) {
    const cells = [];
    let slides = [...element.querySelectorAll(":scope > .slides > article.slide")];
    if (!slides.length) slides = [...element.querySelectorAll("article.slide")];
    if (!slides.length) slides = [element];
    slides.forEach((slide) => {
      const left = buildImage3(document, slide.querySelector(".first-img-cont"), "img.slide-img, img");
      const right = buildImage3(document, slide.querySelector(".second-img-cont"), "img.slide-img, img");
      const panel = [];
      if (slide.querySelector(".sponsored")) {
        const p = document.createElement("p");
        p.textContent = "Sponsored";
        panel.push(p);
      }
      const content = slide.querySelector(".content-section") || slide;
      const titleEl = content.querySelector(".widget-title, h1, h2, h3, h4, h5");
      const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (titleText) {
        const h = document.createElement("h2");
        h.textContent = titleText;
        panel.push(h);
      }
      content.querySelectorAll("a[href]").forEach((a) => {
        const t = a.textContent.replace(/\s+/g, " ").trim();
        if (!t) return;
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = cleanHref4(a.getAttribute("href"));
        link.textContent = t;
        p.append(link);
        panel.push(p);
      });
      const logo = buildImage3(document, content.querySelector("img.logo-img") ? content : null, "img.logo-img");
      if (logo) {
        const p = document.createElement("p");
        p.append(logo);
        panel.push(p);
      }
      if (!left && !right && !panel.length) return;
      cells.push([left || "", panel.length ? panel : "", right || ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-banner-ad", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-split-panels.js
  function cleanHref5(href) {
    if (!href) return href;
    try {
      const url = new URL(href, "https://www.visitorlando.com/");
      if (/doubleclick\.net$/i.test(url.hostname) && url.searchParams.get("adurl")) {
        return url.searchParams.get("adurl");
      }
    } catch (e) {
    }
    return href;
  }
  function makeLink2(document, href, text) {
    const a = document.createElement("a");
    a.href = cleanHref5(href);
    a.textContent = text;
    return a;
  }
  function parse12(element, { document }) {
    let panels = [...element.querySelectorAll(":scope > .slides > .slide")];
    if (!panels.length) panels = [...element.querySelectorAll(".slide")];
    const row = [];
    panels.forEach((panel) => {
      const content = panel.querySelector(".content-section") || panel;
      const out = [];
      const srcImg = panel.querySelector("img");
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = srcImg.getAttribute("alt") || "";
        out.push(img);
      }
      const titleEl = content.querySelector("h1, h2, h3, h4, h5, .title");
      const heading = titleEl && (titleEl.closest("h1, h2, h3, h4, h5") || titleEl);
      const titleText = heading ? heading.textContent.replace(/\s+/g, " ").trim() : "";
      if (titleText) {
        const h = document.createElement("h3");
        const a = heading.querySelector("a[href]") || (heading.matches("a[href]") ? heading : null);
        if (a) h.append(makeLink2(document, a.getAttribute("href"), titleText));
        else h.textContent = titleText;
        out.push(h);
      }
      content.querySelectorAll("p").forEach((p) => {
        const t = p.textContent.replace(/\s+/g, " ").trim();
        if (!t) return;
        const np = document.createElement("p");
        np.textContent = t;
        out.push(np);
      });
      content.querySelectorAll("a[href]").forEach((a) => {
        if (heading && heading.contains(a)) return;
        if (a.closest("p")) return;
        const t = a.textContent.replace(/\s+/g, " ").trim();
        if (!t) return;
        const p = document.createElement("p");
        p.append(makeLink2(document, a.getAttribute("href"), t));
        out.push(p);
      });
      if (out.length) row.push(out);
    });
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-split-panels", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/visitorlando-cleanup.js
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }
  function getBlockInstanceSelectors(payload) {
    const blocks = payload && payload.template && payload.template.blocks || [];
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
    return el.textContent.trim() === "" && !el.querySelector("img, picture, video, iframe, a[href]");
  }
  function transform(hookName, element, payload) {
    const root = element;
    if (hookName === "beforeTransform") {
      removeAll(root, [
        "div.header-container",
        "div.footer-container",
        "#onetrust-consent-sdk",
        '[id^="onetrust-"]',
        "#mindtrip-container",
        "#mindtrip-open",
        "a.skip-link",
        "#ie-warning",
        ".gtranslate_wrapper",
        "#gallery-portal",
        "#quickview-detail",
        "#cr__fs-wrap"
      ]);
      removeAll(root, [".dynamic_ab_switcher", ".dynamic_testing_switcher"]);
      root.querySelectorAll(".contentRender_name_plugins_dynamic_content_inner").forEach((el) => {
        if (isEmptyElement(el)) el.remove();
      });
      root.querySelectorAll(".contentRender_name_plugins_common_spacer").forEach((el) => {
        if (isEmptyElement(el)) el.remove();
      });
      removeAll(root, [
        "script",
        "style",
        "noscript",
        "link",
        "iframe",
        'img[width="1"][height="1"]',
        'img[src*="doubleclick.net"]',
        'img[src*="facebook.com/tr"]',
        'img[src*="google-analytics.com"]'
      ]);
      root.querySelectorAll("#main-content div.custom-carousel").forEach((carousel) => {
        const title = carousel.querySelector("header.template-header h2.template-title");
        if (title && carousel.parentElement) {
          carousel.parentElement.insertBefore(title, carousel);
        }
      });
      const instanceSelectors = getBlockInstanceSelectors(payload);
      root.querySelectorAll(".glide__arrow, .slide-counter, .slider-gradient, .glide__arrows").forEach((el) => {
        if (!isInsideBlockInstance(el, instanceSelectors)) el.remove();
      });
      root.querySelectorAll("#main-content a.button-default").forEach((a) => {
        if (isInsideBlockInstance(a, instanceSelectors) || a.closest("strong, em")) return;
        const wrap = root.ownerDocument.createElement(a.classList.contains("outlined") ? "em" : "strong");
        a.replaceWith(wrap);
        wrap.append(a);
      });
    }
    if (hookName === "afterTransform") {
      removeAll(root, [
        "div.header-container",
        "div.footer-container",
        "#onetrust-consent-sdk",
        "#mindtrip-container",
        "#mindtrip-open",
        "a.skip-link",
        ".dynamic_ab_switcher",
        "script",
        "style",
        "noscript",
        "link",
        "iframe"
      ]);
      const attrs = ["onclick", "onload", "data-track", "data-tracking", "data-gtm", "data-ga", "data-analytics"];
      root.querySelectorAll("*").forEach((el) => {
        attrs.forEach((a) => el.removeAttribute(a));
      });
    }
  }

  // tools/importer/transformers/visitorlando-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionStart(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (let i = 0; i < selectors.length; i += 1) {
      const sel = selectors[i];
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const document = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const start = findSectionStart(element, section);
        if (!start || !start.parentElement) continue;
        if (i === 0) {
          if (section.style) {
            const hr2 = document.createElement("hr");
            hr2.setAttribute(MARKER, section.id);
            hr2.setAttribute("data-excat-first", "true");
            start.parentElement.insertBefore(hr2, start);
          }
          continue;
        }
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        start.parentElement.insertBefore(hr, start);
      }
    }
    if (hookName === "afterTransform") {
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
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (isMarker) {
          anchor.after(metadata);
          if (anchor.hasAttribute("data-excat-first")) {
            anchor.remove();
          } else {
            anchor.removeAttribute(MARKER);
          }
        } else {
          anchor.after(metadata);
        }
      }
      element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => {
        if (hr.hasAttribute("data-excat-first")) hr.remove();
        else hr.removeAttribute(MARKER);
      });
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-split": parse,
    "cards-centered": parse2,
    "columns-overlap": parse3,
    "cards-mosaic": parse4,
    "cards-carousel": parse5,
    "widget-ugc-gallery": parse6,
    "cards-boxed": parse7,
    "accordion-image": parse8,
    "columns-media": parse9,
    "accordion-two-col": parse10,
    "columns-banner-ad": parse11,
    "columns-split-panels": parse12
  };
  var sectionTransformers = [transform2];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var transformers = [transform, ...lateTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document, params } = payload;
    executeTransformers("beforeTransform", document.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_home_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_home_exports);
})();
