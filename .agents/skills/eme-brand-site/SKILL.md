---
name: eme-brand-site
description: Use when building or restyling EME World web pages in webapp/site/emeworld (home page, Developers page, new landing pages). Gives the soft paper and indigo ink look, the tokens, type, components, hero image treatment, the side menu, and the crawler friendly page conventions so new pages match index.html and developers.html.
---

# EME website look and page conventions

Reference pages: `webapp/site/emeworld/index.html`, `developers.html`. Styles: `theme/css/index2.css` (base),
`theme/css/developers.css` (tutorial extras). Hero art: `theme/images/ink-hero.webp`. Reference mood: soft ink in water on paper,
calm, quiet, lots of space.

## Feel

Soft and light, not loud. Paper background, deep indigo ink, thin type, hairline borders, thin outlined buttons. No neon,
no heavy black display fonts, no big shadows. Deep indigo bands are the exception, used sparingly for emphasis.

## Tokens (defined on `:root` in `index2.css`)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0a1a33` | headings, primary button, logo |
| `--ink-2` | `#14284f` | deep indigo bands, code blocks |
| `--ink-soft` | `#3d5078` | secondary accents |
| `--paper` | `#eeedeb` | page background (matches `ink-hero.webp`) |
| `--paper-2` | `#e7e6e3` | soft bands, footer, inline code |
| `--tint` | `#e1e6ef` | `.tint` band: paper with a hint of indigo, for a gentle section change (mission, digital brain) |
| `--surface` | `#f7f6f4` | cards |
| `--line` | `#d3d6dc` | hairlines |
| `--body` / `--muted` | `#2c3a55` / `#5d6a82` | body and secondary text |

## Type

- **Jost** weights 300, 400, 500 for everything. Headlines weight 300, large, tight. h3 weight 400.
- **JetBrains Mono** for code and diagram labels.
- Eyebrows and nav: 0.74 to 0.8rem, uppercase, letter spacing 0.18 to 0.24em, muted color.
- Load fonts with one Google Fonts link: `Jost:wght@300;400;500` and `JetBrains+Mono:wght@500;700`.

## Components

- `.btn` solid indigo, small uppercase, 5px radius. `.btn.ghost` thin outline. On `.dark` bands they invert.
- `.card`, `.features li` off white surface, 1px `--line`, 10px radius, no shadow.
- Capability cards: add `<svg class="fi">` (30px, `--ink-soft`, stroke 1.5, 24 unit viewBox) as the first child of the `li`. CSS puts the icon and the `h3` on one line and the description underneath (`.features li:has(.fi)`).
- Band colors: alternate `paper`, `.tint`, `.soft` and `.dark` so two neighbours never match. The home page order is in `eme-content-guide`.
- `.band` sections: default paper, `.soft` for a gentle change, `.dark` (deep indigo) at most for one or two sections.
- Do not put a `.soft` band directly around a white panel (it shows as gray bars). Keep graphic panels transparent on paper.
- `.side` fixed left menu (232px): logo, icon links, a divider, Developers, Login at the bottom. No internal scroll: `overflow: hidden`
  plus a compact rule for windows 760px tall or less. Below 900px it becomes a 64px top bar. A small script highlights the
  current section (`data-spy`).
- Hero: paper with `ink-hero.webp` on the right (`.hero::before`), `mix-blend-mode: multiply` so the image's white merges with paper,
  a left mask fade so text stays readable. Keep text left of the swirl.

## Artwork

- Inline the SVGs in the page (real text for crawlers, page fonts apply). Give every copy unique ids, and drop the `@import` style block.
- Page CSS styles `svg.art` fonts. The values pie is recolored to indigo tones: `#0a1a33`, `#3d5078`, `#9aa6bf`, `#cfd5e1` (dark text on the two light slices),
  transparent backdrop. The structure diagram gets `filter: saturate(.55)` and a transparent backdrop. Keep the SVG's first element a full size backdrop `<rect>`: the CSS rule `svg.tree > rect:first-of-type { fill: none; }` clears the first rect's fill, so if you delete the backdrop, the first dark card turns transparent and its light text disappears. Phone mockups keep their colors, slightly softened.
- The graphics house style for new SVG and PNG files is in the `eme-graphics` skill (saturated palette, 3000px PNG). On the website, soften with the CSS above rather than re-drawing.
- Diagram text size on screen is the SVG font size times (rendered width / viewBox width). To make labels bigger, raise the font in the SVG and raise the figure `max-width` (the entity ring is shown at `max-width:1120px`; `.wrap` is 1200px). A single ring of wide chips needs radius of about 2.2 times the chip width, and staggering radii looked messy, so keep one clean ring.
- Logo: `overview/logo_light.svg` is a single olive green. Show it near black with `filter: brightness(0) opacity(.92)`.

## Page conventions (crawler friendly)

- Standalone page: `<name>.xconf` with `<inner-layout />` (no site layout) and a full `<html>` document in `<name>.html`.
- Own `<title>`, meta description, `robots`, Open Graph, and JSON-LD (Organization, WebPage, SoftwareApplication; TechArticle for tutorials).
- Server rendered semantic HTML: one `h1`, ordered `h2`/`h3`, `aria-labelledby` on sections, alt text or inline SVG `title`/`desc` on every graphic.
- No content that only exists in images. Repeat chart text as real text when the chart is a raster.
- In pages processed by Velocity, escape shell `$` in code samples as `&#36;`, and avoid `##` and `#word` at the start of text. Use `/${applicationid}/...` for asset paths.
- Keep CSS in `theme/css`, not inline `<style>`. After editing an `.xconf`, clear the page manager cache (see AGENTS.md).
- Copy rules live in `eme-brand-voice`, the story in `eme-brand-story`.
