## 1. Build validation and URL helpers (test-first)

- [ ] 1.1 In `src/lib/data/validate.test.ts` and `src/lib/data/validate-generic.test.ts`, remove `map` from the inline crawls and delete the map URL cases. Add failing tests, one behavior each: a leftover `definition.map` fails with `invalid definition.map (removed; link a route map from links)`, and a crawl with no `map` passes. Verify that they fail for the right reason.
- [ ] 1.2 In `src/lib/data/validate.js`, delete the map block and its helper imports, and add the `map` check beside the `albumUrl` check, as the design shows. Verify that all `validate*.test.ts` tests pass.
- [ ] 1.3 Delete `resolveMap`, `isMapEmbedUrl`, and `isMapViewerUrl` from `src/lib/crawl/urls.js`, and their cases from `urls.test.ts`. Keep the quick-link helpers and tests. Verify that `urls.test.ts` passes. Commit 1.1 to 1.3 together as `feat:`.

## 2. Seed, shell, and types

- [ ] 2.1 In `static/crawls/cory-trent.yaml` and `tests/fixtures/cory-trent.json`, delete `map`, and add the third link from the design: `Route map`, hint `Open the crawl route`, and the My Maps viewer URL. Verify with `npm run validate:crawls`.
- [ ] 2.2 Update the tests first:
  - `Shell.parity.test.ts`: replace the Map-tab test with one that expects the seed's link URLs to equal the frozen snapshot's Ventra URL, Metra URL, and `myMapsAppUrl`, in that order.
  - `seed.test.ts`: expect the link labels Ventra, Metra, and Route map.
  - `Shell.test.ts`: expect no Map tab, and click another tab in the scroll-to-top test.
  - `Shell.provider.test.ts`: remove the map test and map steps, and drop `map` from the tab lists.
  - `tests/csp-browser.test.ts`: remove the Map-tab test.
  - Inline crawls in `CrawlRoute.test.ts`, `Shell.theme.test.ts`, and `provider.test.ts`: drop `map`.

  Verify that the new expectations fail against the current code.
- [ ] 2.3 Delete `src/lib/MapView.svelte`, `src/lib/MapView.test.ts`, and `src/lib/MapView.generic.test.ts`. Remove the Map tab, title, view branch, and import from `src/lib/Shell.svelte`. Remove `CrawlMap` and `CrawlDefinition.map` from `src/lib/types.ts`. Verify that `npm test` and `npm run check` pass. Commit 2.1 to 2.3 together as `feat:`, so no commit has a failing suite.

## 3. Content Security Policy (test-first)

- [ ] 3.1 In `tests/csp-build.test.ts`, add failing checks: the built policy's `frame-src` is exactly `'none'`, and no directive names `https://www.google.com`. Run `npm run build`, then verify that the checks fail against today's policy.
- [ ] 3.2 In `svelte.config.js`, set `'frame-src': ['none']`. Run `npm run build`, and verify that `tests/csp-build.test.ts` passes. Commit as `feat:`.

## 4. Docs

- [ ] 4.1 In `openspec/discovery.md`, update the "Find the stop" journey step: the embedded map is gone, and the route map is an Info link, shipped in #26. Commit as `docs:`.
- [ ] 4.2 In `openspec/specs/crawl-shell/spec.md`, update the Purpose line so it lists Schedule, Places, and Tasks, with no Map. Verify with `openspec validate crawl-shell --type spec --strict`. Commit as `docs:`.

## 5. Verify

- [ ] 5.1 Run `npm test`, `npm run check`, and `npm run build`, and confirm all three pass.
- [ ] 5.2 Run `rg -n -i "MapView|CrawlMap|resolveMap|isMap(Embed|Viewer)Url|frame-src|www\.google\.com/maps/d/embed" src static tests svelte.config.js`. Confirm that the only hits are the new CSP checks, the retired-`map` validation and its tests, and the frozen `cory-trent-before.json`.
- [ ] 5.3 Run `npm run preview` and open `cory-trent` in Chrome. Confirm these things: the tab bar shows Schedule, Places, Tasks, and Info, with no Map tab; Info lists Ventra, Metra, and Route map in that order; Route map opens the My Maps viewer in a new tab; the served policy has `frame-src 'none'`.
