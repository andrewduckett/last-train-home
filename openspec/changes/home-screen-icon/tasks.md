## 1. App icon generator (test-first)

- [x] 1.1 Run `npm install --save-dev @resvg/resvg-js`. Verify that `package.json` and `package-lock.json` list it, and that `node -e "require('@resvg/resvg-js')"` exits cleanly.
- [x] 1.2 Write `tests/app-icons.test.ts` with failing tests, one behavior each:
  - `generateAppIcons()` returns the six outputs from the design's table;
  - the manifest sets `display: standalone`, `name`, `short_name`, and theme and background colors equal to the palette's `board`, and has no `start_url`;
  - the manifest lists 192, 512, and maskable 512 icons, and each PNG's header states the listed size;
  - each rendered PNG has only opaque pixels, and its corner pixel is the palette's `board` color;
  - the favicon uses `board` and `board-ink` and contains no emoji;
  - every committed file equals the generated content, and a failure names the stale file.

  Verify that the tests fail because `scripts/generate-app-icons.mjs` does not exist.
- [x] 1.3 Write `scripts/generate-app-icons.mjs` as design decisions 1 to 3 describe, with a `--check` mode that exits non-zero and names each stale file. Run `node scripts/generate-app-icons.mjs` to write the files into `static/`. Verify that `tests/app-icons.test.ts` passes. Commit 1.1 to 1.3 as `feat:`.

## 2. Build gate and page head (test-first)

- [ ] 2.1 Add failing tests:
  - in `tests/app-icons.test.ts`: `src/app.html` links the manifest and the Apple touch icon, sets the `black-translucent` status bar and the `Last Train` app title, and sets a `theme-color` equal to the palette's `board`, ignoring case;
  - in `tests/static-build.test.ts`: `build/` holds the manifest, `apple-touch-icon.png`, and the three files in `icons/`.

  Run `npm run build`, and verify that the new tests fail.
- [ ] 2.2 In `package.json`, add `generate:icons`, make `dev` run it after `generate:palette`, and make `build` run `node scripts/generate-app-icons.mjs --check` first. Add the four head tags from design decision 4 to `src/app.html`. Run `npm run build`, then verify that `npm test` passes, including the unchanged CSP tests. Commit as `feat:`.
- [ ] 2.3 Prove the build gate. Append one character to `static/favicon.svg`, run `npm run build`, and confirm that it fails before Vite runs and names `favicon.svg`. Restore the file with `git checkout static/favicon.svg`, and confirm that `npm run build` passes.

## 3. Verify

- [ ] 3.1 Run `npm test`, `npm run check`, and `npm run build`, and confirm that all three pass.
- [ ] 3.2 Render the five app icon files at their real sizes in headless Chrome, with the favicon at 16 and 32 pixels. Check that the train is centered, that the maskable train sits inside the 80% safe-zone circle, and that the favicon reads at 16 pixels. Show the user the render.
- [ ] 3.3 Ask the user before uploading. With their yes, run `npx wrangler versions upload` and give them the preview URL. Verify that the preview serves `/manifest.webmanifest` and `/apple-touch-icon.png` over HTTPS.
- [ ] 3.4 Ask the user to run the device checks on the preview URL, and wait for their results:
  - **iPhone, Safari**: open `/cory-trent`, then Share → Add to Home Screen. Confirm the train icon, then open it. Confirm there is no address bar, that the header text sits below the status bar, and that the app shows `/cory-trent`.
  - **Android, Chrome**: open `/cory-trent`, then use the menu option to install or add the app to the home screen. Confirm the train icon, then open it. Confirm there is no address bar, that the header text sits below the status bar, and that the app shows `/cory-trent`.
  - **Either phone, browser tab**: confirm the tab icon is the train, not the emoji.

  If either phone opens `/` or a browser tab, stop. Report the result, and revise the manifest plan and the spec with the user before continuing.
- [ ] 3.5 Record the device check results, with each phone's OS and browser version, in the PR description.
