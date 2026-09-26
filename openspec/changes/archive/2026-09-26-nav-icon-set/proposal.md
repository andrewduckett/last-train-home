## Why

The tab bar and the header draw their icons with emoji: 🕑, 📍, ✅, ℹ️, and 🚆. Each phone vendor draws emoji its own way, so the shell looks different on every device. Emoji carry their own colors, so the active tab can only dim the other icons, and the icons ignore the crawl's accent color. A small custom SVG set gives the shell one consistent look that follows the theme.

## What Changes

- The project adds five SVG icons, made with the `icon-set-generator` skill on its Bold preset: a 24-unit grid, a 2.5-unit stroke, and round caps and joins.
  - `clock` for Schedule
  - `map-pin` for Places
  - `checklist` for Tasks
  - `info` for Info
  - `train` for the header
- The tab bar and the header draw these icons in place of the emoji.
- Each icon takes its color from the text color around it. The active tab's icon uses the crawl's board accent, like its label. Each inactive icon uses the board's muted color. The icons no longer dim with opacity.
- The icons are decorative. Each tab keeps its text label as its accessible name.
- The app ships the icons inside its own bundle. They need no network request and no CSP change.
- A test checks every icon against the set's style and safety rules, so a later icon cannot drift from the set.

Out of scope:

- The favicon, `static/favicon.svg`.
- Emoji that authors write in crawl content, such as an introduction.
- Icons anywhere else in the views, such as the directions links or the task rows.
- Any change to the tab order, labels, or layout.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `crawl-shell`:
  - A new "Shell icons" requirement covers the icon for each tab and the header, how the icons take their color, and that they stay decorative.
  - "Tab navigation" changes one scenario. The Places tab shows a "map pin icon" instead of a "neutral pin icon", because the active icon now takes the accent color.

## Impact

- New: `src/lib/icons/`, with five `.svg` files and the set's `style-spec.json`.
- New: `src/lib/Icon.svelte`, which renders one icon by name, and `src/lib/icons/icons.test.ts`, which checks the style rules.
- `src/lib/Shell.svelte`: the tab list names an icon instead of an emoji. The header uses the train icon. The nav styles color the icon rather than dim it.
- `src/lib/Shell.test.ts`: the Places-tab test checks for the pin icon instead of the 📍 emoji. New tests check each icon, its hidden state, and the tab names.
- `tests/static-build.test.ts`: new checks read the built CSS for the icon colors and confirm the build ships no icon files.
- No change to the palette, the provider, the crawl data, the checklist store, or the CSP.
