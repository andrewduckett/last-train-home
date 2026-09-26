## 1. Build validation (test-first)

- [x] 1.1 Move the inline test data to the new shape: `validSource` in `src/lib/data/validate.test.ts` and the fixture in `src/lib/data/validate-generic.test.ts` use `places`, `stop`, `town`, and `locations`. Update the field paths and duplicate labels to `definition.places[0].locations[0].…`, `definition.places.stop duplicate`, and `definition.places[0].locations.name duplicate`. Verify that these tests fail against the current validator.
- [x] 1.2 Add failing tests in `validate.test.ts`, one behavior each: `venues` is rejected and names `places`; a stop's `places` list is rejected and names `locations`; `n` and `a` on a location name their replacements; an empty or missing `locations` list fails on that stop's `locations`; an empty `places` list is accepted; a non-empty `label` is accepted; a blank, numeric, list, or object `label` fails on that location's `label`. Verify that each fails for the right reason.
- [x] 1.3 In `src/lib/data/validate.js`, add `RETIRED_DEFINITION_KEYS` and `RETIRED_STOP_KEYS`, rename the place table to `RETIRED_LOCATION_KEYS`, and validate `places`, `locations`, and `label` as the design describes. Verify that all `validate*.test.ts` tests pass. Commit as `feat:`.

## 2. Seed, types, and the Places tab

- [x] 2.1 Rewrite the seed's venues in `static/crawls/cory-trent.yaml` and `tests/fixtures/cory-trent.json` as `places`, following the design's seed table. Use the station names and addresses exactly as the design lists them. Verify with `npm run validate:crawls` and `npx vitest run src/lib/data`.
- [x] 2.2 Rename `src/lib/VenuesView.svelte` and its test to `PlacesView` with `git mv`. Update the tests first, one behavior each:
  - A labeled location shows its label as a tag, and an unlabeled one shows no tag.
  - Locations at one stop have no "OR" divider.
  - A single-location stop renders its card and link.
  - Each link's query is the location's name, address, and its stop's town.
  - Google links have `target="_blank"` and `rel`, and Apple links (stubbed iPhone user agent) have no `target`.
  - A location named `Pub & Grill #2?` keeps its whole name in the query parameter.

  In `Shell.test.ts`, expect a Places tab with the 📍 icon and no Venues tab. Move `Shell.provider.test.ts` and the inline crawls in `CrawlRoute.test.ts`, `Shell.theme.test.ts`, `Shell.info.test.ts`, and `provider.test.ts` to `places`. In `Shell.parity.test.ts`, use the design's `Bar` label filter against the frozen snapshot, and add a test for the Meetup stop and the four `Train` rows. Verify that these tests fail against the current code.
- [x] 2.3 Implement the design:
  - `StopLocation` and `PlaceStop` types, and `CrawlDefinition.places`, in `src/lib/types.ts`.
  - `PlacesView.svelte`, with a `view-places` test id, a tag for labels, no divider, and `directionsUrl([location.name, location.address, stop.town], platform)`.
  - The Places tab in `Shell.svelte`: id `places`, label and title "Places", icon 📍.

  Verify that `npm test` and `npm run check` pass. Commit 2.1 to 2.3 together as `feat:`, so no commit has a failing suite.

## 3. Docs

- [x] 3.1 In `openspec/discovery.md`, update the "Find the stop" journey step: the tab is now Places, and station directions shipped in #27. Commit as `docs:`.
- [x] 3.2 In `openspec/specs/crawl-shell/spec.md`, update the Purpose line so it names Places instead of Venues. Verify with `openspec validate crawl-shell --type spec --strict`. Commit as `docs:`.

## 4. Verify

- [x] 4.1 Run `npm test`, `npm run check`, and `npm run build`, and confirm all three pass.
- [x] 4.2 Run `rg -n -i "venue" src static tests/fixtures`. Confirm that the only hits are the retired-key table and its tests, and the frozen `cory-trent-before.json` with the parity test that reads it. Run `rg -n -i "station|train|metra|\bbar\b" src --glob '!*.test.ts'`, and confirm that no code outside tests names a kind of location.
- [x] 4.3 Run `npm run preview` and open Places for `cory-trent` in Chrome at 320 and 390 pixels wide. Confirm these things: five cards with Meetup first; each station above its bar; `Train` and `Bar` tags; no "OR" divider; no horizontal overflow; the Places tab label fully visible. Confirm that each Directions link is a Google search that opens in a new tab.
  - Result: all checks passed. Chrome would not size the viewport below 500 pixels, and the app's CSP blocks framing it, so 320 and 390 were simulated with CSS `zoom`; the app has no width-based media queries. Long station names are cut off with an ellipsis at those widths. The product owner chose to keep the one-line rule from the design.
