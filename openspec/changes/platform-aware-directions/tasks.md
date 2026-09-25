## 1. Directions module (test-first)

- [x] 1.1 Write failing tests in `src/lib/crawl/directions.test.ts` for `detectMapsPlatform`. Expect `'apple'` for user agents that name an iPhone, iPad, iPod, or Macintosh, including an iPad in desktop mode. Expect `'other'` for Android, Windows, the jsdom default, an empty string, and `undefined`. Verify that the tests fail because the module is missing.
- [x] 1.2 Implement `detectMapsPlatform` in `src/lib/crawl/directions.ts`. Verify that the 1.1 tests pass. Commit as `feat:`.
- [x] 1.3 Write failing tests for `directionsUrl` and `opensInNewTab`. Cover the exact Apple URL (`https://maps.apple.com/?q=…`) and Google URL (`https://www.google.com/maps/search/?api=1&query=…`), joining parts with `, `, and encoding `&`, `#`, and `?` in authored text so it cannot add URL parameters. Expect `opensInNewTab` to be `false` for `'apple'` and `true` for `'other'`. Verify that the tests fail for the right reason.
- [x] 1.4 Implement `directionsUrl` and `opensInNewTab`. Verify that all `directions` tests pass. Commit as `feat:`.

## 2. Venues view and seed data

- [x] 2.1 Update `src/lib/VenuesView.test.ts`. On the jsdom default user agent, expect each link to be a Google search for name, address, and town with no added `IL`, with `target="_blank"` and `rel="noopener noreferrer"`. Add a test that stubs `navigator.userAgent` as an iPhone and expects Apple Maps links with no `target`. Update the River Town expectation in `src/lib/Shell.provider.test.ts` to drop `IL`. Verify that these tests fail against the current view.
- [x] 2.2 In `src/lib/VenuesView.svelte`, replace `mapsUrl` with the directions module. Detect the platform once, and set `target` and `rel` only when `opensInNewTab` is true. Verify that the 2.1 tests pass.
- [x] 2.3 Append `, IL` to each seed town in `static/crawls/cory-trent.yaml` and `tests/fixtures/cory-trent.json`. In `src/lib/Shell.parity.test.ts`, append `, IL` to each town from the frozen snapshot before comparing, and leave the four pinned Directions URLs unchanged. Verify with `npm run validate:crawls` and `npx vitest run src/lib/Shell.parity.test.ts src/lib/data`. Commit 2.1 to 2.3 together as `feat:`, so no commit has a failing suite.

## 3. Docs

- [x] 3.1 In `openspec/discovery.md`, update the "Find the stop" journey step so it no longer says directions always open Google Maps with a hardcoded `, IL`. Commit as `docs:`.

## 4. Verify

- [ ] 4.1 Run `npm test`, `npm run check`, and `npm run build`, and confirm all three pass.
- [ ] 4.2 Confirm that `src/` has no hardcoded `IL`, apart from test data, with `rg -n "\bIL\b" src`. Confirm that `git diff main -- svelte.config.js static/_headers` is empty.
- [ ] 4.3 Run `npm run preview` and open Venues for `cory-trent` at phone width in desktop Chrome. Confirm that each town shows `, IL` and that each Directions link opens a Google Maps search in a new tab.
- [ ] 4.4 Ask the user to open the deployed or previewed Venues tab on a real iPhone, in Safari and in Chrome. Confirm that Directions opens the Maps app, and that returning to the browser shows the crawl page with no empty tab. Record the result in the PR before archive.
