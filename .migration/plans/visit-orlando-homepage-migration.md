# Visit Orlando Homepage Migration Plan

**Source page:** https://www.visitorlando.com/
**Target:** AEM Edge Delivery Services (Document Authoring project `adobeatlien/orltest`)
**Scope:** One page, the homepage, migrated as a single URL.

> **⚠️ Still in Plan mode, so the migration can't start yet.** Each "go ahead" you send while Plan mode is on only updates this plan. Nothing has been run. To start the migration, switch the mode selector next to the chat box from **Plan** to **Execute**, then send "go ahead". The plan is final and approved, and I'll work through the checklist from top to bottom.

## Approach

The migration runs as one pipeline:

1. **Analyze the page.** Scrape the homepage, take screenshots, and identify its sections, content blocks and authoring decisions.
2. **Map blocks.** Match each content area to a block the project already has (hero, cards, columns, widget, fragment) or name a new block variant. Record how each one is selected in the page template.
3. **Build the import setup.** Generate parsers for each block variant, plus transformers that clean up the page and split it into sections.
4. **Import the content.** Bundle the import script, run it against the homepage, and write the result to the local content as `index.plain.html`.
5. **Check and generate blocks.** Check that the imported content renders in the preview, and generate or adjust code for any block that is missing or doesn't render correctly.

### What's in scope
- The homepage's main content (hero, feature/card sections, promotions, any content grids)
- Page metadata (title, description, social preview image)
- Images and links from the original page

### What's not in scope (can be added afterwards)
- **Header/navigation** and **footer** migration. These are separate steps that can follow the page migration.
- **Full design/styling match** with the original site, such as fonts, colors and spacing tokens. This is a separate design migration step.
- **Uploading to Document Authoring, previewing or publishing.** All changes stay in the local workspace unless you ask for an upload.

## Checklist

- [ ] Confirm the project setup (Document Authoring project, block library) and check that the existing project config is correct
- [ ] Scrape and analyze https://www.visitorlando.com/ (screenshots, cleaned HTML, metadata, images), with a fallback if the site blocks bots
- [ ] Identify the page sections and the content blocks in each section
- [ ] Name block variants, reusing existing blocks (hero, cards, columns, widget) where they're at least 80% similar
- [ ] Add block and section mappings to the page template configuration
- [ ] Generate import parsers for each block variant
- [ ] Generate cleanup and section transformers (remove cookie banners, header/footer chrome and tracking markup)
- [ ] Generate and bundle the homepage import script
- [ ] Run the import for the homepage and write the content locally
- [ ] Check the imported content: structure, images, links and metadata
- [ ] Generate or update code for any new or changed blocks so they render correctly
- [ ] Check the page in the preview and fix any rendering problems
- [ ] Summarize the results: blocks used, new blocks created, known gaps, and optional next steps (header, footer, design migration, DA upload)

## Risks & notes
- **Bot protection:** If the source site blocks automated access, the scraper switches to a fallback fetch method.
- **Dynamic content:** Content that loads with JavaScript (carousels, event feeds, hotel and booking widgets) may be captured as static content or need a custom block. These cases will be flagged.
- **Local only:** The imported content is a local change. Running the import again overwrites any manual edits. Nothing is uploaded to Document Authoring, previewed or published unless you ask for it.
