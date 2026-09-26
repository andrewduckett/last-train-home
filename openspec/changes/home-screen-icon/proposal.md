## Why

When a Crawler adds the app to a phone's home screen, the phone has no icon to use. iOS shows a screenshot of the page or a letter tile, and Android shows a generic letter icon. The browser tab still shows the 🚆 emoji. The train icon from #34 now exists. The app can reuse it as one app icon for every platform, with no new drawing.

## What Changes

- The site ships an app icon: the train icon from `src/lib/icons/train.svg`, in the board's ink color on a square of the board color.
- A new generator script builds every app icon file from that icon and the palette source:
  - `apple-touch-icon.png` at 180 pixels, for iOS;
  - 192- and 512-pixel PNGs, plus a maskable 512-pixel PNG, for Android;
  - `favicon.svg`, which replaces the 🚆 emoji;
  - `manifest.webmanifest`.
- The manifest names the app, lists the icons, and sets the board color. It sets `display: standalone`, so the home-screen icon opens the app full screen.
- The manifest has no `start_url`. The browser then uses the page the Crawler added, so the icon opens that crawl rather than the default crawl.
- On Android, a Crawler installs the app from Chrome's menu. The change does not promise that Chrome offers an install prompt. A check on a real Android phone must confirm that the installed icon opens `/cory-trent` full screen. If it does not, the manifest plan and the spec change before the work is accepted.
- `src/app.html` links the manifest and the Apple icon. It also sets the iOS status bar to overlay the dark header, which already pads itself below the status bar.
- The build checks the committed app icon files and fails when one is stale. `npm run generate:icons` rewrites them.

Out of scope:

- A service worker, offline caching, or an install prompt. Offline support stays in #17.
- An in-app reload button.
- Per-crawl icons or per-crawl app names.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `deployment`: adds a "Home-screen icon and app manifest" requirement. It covers the app icon files, the full-screen display, the missing `start_url`, the palette colors, the favicon, and the device checks.

## Impact

- New: `scripts/generate-app-icons.mjs` and its test.
- New generated app icon files in `static/`: `manifest.webmanifest`, `apple-touch-icon.png`, and `icons/icon-192.png`, `icons/icon-512.png`, and `icons/icon-maskable-512.png`. `static/favicon.svg` becomes generated.
- New dev dependency: `@resvg/resvg-js`, which turns the app icon SVG into PNGs without a browser.
- `package.json`: a `generate:icons` script. `dev` runs it to rewrite the files. `build` runs it with `--check` before anything else and fails on a stale file.
- `src/app.html`: the manifest link, the Apple icon link, and the iOS status-bar meta tags.
- No change to the CSP, because every new file is same-origin. No change to the shell, the crawl data, or the checklist store.
- On iOS, the full-screen app keeps its own storage, apart from Safari. Ticks made in Safari before a Crawler adds the icon do not carry over.
