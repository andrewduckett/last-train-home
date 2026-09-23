## 1. Palette contract and generation

- [x] 1.1 Write failing resolver tests, then resolve exact lowercase `amber` and `teal` names with a neutral fallback. Verify missing, unknown, and differently cased names leave the crawl usable.
- [x] 1.2 Write failing generation and contrast tests, then add the single palette source and deterministic CSS generator. Verify the emitted light and dark CSS contains every declared token, passes WCAG AA text pairs, and fails a stale-output check.
- [x] 1.3 Add palette generation to build and development. Verify `npm run build` regenerates CSS, and changing the palette source during `npm run dev` updates the emitted CSS without restarting Vite.

## 2. Apply the selected palette

- [x] 2.1 Write failing shell tests for amber, teal, neutral, and route changes, then set the palette attribute on the resolved shell. Verify an unmounted shell ignores a late response before it reads checklist storage or assigns state.
- [x] 2.2 Move global light and dark color values into generated tokens and remove `data-theme` overrides. Verify system dark mode changes tokens, while page, content, and station-board surfaces stay shared across palettes.
- [x] 2.3 Replace fixed colors in the shell and four views with semantic tokens. Verify active navigation, time pills, map actions, venue markers, task controls, and focus indicators use the selected accent without color literals in component styles.
- [x] 2.4 Add contrast checks for focus indicators and meaningful control boundaries against adjacent surfaces. Verify each emitted light and dark palette reaches the applicable 3:1 non-text threshold.

## 3. Seed crawl and release checks

- [x] 3.1 Add `color: amber` to `cory-trent.yaml`. Verify `/` and `/cory-trent` select amber while a test crawl without `color` selects neutral.
- [ ] 3.2 Run `npm test`, `npm run check`, and `npm run build`. Inspect the built CSS and CSP output, then verify the four tabs remain readable and usable in light and dark mode on a portrait phone.
