## Context

- `src/app.html` holds the page head. It sets `theme-color` to `#12161C` by hand and links `static/favicon.svg`, which draws the 🚆 emoji as text. It links no manifest and no Apple icon.
- `src/lib/icons/train.svg` is the Bold train from #34. It draws with `currentColor` on a 24-unit grid.
- `src/lib/theme/palette.mjs` is the only source of UI colors. `board` is `#12161c` and `board-ink` is `#edeff3` in both light and dark schemes. `scripts/generate-palette.mjs` turns it into committed CSS, runs in `dev` and `build`, and has a `--check` mode. A test fails when the committed CSS is stale.
- The shell header already pads itself with `max(12px, env(safe-area-inset-top))`, and the viewport sets `viewport-fit=cover`.
- The CSP sets `default-src 'self'` and `img-src 'self' data:`. A same-origin manifest and same-origin PNGs fall under those sources.

## Goals / Non-Goals

**Goals:**

- Build every tile file from two sources, `train.svg` and the palette, so a color or icon change reaches every platform.
- Catch stale tile files in the test suite, the same way the palette CSS is caught.

**Non-Goals:**

- Checking home-screen behavior in an automated test. No test runner in the repo drives a real phone. The device checks are manual.

## Decisions

### 1. Generate the tiles with a script that follows the palette pattern

`scripts/generate-app-icons.mjs` exports `generateAppIcons()`. The function returns a map from each output path to its content. The script writes the map to `static/` when run, and compares the map with the committed files under `--check`. `package.json` gains `generate:icons`, and `dev` and `build` run it after `generate:palette`.

The function builds each tile as an SVG string:

- a square `rect` filled with the palette's `board` color;
- the contents of `train.svg`, nested as an inner `<svg>` so its own `viewBox` scales it, with `currentColor` replaced by the palette's `board-ink` color.

The train fills 60% of the tile width for the standard icons. It fills 50% for the maskable icon, so it stays inside Android's safe zone, a circle 80% of the tile wide. The favicon uses a 32-unit tile with a corner radius of 6, because a browser tab does not round the icon for it.

| Output | Size | Shape |
|---|---|---|
| `static/apple-touch-icon.png` | 180 | Square, full bleed. iOS rounds the corners. |
| `static/icons/icon-192.png` | 192 | Square, full bleed |
| `static/icons/icon-512.png` | 512 | Square, full bleed |
| `static/icons/icon-maskable-512.png` | 512 | Square, train at 50% |
| `static/favicon.svg` | vector | Rounded tile |
| `static/manifest.webmanifest` | — | JSON |

- *Alternative: draw the PNGs once by hand and commit them.* Then a palette change would not reach the tiles, and nothing would catch the drift.
- *Alternative: rasterize with headless Chrome.* The build would then need a browser on every machine.

### 2. Rasterize with `@resvg/resvg-js`

The script turns each tile SVG into a PNG with `@resvg/resvg-js`, a dev dependency. It runs in Node with no browser and no system library, and it gives the same bytes for the same input and version. The lock file pins the version. A version bump that changes the bytes fails the stale check, and `npm run generate:icons` fixes it.

- *Alternative: `sharp`.* It rasterizes SVG too, but it pulls in native `libvips` binaries for one small job.

### 3. Leave `start_url` out of the manifest

When a manifest has no `start_url`, the browser uses the URL of the page that linked the manifest. A Crawler who adds `/cory-trent` then gets an icon that opens `/cory-trent`. `scope` defaults to `/`, so links between crawls stay inside the full-screen app. Each crawl's icon also gets its own app identity on Android, because the manifest `id` defaults to the start URL.

- *Alternative: `start_url: "/"`.* The icon would open the default crawl, which can change between events.
- *Alternative: one manifest per crawl.* The site would need to build a manifest for each YAML file and swap the link at run time. That costs far more than this story is worth.

### 4. Keep the head tags in `app.html`, and test the one hand-written color

`src/app.html` gains four tags:

- `<link rel="manifest" href="%sveltekit.assets%/manifest.webmanifest">`
- `<link rel="apple-touch-icon" href="%sveltekit.assets%/apple-touch-icon.png">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`, so the dark header shows under the iOS status bar. The header's safe-area padding keeps its text below the bar.
- `<meta name="apple-mobile-web-app-title" content="Last Train">`

`theme-color` stays hand-written in `app.html`, because SvelteKit fills that template as-is. A test checks that it equals the palette's `board` color, so the palette stays the source of truth.

The manifest sets `name` to "Last Train Home" and `short_name` to "Last Train".

## Verification

| Spec scenario | Check |
|---|---|
| iOS shows the train tile | A test reads `app.html` for the Apple icon link. It reads the PNG header for a 180 by 180 size. It renders the tile and checks that every pixel is opaque. The device check confirms the icon on an iPhone. |
| Android shows the train tile | A test reads the manifest's icons and compares each stated size with the PNG header. The device check confirms the icon on an Android phone. |
| The home-screen icon opens full screen | A test checks `display: standalone` and the status-bar meta tag. The device check confirms there is no address bar and the header text sits below the status bar. |
| The home-screen icon opens the crawl it was added from | A test checks that the manifest has no `start_url`. The device check adds `/cory-trent` and opens the icon. |
| The tile uses the palette's board colors | A test renders a tile and checks a corner pixel for `board`. It checks the manifest colors and `app.html`'s `theme-color` against `board`. |
| The browser tab shows the train tile | A test checks that `favicon.svg` has no emoji and uses the palette colors. |
| A stale tile fails the tests | A test compares `generateAppIcons()` with every committed file and names any file that differs. |
| The icons need no policy change | The static-build test checks that `build/` holds the manifest and every icon. The existing CSP tests stay green unchanged. |

The device checks run against a Cloudflare preview version, uploaded with `npx wrangler versions upload`. Android offers a full-screen app only on HTTPS, so a LAN preview is not enough. Uploading is an outward action, so the implementer asks the user first. The user runs the checks on their own phones.

## Risks / Trade-offs

- [iOS may open `/` instead of the added crawl when `start_url` is missing] → The device check tests this first. If iOS ignores the page URL, the implementer pauses, and the user chooses between `start_url: "/"` and per-crawl manifests. Either choice changes the spec.
- [On iOS, the full-screen app has storage separate from Safari] → Ticks made in Safari before a Crawler adds the icon do not carry over. The proposal records this, and the organizer tells Crawlers to add the icon before the event.
- [Full screen has no reload button] → A Crawler sees an author's fix only after reopening the app. Crawl YAML is served `no-cache`, so a reopen always fetches the latest.
- [A `@resvg/resvg-js` upgrade changes the PNG bytes] → The stale check fails, and `npm run generate:icons` rewrites the files. The lock file keeps this from happening unannounced.
- [The dev dependency ships a native binary for each platform] → It installs from npm with prebuilt binaries and is used only at build time. Nothing from it reaches the browser.
