## Context

`VenuesView.svelte` builds each Directions link with a private `mapsUrl` function. It always returns a Google Maps search and always appends `, IL`. The stations story (#27) needs the same link for a station, so the builder should move out of the view. See `proposal.md` for why this matters now.

Three facts shape the approach:

- The app renders only in the browser (`ssr = false`). So `navigator` exists whenever the view runs, and no server-rendered HTML can disagree with it.
- The content security policy limits scripts and embedded frames. A plain link to another site needs no policy change.
- Tests run in jsdom. Its default user agent names neither an Apple device nor Android, so existing tests take the Google path.

## Goals / Non-Goals

**Goals:**

- Keep the link builder pure, so its unit tests cover both maps apps without faking `navigator`. Only the view tests fake the user agent.
- Keep device detection in one small function that tests can call with any user-agent string.
- Keep the seed's Google links byte-for-byte the same.

**Non-Goals:**

- Detecting the device precisely. The only question is "Apple or not."
- Handling blank address or town text. Build validation allows it, but no crawl uses it, and the result is only an untidy search.

## Decisions

### One module, three functions

`src/lib/crawl/directions.ts` exports:

```ts
type MapsPlatform = 'apple' | 'other';
function detectMapsPlatform(userAgent: string | undefined): MapsPlatform;
function directionsUrl(parts: string[], platform: MapsPlatform): string;
function opensInNewTab(platform: MapsPlatform): boolean;
```

`VenuesView` calls `detectMapsPlatform(navigator.userAgent)` once. It then calls `directionsUrl([place.name, place.address, venue.town], platform)` for each place.

- **Why a list of parts, not a venue place:** a station in #27 will not be a venue place. A list of strings serves both.
- **Why pass the platform in:** `directionsUrl` stays pure. Only `detectMapsPlatform` touches device data, and it takes that data as an argument.
- **Why a new file, not `urls.js`:** `urls.js` validates authored URLs. This module builds links, which is a different job. `richText.ts` and `schedule.ts` already set the pattern of one small domain module per job.

### Detect Apple by user agent alone

`detectMapsPlatform` returns `'apple'` when the user agent contains `iPhone`, `iPad`, `iPod`, or `Macintosh`. Otherwise, including when the string is missing, it returns `'other'`.

- **Why no touch check:** the issue suggested checking touch support to spot an iPad that reports itself as a Mac. That check only separates an iPad from a Mac. Both get Apple Maps, so it changes nothing.
- **Why not `navigator.platform` or `userAgentData`:** `platform` is deprecated, and `userAgentData` does not exist in Safari. The user agent covers every case here.
- **Other iOS browsers:** Chrome and Firefox on iOS also report `iPhone`, so they get Apple Maps too. That is correct, because the Maps app is on every iPhone.

### Keep the link formats the app already trusts

- Apple: `https://maps.apple.com/?q=<query>`. Apple's newer `/search?query=` form needs iOS 18.4 or later. The older `q` form works on every version.
- Google: `https://www.google.com/maps/search/?api=1&query=<query>`, unchanged.
- `directionsUrl` joins the parts with `, ` and encodes the result with `encodeURIComponent`, as the view does today. `URLSearchParams` would encode spaces as `+` and change the seed's links. Encoding also keeps authored text from adding its own URL parameters.

### Open Apple Maps in the same tab

An Apple Maps link has no `target`. A Google Maps link keeps `target="_blank"` and `rel="noopener noreferrer"`.

- **Why:** on an iPhone, iPad, or Mac in Safari, the system hands `maps.apple.com` to the Maps app. A new tab would then stay behind, empty. With no `target`, the crawl page stays as it was.
- **Why Google keeps a new tab:** that is today's behavior, and Android hands the link to Google Maps from a new tab without trouble.
- **Cost:** a browser that does not hand off, such as Chrome on a Mac or an in-app browser, replaces the crawl page with Apple Maps. The Crawler taps Back to return. Saved checks live in local storage, so nothing is lost.
- **Alternative considered:** a new tab for both. It matches Google, but it can leave an empty tab on the phone, which is the main target.

`opensInNewTab(platform)` holds this rule, so the view and the stations story (#27) share it. The view reads it to set `target` and `rel`.

### Move the state into the seed's data

Each seed town gains `, IL`, for example `Mt. Prospect, IL`. The seed's Google queries then match today's character for character. The Venues card header now shows the state.

`tests/fixtures/cory-trent-before.json` stays frozen. `Shell.parity.test.ts` already maps that snapshot to the current keys. It will also append `, IL` to each old town before comparing. Its four pinned Directions URLs stay as they are, which proves the seed's links did not change.

## Risks / Trade-offs

- [iOS might not hand a same-tab `maps.apple.com` link to the Maps app in some browsers] → The Crawler still sees the Apple Maps search on the web and taps Back to return. A task checks the handoff on a real iPhone, in Safari and in Chrome, before archive.
- [Without a state, a query can match the wrong place when the phone is far from the crawl] → Each app favors results near the phone, and on the day the Crawler is nearby. Authors who want certainty write the state into the town, as the seed now does.
- [A Mac user may prefer Google Maps] → The Mac gets Apple Maps, as the epic decided. Desktop is a bonus target, and a maps-app setting is out of scope.
- [A non-Apple browser sends a Macintosh user agent] → That browser gets Apple Maps on the web. Apple Maps on the web may not support every browser, but this case is rare.

## Migration Plan

1. Land the change. The seed, the view, and the tests move together.
2. Rollback: revert the pull request. No stored state depends on this change.
