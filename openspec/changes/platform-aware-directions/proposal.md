## Why

Every Directions link on the Venues tab opens Google Maps and adds `, IL` to the search. On an iPhone, that skips the phone's own maps app. For any crawl outside Illinois, the search points at the wrong state. Directions are the Crawler's main wayfinding action, and #16 will add a second crawl, so the fix comes first. This story also builds the link builder that the stations story (#27) reuses.

## What Changes

- On Apple devices (iPhone, iPad, and Mac), Directions opens an Apple Maps search at `maps.apple.com`.
- On every other device, Directions opens a Google Maps search, as it does today. Google Maps is also the fallback when the app cannot tell the device.
- The search query is the place's name, address, and town, exactly as the author wrote them. The app no longer adds `, IL`.
- Directions still opens a map **search**, not a route. The Crawler sees the pin before starting a route.
- The seed crawl writes its state into each town, for example `Mt. Prospect, IL`. So the seed's Google links stay exactly the same, and its Venues cards now show the state.
- One small, tested module builds the link. The provider stays free of it.

Out of scope:

- A setting for the Crawler to choose a maps app.
- Turn-by-turn directions links.
- `geo:` links, Waze, and other map providers.
- Directions to stations, which #27 adds using this module.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `crawl-shell`: the "Venue list with directions" requirement changes. Today it requires a Google Maps search with `IL` added. After this change, the query holds only the authored name, address, and town, and Apple devices get Apple Maps.

`crawl-authoring` does not change. Build validation already accepts any town text, including one with a state.

## Impact

- New module `src/lib/crawl/directions.ts`, with unit tests.
- `src/lib/VenuesView.svelte`: uses the new module instead of its own `mapsUrl`.
- `static/crawls/cory-trent.yaml` and `tests/fixtures/cory-trent.json`: each town gains `, IL`.
- Tests: `VenuesView.test.ts`, `Shell.parity.test.ts`, and `Shell.provider.test.ts`.
- `openspec/discovery.md`: the "Find the stop" journey step no longer cites a hardcoded `, IL`.
- No change to the provider, the schema, build validation, or the content security policy. The policy limits embedded frames, not links.
