## Why

The schedule still treats travel as train departures. Its quick links also assume every crawl uses Ventra and Metra. Authors need one itinerary format that works for train rides, walks, and other timed outings. YAML routing and per-crawl state are now in place, so the next story can make the rendered content generic.

## What Changes

- **BREAKING**: Replace `arrive`, `depart`, and `warning` schedule kinds with timed `stop`, `move`, and `note` entries. A move carries an author-written mode.
- Replace fixed Ventra and Metra fields with an ordered `links` list. A crawl may have no quick links.
- Replace the map URL fields with a per-crawl `map` containing embed and viewer URLs. Google Maps remains the supported embed provider under the current CSP.
- Resolve schedule entries in the schedule layer. Skip an unexpectedly malformed entry while keeping the rest of the page usable.
- Migrate the `cory-trent` YAML record without losing its itinerary, link destinations, or map destinations.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `crawl-shell`: Render generic schedule entries, authored quick links, and the crawl's map.
- `crawl-authoring`: Validate the new schedule, link, and map fields before publication.
- `crawl-provider`: Preserve the seed crawl's content and order while its definition fields migrate.

## Impact

The change affects the crawl definition type, schedule and map views, build validation, seed YAML, and their tests. The provider, routes, checklist store, and CSP policy keep their current contracts.
