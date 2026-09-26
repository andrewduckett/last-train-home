## Context

The map lives in five places today:

- `definition.map` in the seed YAML and its fixture, with `embed` and `app` URLs.
- The `CrawlMap` type and `CrawlDefinition.map` in `src/lib/types.ts`.
- `MapView.svelte`, which frames `map.embed` and links to `map.app`, and its two test files.
- Three helpers in `src/lib/crawl/urls.js`: `resolveMap`, `isMapEmbedUrl`, and `isMapViewerUrl`. Only `MapView` and `validate.js` use them.
- The CSP in `svelte.config.js`, whose `frame-src` allows `https://www.google.com` for that frame.

The Info tab already renders `links` as quick links, and the seed already has an Info tab. `tests/csp-build.test.ts` parses the built policy, but it does not check `frame-src` today. See `proposal.md` for why this change matters now.

## Goals / Non-Goals

**Goals:**

- Remove every trace of the embedded map from code, data, types, and policy.
- Keep the seed's route map one tap away, as an Info link.
- Make "the app frames nothing" a policy that a test enforces.

**Non-Goals:**

- A route map button on the Places tab.
- Validating that a quick link points at a map. A route map is an ordinary quick link.

## Decisions

### `frame-src 'none'`, not a missing `frame-src`

`svelte.config.js` sets `'frame-src': ['none']`. SvelteKit quotes keyword sources, as it already does for `'self'`.

- **Why not delete the directive:** without `frame-src`, the browser falls back to `default-src 'self'`, which allows same-origin frames. Today's policy blocks those, so deleting the directive would loosen the policy. `'none'` matches what the app does: it frames nothing.
- `tests/csp-build.test.ts` gains two checks. The built policy's `frame-src` is exactly `'none'`, and no directive names `https://www.google.com`.
- `frame-ancestors 'none'` in `static/_headers` is a different directive. It stops other sites from framing this app, and it stays.

### Reject a leftover `map` like `albumUrl`

`validate.js` drops the map block and adds one line beside the `albumUrl` check:

```js
if ('map' in definition) invalid(fileName, 'definition.map (removed; link a route map from links)');
```

- **Why not the retired-key table:** that table says "renamed to X", but `map` has no replacement key. The suffix tells the author what to do instead.
- The existing `albumUrl` message stays as it is. Changing it is out of scope.

### The seed's route map becomes a third quick link

```yaml
links:
  - label: Ventra
    ...
  - label: Metra
    ...
  - label: Route map
    hint: Open the crawl route
    url: https://www.google.com/maps/d/viewer?mid=1j-yfShXEfBlLNnzdcv4-btB5G6SLdOI
```

The seed drops the embed URL, because nothing can show it.

- `Shell.parity.test.ts` proves that the map survives. It expects the seed's link URLs to equal the frozen snapshot's Ventra URL, Metra URL, and My Maps viewer URL, in that order. It replaces the Map-tab parity test.
- `seed.test.ts` expects the link labels Ventra, Metra, and Route map.

### Delete, don't hide

`MapView.svelte`, its two test files, `CrawlMap`, and the three map helpers go. `urls.test.ts` keeps its quick-link cases and loses its map cases. `Shell.svelte` loses the Map entry in `BASE_TABS`, its `TITLES` entry, its view branch, and the `MapView` import. The `TabId` type narrows on its own, because it derives from `BASE_TABS`.

### Spec requirements that must be replaced, not modified

The OpenSpec validator keeps every existing scenario of a modified requirement, and it rejects a requirement that is both removed and added under one name. Four requirements have a map scenario that must go. Each is removed and re-added under a new name:

| Removed | Added |
|---|---|
| crawl-shell: Quick links and embedded map | Quick links |
| crawl-shell: Phone-first layout | Phone-first shell layout |
| crawl-shell: Resolve the crawl before rendering views | Resolve the crawl before a view renders |
| crawl-authoring: Validate generic itinerary fields | Validate schedule and quick-link fields |
| deployment: App-loaded assets are same-origin, fonts self-hosted | Same-origin assets, self-hosted fonts, and no frames |

The other requirements change in place. "Four-tab navigation" is renamed "Tab navigation". The two `crawl-provider` requirements lose their map wording. The `crawl-shell` Purpose line, which names the tabs, gets a direct edit in the main spec.

## Risks / Trade-offs

- [An author's crawl outside this repo still has `map`] → If they add it to `static/crawls/`, the build fails and says to move the viewer URL into `links`.
- [A Crawler relied on the embedded map to orient themselves] → The Route map link opens the same My Maps view, in the maps app or the browser. The Places tab gives each stop and station its own Directions link.
- [Replacing requirements changes their names, so links to the old names break] → Nothing outside `openspec/` links to requirement names. The REMOVED entries record where each rule went.

## Migration Plan

1. Land the change. The seed, types, views, validation, policy, and tests move in one pull request.
2. Rollback: revert the pull request. No stored state depends on the map.
