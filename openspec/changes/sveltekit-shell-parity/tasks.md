## 1. Scaffold SvelteKit and the toolchain

- [x] 1.1 Add SvelteKit, Svelte 5, `@sveltejs/adapter-static`, `@sveltejs/vite-plugin-svelte`, TypeScript, `svelte-check`, Vitest, `@testing-library/svelte`, and `jsdom` to `package.json`; verify `npm install` succeeds.
- [x] 1.2 Create `svelte.config.js` (adapter-static, `fallback: 'index.html'`), `vite.config.ts`, `tsconfig.json`, `src/app.html`, and `src/routes/+layout.ts` with `ssr = false` and `prerender = true`; verify `npm run check` runs clean.
- [x] 1.3 Add `dev`, `build`, `preview`, `test`, and `check` scripts to `package.json`; verify `npm run dev` serves an empty shell and `npm run build` emits a `build/` directory.
- [x] 1.4 Configure Vitest with a jsdom environment and add one trivial passing component test; verify `npm run test` runs it green.

## 2. Global tokens and scoped-CSS base

- [x] 2.1 Create one global stylesheet holding the CSS-variable tokens (light and dark under `prefers-color-scheme`) and the shared component styles (`.time-pill`, `.rail-track`, `.check-row`), imported by `src/routes/+layout.svelte`; verify the tokens resolve in the running app.
- [x] 2.2 Reproduce the Tailwind base styles the app relies on (`box-sizing: border-box`, element margin resets) in the global stylesheet; verify no layout shift against the React build for the shell frame.
- [x] 2.3 Add self-hosted `@fontsource` font imports (the weights the design uses); verify the built output requests fonts only from its own origin.

## 3. Typed crawl module

- [x] 3.1 Port `src/data.js` and `src/config.js` into a typed crawl module under `src/lib/` (schedule, venues, scavenger tasks and rules, quick links, map URLs, line); verify `svelte-check` types the module with no errors.

## 4. Port the shell and views (test-first)

- [x] 4.1 Write a failing component test for four-tab navigation (opens on Schedule, tab tap switches view and marks active, scrolls to top), then build the shell and bottom nav to pass it.
- [x] 4.2 Port the Schedule view (ordered timeline, time/tag/title/subtitle, departure marked distinctly from stop) at parity; verify a component test renders every entry in authored order.
- [x] 4.3 Port the Venues view; verify a test asserts each directions link is a Google Maps search URL carrying the venue name, street address, town, and `IL`.
- [x] 4.4 Write failing tests for the checklist (checking a 10-point task shows 10 of 85 and 12%, unchecking lowers the tally, reset clears after confirm and is abandoned on cancel), then port the Tasks view to pass them.
- [x] 4.5 Port the checklist persistence behind the existing global storage key; verify tests cover reload persistence, loading pre-migration `crawl-checks-v1` data, and starting empty when storage is missing, malformed, or throws.
- [x] 4.6 Port the Map view (embedded map frame plus a link to the crawl's viewer URL) and the quick links (open externally in a new tab); verify a test asserts the viewer link target and the quick-link destinations.
- [x] 4.7 Confirm phone-first layout: fixed header and bottom nav, safe-area insets, full-row tap targets, system light/dark with no toggle, and reduced motion honored; verify a test asserts the reduced-motion and dark-mode behavior.

## 5. CSP, headers, and deploy config

- [ ] 5.1 Configure `kit.csp` hash mode in `svelte.config.js` with the script, style, and asset directives, and ensure the `<meta>` policy sits in the head before any script; verify the built `index.html` carries a `<meta>` CSP with a `script-src` hash and no `'unsafe-inline'` in `script-src`.
- [ ] 5.2 Move `_headers` to `static/_headers` carrying only `frame-ancestors 'none'`, HSTS, `nosniff`, and `Referrer-Policy`; verify the built `build/_headers` contains those directives and no `script-src`.
- [ ] 5.3 Update `wrangler.jsonc` to serve `build/` with `not_found_handling: "single-page-application"`; verify a local preview serves the shell with HTTP 200 for an unmatched path and serves a real asset directly.

## 6. Verification and cleanup

- [ ] 6.1 Add a build-output test that runs after a fresh `npm run build` and asserts: the effective script policy allows only `'self'` plus build hashes (folding in `script-src-elem` and the `default-src` fallback) with no `'unsafe-inline'`; every inline `<script>` matches a recomputed hash; the `<meta>` policy precedes executable scripts; no delivered policy adds a disallowed script source; and `build/_headers` is present. Verify the test passes.
- [ ] 6.2 Add a served browser check that the app boots and switches tabs under the delivered policy, and that an unauthorized inline script placed after the `<meta>` policy never runs; verify both assertions pass.
- [ ] 6.3 Run the visual-parity matrix against the current React build (all four views, light and dark, one portrait phone width and one wider width, checklist unchecked and checked); record the exact widths, checked task ids, and React baseline revision, and confirm only intended differences remain.
- [ ] 6.4 Remove React, Tailwind, PostCSS, autoprefixer, and their config files (`src/App.jsx`, `src/main.jsx`, `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `public/_headers`), then verify `npm run check`, `npm run test`, and `npm run build` are all green.
