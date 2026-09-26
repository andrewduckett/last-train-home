## Why

The Map tab embeds a Google My Maps frame, which is hard to pan and zoom on a phone. The Places tab now gives every stop and station its own Directions link, so the Crawler no longer needs the embedded map to find anything. The map also costs the app a schema field, a tab, and a CSP exception for a cross-origin frame. Story #16 will author a second crawl next, so removing the map now means that crawl never needs one.

## What Changes

- **BREAKING (authoring):** `definition.map` is gone. The build rejects a leftover `map` key and tells the author to link a route map from `links`.
- The app removes the Map tab. The tabs become Schedule, Places, and Tasks, plus the optional Info tab.
- The app removes `MapView`, the `CrawlMap` type, and the three map URL helpers in `urls.js`.
- The CSP sets `frame-src 'none'`, because the app no longer frames anything. Today the policy allows only `https://www.google.com`.
- The seed crawl keeps its route map as an Info-tab link, labeled "Route map" with the hint "Open the crawl route". It links to the My Maps viewer URL. The seed drops the embed URL, because nothing uses it.

Out of scope:

- An "Open route map" button on the Places tab.
- Any other change to the tab layout.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `crawl-shell`:
  - "Four-tab navigation" becomes "Tab navigation", with no Map tab.
  - "Quick links and embedded map" loses its map rules and scenarios.
  - The seed scenario for the Map tab changes to check the Route map link on Info.
  - The phone-layout scenario now covers at most four tabs.
- `crawl-authoring`: "Validate generic itinerary fields" no longer requires a map. It drops the map URL rules and rejects a leftover `map` key.
- `crawl-provider`: the definition's field list and the seed-preservation requirement no longer mention map URLs. The seed's route map is checked as a quick link.
- `deployment`: the policy allows no frames, and no requirement names a map frame.

## Impact

- Removed: `src/lib/MapView.svelte`, `src/lib/MapView.test.ts`, and `src/lib/MapView.generic.test.ts`.
- `src/lib/Shell.svelte`: the Map tab, its title, and its view branch go.
- `src/lib/types.ts`: `CrawlMap` and `CrawlDefinition.map` go.
- `src/lib/crawl/urls.js` and its tests: `resolveMap`, `isMapEmbedUrl`, and `isMapViewerUrl` go. `isQuickLinkUrl` and `resolveLinks` stay.
- `src/lib/data/validate.js` and its tests: the map block goes, and a leftover `map` key fails.
- `svelte.config.js`: `frame-src` becomes `'none'`. `tests/csp-build.test.ts` checks it.
- `static/crawls/cory-trent.yaml` and `tests/fixtures/cory-trent.json`: `map` goes, and a Route map link joins `links`.
- Tests that open the Map tab or build a crawl with `map`: `Shell.test.ts`, `Shell.provider.test.ts`, `Shell.parity.test.ts`, `Shell.theme.test.ts`, `CrawlRoute.test.ts`, `provider.test.ts`, `validate-generic.test.ts`, and `tests/csp-browser.test.ts`.
- `openspec/discovery.md` and the `crawl-shell` spec's Purpose line: the Map tab is gone.
- No change to the provider code, the directions module, or the checklist store.
- If an author adds a crawl with a `map` key to `static/crawls/`, the build fails until the author moves the viewer URL into `links`.
