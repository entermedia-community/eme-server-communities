---
name: eme-graphics
description: Use whenever you create or edit an SVG/PNG graphic for the EME website or docs (cards, org/tree charts, pie charts, chat-dialog mockups, diagrams, feature lists). Defines the house style so every graphic matches in resolution, color, fonts and margin - white background, dark cards with light text, no outer margin, no title unless asked, Archivo Black / Space Grotesk / JetBrains Mono, 3000px PNG export - and includes render.sh to export and verify.
---

# EME graphics house style

Reference examples (copy their structure, do not reinvent): `webapp/site/emediawebsite/images/`
`eme-server-apps.svg` (cards), `emetree.svg` (3-column tree), `eme-pie.svg` (pie with leader lines), `eme-chat-dialog.svg` (phone UI).

## Scope of a diagram

- Show only the essentials. For the AI Harness the diagram holds just the industry standard components (Interact, Reason, Context, Connect, Governance and Security, on the server, humans in control). The full capability list lives in cards on the page. Do not grow a diagram with every new feature.
- Shorten labels to fit the box (for example "Vector Search", "Docker, Git, Linux") and keep the full names in the cards.
- The real asset folder for the home page is `webapp/site/emeworld/overview/` (the examples below were first made in `emediawebsite/images/`).
- Circular entity diagram: logo in a circle at the centre (paste the paths from `logo_light.svg`, scale about 0.26), boxes on one ring, spokes to the centre. Text 22.5px in 236x60 boxes needs a ring radius of 530.
- When inlining on the page, keep the first element a full size backdrop `<rect>` (the page CSS clears it). Deleting it makes the first dark box transparent.

## Output

- Write the SVG and PNG side by side in `webapp/site/emediawebsite/images/`, same basename (`eme-<topic>.svg` / `.png`).
- SVG root: `viewBox` only plus `width="100%"` (no fixed height), `role="img"`, `<title>` and `<desc>` for accessibility. No `style="background..."` on the root.
- **Export the PNG at 3000px wide** (`.agents/skills/eme-graphics/render.sh file.svg`). Use another width only if asked ("1500px"); when asked for a second size, keep the 3000 one and add `-<width>.png`.
- Keep the PNG opaque: the white background is a real `<rect>`, not CSS.

## Margin and title

- **No outer margin.** Crop the `viewBox` to the content (about 2px of breathing room so strokes are not clipped). `render.sh` prints the trimmed bounding box; at 3000px wide it should be about 5px on every side.
- **No title or heading text** in the graphic unless the user asks for one. Keep the hidden `<title>` element.
- Gaps between cards/columns stay (20-30px); only the outside edge is flush.
- Do not use drop shadows: they are clipped at flush edges. Never use `feDropShadow` (Inkscape/librsvg drop the whole element, and the card vanishes). If a shadow is ever required, build it from `feGaussianBlur` + `feOffset` + `feFlood` + `feComposite` + `feMerge`.

## Color

- Background: white `#ffffff`.
- Boxes/cards/columns: dark slate `#1e293b` (deeper `#0f172a` / `#0b1007` for container columns), with **light text**: headings `#f8fafc`, body `#e2e8f0`, dividers `#475569`.
- If the user asks for light inside boxes: tints `#FBF3D0` / `#E4F4D6` / `#D3F2EE` with dark text `#1a2410` and deep accent titles; the outer columns stay dark.
- Text sitting directly on white is true black: `#000000` for headings and body.
- Accent palette (one per item, reuse in this order):

  | Use | Bright (icons, bars, borders, checks) | Deep (fills that carry white text) |
  |---|---|---|
  | sky | `#0ea5e9` | `#0284c7` |
  | purple | `#8b5cf6` | `#7c3aed` |
  | amber / gold | `#f59e0b` / `#E8C547` | `#b45309` |
  | green | `#10b981` / `#6CC24A` | `#059669` |
  | teal | `#2EC4B6` | `#0B6B63` |
  | lime (brand `aede4a`) | `#AEDE4A` | `#2F6B14` |

- Leader lines / secondary strokes: `#94a3b8`, 1px.

## Fonts

- **Archivo Black** - headlines, node/card titles, labels inside shapes (`class="h"`, `font-weight: 400`).
- **Space Grotesk** - body text (`class="b"`, default `font-family` on the root).
- **JetBrains Mono** - small captions/subtitles (`class="m"`, weight 500).
- Put this block at the top of every SVG (escape `&` as `&amp;`):

```xml
<style>
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&amp;family=JetBrains+Mono:wght@500;700&amp;family=Space+Grotesk:wght@400;500;700&amp;display=swap');
  .h { font-family: 'Archivo Black', 'Arial Black', sans-serif; font-weight: 400; }
  .m { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 500; }
  .b { font-family: 'Space Grotesk', system-ui, sans-serif; }
</style>
```

- The `@import` only works when the SVG is opened/inlined in a browser; `<img>` embeds and PNG export need the fonts installed locally. `render.sh` installs them to `~/.local/share/fonts/eme` if missing. Without them the PNG silently falls back to DejaVu and text overflows.

## Sizing and shapes

- Body text 15-17px, titles 16-18px, small caption 12-13px, line step 22-23px. Make type large relative to the box; wrap lines by hand (about 30-36 characters at 16px).
- Rounded corners: cards `rx` 12-16, inner boxes 8, pills fully round. Card pattern: dark rounded rect, 8px accent bar on the left, round accent icon (28px radius) with white stroke icon, thin divider, checkmark bullets in the accent color.
- Pie/leader pattern: equal slices separated by a 6px white stroke, labels inside in white Archivo Black, description outside in black Space Grotesk, 1px `#94a3b8` leader with a 8px-radius dot on the pie edge.
- Always leave room: the longest line must fit its box with the real fonts (check the render, not the SVG source).

## Workflow

1. Write the SVG (python generator in the scratchpad is fine for repetitive layouts).
2. `xmllint --noout file.svg`
3. `.agents/skills/eme-graphics/render.sh webapp/site/emediawebsite/images/<name>.svg` (3000px PNG next to it, prints the trimmed bbox).
4. Look at the PNG (Read it), fix overflow/overlap/clipped edges, re-export.
5. Tell the user the file paths and exact pixel size.
