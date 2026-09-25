## Context

Today `definition.venues` holds stops. Each stop has `stop`, `town`, and a `places` list of `{ name, address }`. `VenuesView.svelte` renders one card per stop and puts an "OR" divider between places. `Shell.svelte` defines the tab as `{ id: 'venues', label: 'Venues', icon: '🍺' }`. The app does not save the active tab, so the tab id can change freely.

The directions module from #25 already takes plain text parts: `directionsUrl([name, address, town], platform)`. A station needs no new link code.

Build validation in `validate.js` already rejects retired keys through small tables, such as `RETIRED_PLACE_KEYS`. See `proposal.md` for why this change matters now.

## Goals / Non-Goals

**Goals:**

- Put every kind of location in one shape, so the app never needs a word like "station".
- Make each retired key fail the build with the name of its replacement.
- Keep the seed's four bar links exactly as they are today.

**Non-Goals:**

- A list of allowed labels. A label is free text.
- Any change to the directions module, the provider, or the Schedule tab.
- Removing the Map tab, which #26 covers.

## Decisions

### Data shape

```yaml
places:
  - stop: Stop 1
    town: Mt. Prospect, IL
    locations:
      - name: Mount Prospect Metra Station
        address: 13 E Northwest Hwy
        label: Train
      - name: Station 34
        address: 34 S Main St
        label: Bar
```

The types become:

```ts
interface StopLocation { name: string; address: string; label?: string }
interface PlaceStop { stop: string; town: string; locations: StopLocation[] }
// CrawlDefinition.places: PlaceStop[]   (was venues: VenueStop[])
```

- **Why `StopLocation`, not `Location`:** `Location` is a built-in DOM type in TypeScript. Reusing the name would shadow it and confuse readers.
- **Why keep `stop` and `town`:** the explore session agreed that `stop` is not transit vocabulary. Its text is authored, such as "Stop 1" or "Meetup". Keeping the key avoids more churn.
- **Why a `label`, not a `kind`:** a `kind` would need a list of values that the app understands. A label is text that the app only displays. ADR 0006 made the same choice for a move's `mode`.

### Validation extends the retired-key tables

`validate.js` adds two tables beside the existing ones:

```js
const RETIRED_DEFINITION_KEYS = { venues: 'places' };
const RETIRED_STOP_KEYS = { places: 'locations' };
```

The existing place table becomes `RETIRED_LOCATION_KEYS = { n: 'name', a: 'address' }`. The build checks each table before it reads the fields at that level. So an old file fails with `invalid definition.venues (renamed to places)`, not with "invalid `places`".

New checks:

- `locations` must be an array with at least one entry. An empty or missing list fails on `definition.places[i].locations`.
- `label` is optional. When present, it must be a non-empty string after trimming.
- The duplicate error labels change to `definition.places.stop duplicate` and `definition.places[i].locations.name duplicate`.

An empty `places` list stays valid. Several tests build crawls with no places, and a crawl may choose to show none.

### Rename the view and the tab

- `VenuesView.svelte` becomes `PlacesView.svelte`. Its test id becomes `view-places`, and its CSS classes use `place-` and `location-` prefixes.
- The tab becomes `{ id: 'places', label: 'Places', icon: '📍' }`, and the header title becomes "Places".
- **Why a pin:** it means "a location" for any crawl. The beer icon assumed a bar crawl.

### Render locations as a plain list with an optional tag

Each location row shows its name, its tag when it has a label, its address, and its Directions link. Rows sit one after another, with no divider.

- The tag's text uses `--muted` on `--surface`. The palette tests already hold that pair to a 4.5:1 contrast ratio, which meets WCAG AA. Its border uses `--line` and is decorative, because the text alone identifies the tag. The tag adds no new colors.
- The Directions link calls `directionsUrl([location.name, location.address, stop.town], platform)`. The label is not part of the query, because "Train" or "Bar" would only add noise to a map search.
- **Why drop the "OR" divider:** it said the locations at one stop were alternatives. A station and a bar at one stop are both places to go. No spec required the divider, and the seed never showed it. An author who wants alternatives can label them, for example `Option A` and `Option B`.

### Seed data

The seed gains a first stop and four stations. The station names and addresses come from the organizer's `metra.csv`. The towns stay as the seed writes them today.

| Stop | Town | Locations, in order |
|---|---|---|
| Meetup | Palatine, IL | Palatine Metra Station, 137 W Wood St (Train) |
| Stop 1 | Mt. Prospect, IL | Mount Prospect Metra Station, 13 E Northwest Hwy (Train); Station 34 (Bar) |
| Stop 2 | Edison Park, IL | Edison Park Metra Station, 6730 N Olmsted Ave (Train); Edison Park Inn (Bar) |
| Stop 3 | Arlington Heights, IL | Arlington Heights Metra Station, 45 W Northwest Hwy (Train); Eddie's (Bar) |
| Stop 4 | Palatine, IL | Palatine Metra Station, 137 W Wood St (Train); Tap House Grill (Bar) |

The CSV lists Edison Park under Chicago, because it is a Chicago neighborhood. The seed keeps "Edison Park, IL", which the bar's link already uses, and both maps apps resolve it.

### Parity with the frozen snapshot

`tests/fixtures/cory-trent-before.json` stays frozen. It holds only the four bars. `Shell.parity.test.ts` will compare the seed's `Bar` locations, in stop order, against the snapshot's venues. Its four pinned Google links for the bars stay unchanged. A separate test checks the Meetup stop and the four station rows.

### Spec scenario names

The OpenSpec validator keeps an existing scenario name when a requirement is modified. So the `crawl-shell` scenario "The Venues tab shows the seed venues" keeps that name, while its text now describes the Places tab. The archive step will also update the `crawl-shell` Purpose line, which names the tabs, directly in the main spec.

## Risks / Trade-offs

- [An author's crawl outside this repo still uses `venues`] → The build names each replacement key. The fix is a find-and-replace of two keys.
- [A label could be long and crowd the row on a 320-pixel screen] → The tag stays on the name line and may wrap. The name keeps its current truncation rule. A task checks the seed at 320 pixels.
- [Two locations at one stop can share a name only by mistake] → Validation rejects a repeated name within a stop, as it does today.
- [The same station appears at two stops, such as Palatine] → That is allowed. Names only need to be unique within one stop.

## Migration Plan

1. Land the change. The seed, types, views, validation, and tests move in one pull request.
2. Rollback: revert the pull request. Saved checks do not depend on this data.
