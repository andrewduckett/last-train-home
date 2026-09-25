## Why

A Crawler can't get directions to the train today. The Venues tab lists only bars, and the train is the step most likely to be missed because it won't wait. The tab's words and schema also assume a bar crawl: the tab is called Venues, its icon is a beer, and places at one stop are shown as alternatives. The app is meant for any kind of crawl, so this change treats everything on the tab as a location that the author names.

## What Changes

- **BREAKING (authoring):** `definition.venues` becomes `definition.places`. Each group keeps `stop` and `town`, and its `places` list becomes `locations`.
- A location has `name`, `address`, and an optional `label`. The author writes the label, such as "Train" or "Bar", and the tab shows it as a small tag.
- The build rejects the retired keys and names the key that replaces each one. It also rejects a stop with no locations.
- The app renames the tab from Venues to **Places**, and replaces its beer icon with a neutral pin.
- Locations at a stop render as a plain list. The "OR" divider between them goes, because a station and a bar at one stop are not alternatives.
- Every location gets the same platform-aware Directions link. Its query is the location's name, address, and the stop's town.
- The seed crawl gains its Metra stations:
  - A new first stop, `Meetup`, holds Palatine Metra Station at 137 W Wood St.
  - Each bar stop lists its station first, labeled "Train", then its bar, labeled "Bar".
  - Stop 4 lists Palatine Metra Station, where the last train arrives.
  - The station addresses come from the organizer's confirmed station list.

The app hardcodes no kind of location. Words like "Train" and "Bar" appear only in authored data.

Out of scope:

- Stations on the Schedule tab.
- Live train times.
- Removing the Map tab, which #26 covers.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `crawl-authoring`:
  - The build validates `places`, `locations`, and the optional `label`.
  - It rejects the retired keys, and it rejects a stop with no locations.
  - This change renames the two requirements that say "venue" so they say "place".
- `crawl-shell`:
  - The tab list names Places instead of Venues.
  - "Venue list with directions" becomes "Place list with directions". It lists each stop's locations with their labels, and no longer shows an "OR" divider.
  - The seed scenario for the tab now describes the Places tab. It keeps its old name, because the OpenSpec validator matches scenarios by name.

## Impact

- `src/lib/types.ts`: `VenueStop` and `VenuePlace` become place and location types, with an optional `label`.
- `src/lib/VenuesView.svelte` becomes `src/lib/PlacesView.svelte`, with its test file renamed too.
- `src/lib/Shell.svelte`: the tab id, label, title, and icon change.
- `src/lib/data/validate.js`: validates the new keys and rejects the retired ones.
- `static/crawls/cory-trent.yaml` and `tests/fixtures/cory-trent.json`: the new shape, a Meetup stop, and four stations.
- Tests that build crawls inline, the parity test, and the tab tests all move to the new names.
- `openspec/discovery.md` and the `crawl-shell` spec's Purpose line: the tab name changes.
- No change to the provider, the directions module, the checklist store, or the content security policy.
- If an author adds an old-key crawl to `static/crawls/`, the build fails until the author renames the keys.
