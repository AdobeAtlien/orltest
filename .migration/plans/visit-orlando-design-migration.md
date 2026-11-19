# Visit Orlando Homepage: Design Migration Plan

**Source page:** https://www.visitorlando.com/
**Migrated page:** the homepage in the preview
**Goal:** Match the original site's look on the migrated homepage: fonts, colours, spacing, buttons, section backgrounds, and the styling of all 12 custom blocks.

> **⚠️ Plan mode is still on, so the design migration hasn't started.** The plan below is approved and final. Plan mode only lets me plan, so to start the work, switch the mode selector next to the chat box from **Plan** to **Execute** and send "go ahead". I'll then work through the checklist from top to bottom, the same way as the content migration.

## Scope

**In scope**
- **Site-wide design:** brand fonts, text and link colours, heading sizes, content width, section spacing, and button styles with their hover and focus states.
- **Section backgrounds:** the 4 section styles used on the page (`blue`, `teal`, `light-grey`, `centered`), matched to the original's colours and decorative patterns.
- **Block styling:** all 12 homepage blocks, each matched to the original's measured styles:
  - hero-split, cards-centered, cards-mosaic, cards-carousel, cards-boxed
  - columns-overlap, columns-media, columns-banner-ad, columns-split-panels
  - accordion-image, accordion-two-col, widget-ugc-gallery
- **Final check:** a side-by-side visual comparison of the full page, with a target of at least 85% visual match.

**Not in scope**
- **Page content:** no changes to the homepage content. This is design only.
- **Header, navigation and footer:** these still use the template's placeholder content and are a separate migration.
- **Remote changes:** nothing is uploaded to Document Authoring, previewed on the live service or published.

## Approach

1. **Site-wide styles.** Measure the source page's fonts, colours, spacing and default text styles. Write them as brand variables in the global stylesheet, set up font loading, and add button and link states and section background variants.
2. **Block styles.** Style each block from the original's computed styles. The blocks are independent, so they run in small parallel batches. Each block is checked against screenshots of the original.
3. **Page check.** Compare the full migrated page with the original and fix or report the largest gaps.

## Checklist

- [ ] Confirm the original page can be opened for measuring. The site blocks automated visitors, so fall back to the captured copy plus screenshots if the live site won't load in the browser
- [ ] Extract brand data from the source: fonts, colours, link colours, heading sizes, section spacing, content width and default text styles
- [ ] Resolve how the brand fonts are delivered (the source's own font service, Google Fonts or a close fallback) and set up font loading
- [ ] Write the brand variables to the global brand stylesheet
- [ ] Update the global styles: import the brand variables, merge the default text styles, and reset the button styling
- [ ] Measure and implement link states and button variants (primary filled, secondary outlined, arrow text links) with their hover and focus states
- [ ] Map the section styles (`blue`, `teal`, `light-grey`, `centered`) to the source backgrounds, text colours, padding and decorative patterns
- [ ] Check the site-wide styles in the preview: fonts loading, text close to the original, button states present, section backgrounds correct
- [ ] Style hero-split: large uppercase heading, intro, buttons, rounded photo beside the text
- [ ] Style cards-centered: rounded images, centered text, arrow links, "Sponsored" badge
- [ ] Style cards-mosaic: 11-tile mosaic grid with overlaid labels
- [ ] Style cards-carousel: slider track, cards, prev/next arrows, "n of N" counter, blog tags
- [ ] Style cards-boxed: 3 shadowed cards overlapping the blue band
- [ ] Style columns-overlap: photo with an overlapping blue text panel
- [ ] Style columns-media: text and button beside the map image
- [ ] Style columns-banner-ad: photo, blue centre panel with logo, photo
- [ ] Style columns-split-panels: two side-by-side promo panels
- [ ] Style accordion-image: item list beside the switching photo panel
- [ ] Style accordion-two-col: two-column FAQ with open/close icons
- [ ] Style widget-ugc-gallery: gallery container spacing, around the live third-party gallery
- [ ] Compare the full page with the original in desktop and mobile screenshots, aiming for at least 85% visual match
- [ ] Re-run styling for any block well below the target, or report the remaining gaps
- [ ] Make sure all changed style and script files pass the code linters
- [ ] Summarize: files changed, blocks styled, approximate match, remaining gaps and next steps (header and footer migration, accessibility and performance check)

## Risks & notes
- **Bot protection:** The source site refused automated requests during the import. If the live page won't open in the browser, measurements come from the captured copy and screenshots, which makes exact values such as hover states less reliable. Any affected values will be flagged.
- **Fonts:** If the original uses a licensed font that can't be loaded here, I'll use the closest available font and note it.
- **Third-party content:** The social gallery and the location-based promos are drawn by outside services. Only their surroundings can be styled.
- **Local only:** All changes are to code and styles in the local workspace. The homepage content isn't touched, and nothing is committed, uploaded or published unless you ask.
