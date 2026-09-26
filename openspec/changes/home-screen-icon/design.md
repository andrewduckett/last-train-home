## Context

- `src/app.html` holds the page head. It sets `theme-color` to `#12161C` by hand and links `static/favicon.svg`, which draws the 🚆 emoji as text. It links no manifest and no Apple icon.
- `src/lib/icons/train.svg` is the Bold train from #34. It draws with `currentColor` on a 24-unit grid.
- `src/lib/theme/palette.mjs` is the only source of UI colors. `board` is `#12161c` and `board-ink` is `#edeff3` in both light and dark schemes. `scripts/generate-palette.mjs` turns it into committed CSS, runs in `dev` and `build`, and has a `--check` mode. A test fails when the committed CSS is stale.
- The shell header already pads itself with `max(12px, env(safe-area-inset-top))`, and the viewport sets `viewport-fit=cover`.
- The CSP sets `default-src 'self'` and `img-src 'self' data:`. A same-origin manifest and same-origin PNGs fall under those sources.

## Goals / Non-Goals

**Goals:**

- Build every app icon file from two sources, `train.svg` and the palette, so a color or icon change reaches every platform.
- Fail the build when a committed app icon file is stale.

**Non-Goals:**

- Checking home-screen behavior in an automated test. No test runner in the repo drives a real phone. The device checks are manual.

## Decisions

### 1. Generate the app icons with a script modeled on the palette script

`scripts/generate-app-icons.mjs` exports `generateAppIcons()`. The function returns a map from each output path to its content. The script writes the map to `static/` when run, and compares the map with the committed files under `--check`. `package.json` gains `generate:icons`. `dev` runs it after `generate:palette` to rewrite the files. `build` runs `generate:icons --check` first, before it regenerates the palette or writes the site. A stale file fails the build and names the file. Only `npm run generate:icons` rewrites the committed files, so no step in the local or CI sequence can hide a stale file.

The palette script differs: `build` regenerates the palette CSS, and a test catches drift. Icons need the stricter order, because the repo's local gate runs `npm run build` before `npm test`. A build that rewrote the icons would make the stale-file test pass.

The function builds each app icon as an SVG string:

- a square `rect` filled with the palette's `board` color;
- the contents of `train.svg`, nested as an inner `<svg>` so its own `viewBox` scales it, with `currentColor` replaced by the palette's `board-ink` color.

The train fills 60% of the icon width for the standard icons. It fills 50% for the maskable icon, so it stays inside Android's safe zone, a circle 80% of the icon wide. The favicon uses a 32-unit square with a corner radius of 6, because a browser tab does not round the icon for it.

| Output | Size | Shape |
|---|---|---|
| `static/apple-touch-icon.png` | 180 | Square, full bleed. iOS rounds the corners. |
| `static/icons/icon-192.png` | 192 | Square, full bleed |
| `static/icons/icon-512.png` | 512 | Square, full bleed |
| `static/icons/icon-maskable-512.png` | 512 | Square, train at 50% |
| `static/favicon.svg` | vector | Rounded square |
| `static/manifest.webmanifest` | — | JSON |

- *Alternative: draw the PNGs once by hand and commit them.* Then a palette change would not reach the app icons, and nothing would catch the drift.
- *Alternative: rasterize with headless Chrome.* The build would then need a browser on every machine.

### 2. Rasterize with `@resvg/resvg-js`

The script turns each app icon SVG into a PNG with `@resvg/resvg-js`, a dev dependency. It runs in Node with no browser and no system library, and it gives the same bytes for the same input and version. The lock file pins the version. A version bump that changes the bytes fails the build's stale check, and `npm run generate:icons` fixes it.

- *Alternative: `sharp`.* It rasterizes SVG too, but it pulls in native `libvips` binaries for one small job.

### 3. Leave `start_url` out of the manifest

When a manifest has no `start_url`, the browser uses the URL of the page that linked the manifest. A Crawler who adds `/cory-trent` then gets an icon that opens `/cory-trent`. `scope` defaults to `/`, so links between crawls stay inside the full-screen app. Each crawl's icon also gets its own app identity on Android, because the manifest `id` defaults to the start URL.

Chrome's published criteria for its install prompt list `start_url`. This change does not need that prompt: a Crawler installs from Chrome's menu, which accepts a manifest without `start_url`. Whether Chrome then opens the installed icon full screen at `/cory-trent` is a device check, not a JSON check. If Chrome opens a browser tab or `/` instead, the implementer pauses. The manifest plan and the spec change before the work is accepted.

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
| iOS shows the app icon | A test reads `app.html` for the Apple icon link. It reads the PNG header for a 180 by 180 size. It renders the icon and checks that every pixel is opaque. The device check confirms the icon on an iPhone. |
| Android shows the app icon | A test reads the manifest's icons and compares each stated size with the PNG header. The device check installs from Chrome's menu and confirms the icon. |
| The home-screen app opens full screen | A test checks `display: standalone` and the status-bar meta tag. The device checks on both phones confirm there is no address bar and the header text sits below the status bar. |
| The home-screen app opens the crawl it was added from | A test checks that the manifest has no `start_url`. On each phone, the device check adds `/cory-trent`, closes the browser, and opens the icon. |
| The app icon uses the palette's board colors | A test renders an app icon and checks a corner pixel for `board`. It checks the manifest colors and `app.html`'s `theme-color` against `board`. |
| The browser tab shows the app icon | A test checks that `favicon.svg` has no emoji and uses the palette colors. |
| A stale app icon fails the build | `build` runs `generate:icons --check` first. A test also compares `generateAppIcons()` with every committed file, so `npm test` alone catches drift too. To prove the gate, the implementer changes one committed file and confirms that `npm run build` fails before Vite runs. |
| The icons need no policy change | The static-build test checks that `build/` holds the manifest and every icon. The existing CSP tests stay green unchanged. |

The device checks run against a Cloudflare preview version, uploaded with `npx wrangler versions upload`. Android offers a full-screen app only on HTTPS, so a LAN preview is not enough. Uploading is an outward action, so the implementer asks the user first. The user runs the checks on their own phones.

## Risks / Trade-offs

- [iOS or Chrome may open `/`, or Chrome may open a browser tab, when `start_url` is missing] → The device checks test this first on both phones. If either fails, the implementer pauses, and the user chooses between `start_url: "/"` and per-crawl manifests. Either choice changes the spec.
- [On iOS, the full-screen app has storage separate from Safari] → Ticks made in Safari before a Crawler adds the icon do not carry over. The proposal records this, and the organizer tells Crawlers to add the icon before the event.
- [Full screen has no reload button] → The shell fetches the crawl once, when the page loads. Returning to a home-screen app often resumes the page that is already loaded, so an author's fix does not appear. It appears after a fresh page load: the Crawler closes the app from the app switcher and opens it again. Crawl YAML is served `no-cache`, so that fresh load fetches the latest. To verify an author fix, the implementer deploys a changed crawl, force-closes the app, and reopens it.
- [A `@resvg/resvg-js` upgrade changes the PNG bytes] → The stale check fails, and `npm run generate:icons` rewrites the files. The lock file keeps this from happening unannounced.
- [The dev dependency ships a native binary for each platform] → It installs from npm with prebuilt binaries and is used only at build time. Nothing from it reaches the browser.
