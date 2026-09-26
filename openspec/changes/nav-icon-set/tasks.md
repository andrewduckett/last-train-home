## 1. Icon set (test-first)

- [x] 1.1 Write `src/lib/icons/icons.test.ts` with every check in design decision 4. Cover the Bold values, the namespace, both attribute allowlists, colors, decimals, parser errors, and the file list. Run `npm test`, and verify that it fails because `src/lib/icons/` holds no icons yet.
- [x] 1.2 Run the `design-assets:icon-set-generator` skill with the Bold preset. Ask for five icons: `clock`, `map-pin`, `checklist`, `info`, and `train`. Write its output to `.workspace/icons/`. Verify that the folder holds five `.svg` files, `style-spec.json`, and `preview.html`.
- [x] 1.3 Open `.workspace/icons/preview.html`, and check each icon at 1× and 2× on the dark section. Redraw any icon whose detail clogs at 20 pixels or looks heavier than the rest. Show the user the preview, and wait for their approval before continuing.
- [x] 1.4 Copy the five `.svg` files and `style-spec.json` into `src/lib/icons/`. Leave `preview.html` in `.workspace/`. Verify that `icons.test.ts` passes. Commit 1.1 to 1.4 as `feat:`.

## 2. Icon component (test-first)

- [ ] 2.1 Write `src/lib/Icon.test.ts` with failing tests, one behavior each. A known name renders an inline `<svg>` inside a span with `aria-hidden="true"` and a matching `data-icon`. The `size` prop sets the span's width and height. An unknown name renders an empty span. Verify that the tests fail because `Icon.svelte` does not exist.
- [ ] 2.2 Write `src/lib/Icon.svelte` as design decision 2 describes. Verify that `Icon.test.ts` passes and `npm run check` reports no errors. Commit as `feat:`.

## 3. Shell icons and colors (test-first)

- [ ] 3.1 Run `rg -n "🕑|📍|✅|ℹ️|🚆" src tests`, and list each test that matches an emoji.
- [ ] 3.2 Add failing Shell tests for the first, second, fourth, and fifth rows of the design's Verification table:
  - each tab shows its `data-icon`, and the tab bar holds no emoji;
  - the header shows `train`, and the header holds no emoji;
  - no icon span has an inline style other than its size, and each SVG uses `currentColor`;
  - `getByRole('button', { name })` finds each tab by its exact label.

  Change the Places test in `Shell.test.ts` to expect `[data-icon="map-pin"]`. Verify that the new tests fail against the emoji shell.
- [ ] 3.3 Add failing checks to `tests/static-build.test.ts`, following the design's Verification table:
  - the built CSS gives the nav button `color: var(--board-muted)`, the active button `color: var(--board-accent)`, and the header icon `color: var(--board-ink)`;
  - no nav rule sets `opacity` below 1;
  - `build/` holds no copy of the five icon files;
  - an icon's path data appears in the JavaScript bundle.

  Run `npm run build`, and verify that the checks fail against the current shell.
- [ ] 3.4 Update `src/lib/Shell.svelte` as design decision 3 describes. Swap each tab's emoji for an icon name, and render `Icon` in the tab and the header. Move the color onto `.nav-btn` and `.nav-btn-active`, and remove the inline opacity. Give `.header-icon` the board ink color. Run `npm run build`, then verify that `npm test` passes. Commit 3.2 to 3.4 as `feat:`.

## 4. Verify

- [ ] 4.1 Run `npm test`, `npm run check`, and `npm run build`, and confirm all three pass.
- [ ] 4.2 Run `rg -n "🕑|📍|✅|ℹ️|🚆" src tests`. Confirm that no hit remains in `Shell.svelte` or its tests, except the checks that assert no emoji.
- [ ] 4.3 Run `npm run preview`, and open `cory-trent` in Chrome at a 320-pixel width. Confirm these things:
  - every tab shows its icon and full label with no horizontal overflow;
  - the active icon matches its label's accent, and inactive icons show in the muted color at full opacity;
  - the header shows the train icon;
  - the network panel shows no icon file request;
  - the console shows no CSP violation.

  Repeat in dark mode.
