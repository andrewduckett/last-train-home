## Why

Every crawl currently uses the same fixed orange styling, even though records can carry a `color` name. Per-crawl accents give outings a distinct identity while keeping text readable on a phone in daylight or darkness.

## What Changes

- Add named amber and teal accent palettes, plus a neutral palette fallback.
- Set `color: amber` on `cory-trent` to preserve its current identity.
- Resolve a crawl's optional `color` in the theme layer. Missing or unknown names select neutral without breaking the crawl.
- Generate light and dark CSS tokens from one palette source. Follow the device's color scheme without an in-app toggle.
- Replace fixed component colors with tokens and test required foreground, surface, accent, and on-accent pairs against WCAG AA.

## Capabilities

### New Capabilities

- `crawl-theming`: Resolve authored color names, apply crawl-scoped palettes, and enforce readable generated tokens.

### Modified Capabilities

None.

## Impact

The change affects the theme layer, global and component styles, the crawl shell, the seed YAML, build scripts, and tests. The provider continues to carry the authored `color` string without interpreting it. No backend, user theme setting, or new crawl fields are needed.
