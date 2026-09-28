# OktagonBet deck

The library's sponsored **OktagonBet mode**: a 54-card deck (52 + 2 jokers) and a card back
for [oktagonbet.partners](https://oktagonbet.partners/), drawn from regular octagons in the
same line-art language as the library. Standalone SVG, shipped in the npm package under
`octagons/cards/svg/`; the library script itself is not involved.

18+ · Play responsibly.

```sh
node cards/build.mjs   # writes cards/svg/{,light/,dark/}*.svg + cards/svg/manifest.json
```

Open `cards/index.html` through any static server: the whole deck, with a light/dark
switch that sets `data-theme` the way the site does.

## Files

Three sets with the same file names:

| Folder | Colours | Use |
|---|---|---|
| `svg/` + `svg/okt-cards.css` | the site's CSS tokens | **inline `<svg>`** in the page — follows `data-theme` |
| `svg/light/` | fixed, light theme | `<img>`, PNG, anywhere without the site's CSS |
| `svg/dark/` | fixed, dark theme | same, dark |

- `<rank><suit>.svg` — rank `A 2–10 J Q K`, suit `S H D C` (`AS.svg`, `10H.svg`, `QC.svg`).
- `joker-red.svg`, `joker-black.svg`, `back.svg`.
- `svg/manifest.json` — the variant folders, the stylesheet and code → file name.

**Inline use** — link the stylesheet once, then inline the themed files:

```html
<link rel="stylesheet" href="/cards/okt-cards.css">  <!-- copied from octagons/cards/svg/ -->
```

A themed card has **no `<style>` element and no `style=""` attribute**, so it works under a
strict CSP (`style-src 'self'`), which blocks both inside inline SVG. Each colour is a plain
presentation attribute (the light-theme value) plus a role class — `okt-f-ink` (fill),
`okt-s-gold` (stroke), `okt-c-blue` (stop-color). `okt-cards.css` maps those classes to the
page's tokens (`--bg`, `--primary`, `--danger`, …), so the site's `:root[data-theme]` switch
drives the cards; it falls back to the token values, following the system scheme, only where a
token is missing. Without the stylesheet the cards still render, in the light colours.

Every id inside a card is prefixed with its code (`okt-QH-g`), so any number of cards can
share a page. The root has `class="okt-card"`.

**`<img>` use** — CSS from the page cannot reach an image, so the page picks the folder:
`svg/${theme}/QH.svg`.

All cards share `viewBox="0 0 630 880"` (poker size 63 × 88 mm, 1 unit = 0.1 mm), so they
are interchangeable in any layout. The generator is deterministic: re-running it gives
byte-identical files.

## Design

- **Colours** are roles bound to the site's tokens (`ROLES` in `build.mjs`): card face
  `--bg`, panels `--bg-soft`, figures' faces `--bg-elevated`, black suits and outlines
  `--text-main`, red suits `--danger`, lines `--primary` / `--primary-hover`, gold
  `--accent-border` (the brand yellow in the dark theme, `#9c7c00` in the light one, where
  yellow on white is unreadable), foliage `--success`. Change a token on the site and the
  inline cards follow; the fixed sets pick it up on the next build.
- **Lettering** is drawn as octagonal stroke paths, not text, so every file renders the
  same with no font installed.
- **Back**: full-bleed 4.8.8 lattice with the brand mark in the centre. It is 180°-symmetric
  (checked by diffing a render against itself rotated: max channel delta 1), so the back
  does not reveal which way up a card lies.
- **Aces** sit in concentric regular octagons; the ace of spades carries the brand mark.
  **Courts** are double-headed figures built on the number 8: an octagon head with
  octagon eyes, an eight-point star (octagram) for a halo, a suit medallion on the chest.
  The king has a crown, a beard, an ermine collar and a sceptre topped with an octagram;
  the queen a tiara, a necklace and an eight-petal flower; the jack a beret with a feather
  and a spear with an octagon guard. **Jokers** are a frozen octagon tunnel, the library's
  `field` mode.
- The frame on the face is a chamfered rectangle, not a regular octagon — a card is a
  rectangle; the octagons are in the ornaments.
