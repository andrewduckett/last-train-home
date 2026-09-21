## Why

Last Train Home must grow into a renderer for many crawls, but it runs on React 18 + Vite + Tailwind. Every later story — provider, YAML routing, per-crawl state, theming — builds on the framework and the strict Content Security Policy (CSP). We move to SvelteKit first, at visual parity, so the framework and the CSP are settled before anything depends on them.

The CSP is the hardest part. The site serves `script-src 'self'` with no `'unsafe-inline'`, so an inline script runs only when the build authorizes it by hash. SvelteKit prerenders its shell with an inline bootstrap script. This story must authorize the framework's inline scripts by hash and prove the result on the built output.

## What Changes

- Replace React + Vite with SvelteKit + `adapter-static`: a prerendered shell, `ssr = false`, and an SPA fallback shell for unmatched paths. The site still ships no server code.
- Port the four-tab shell and all four views (Schedule, Map, Venues, Tasks) to Svelte 5 components at visual parity with the current app.
- Convert styling from Tailwind utilities to native Svelte scoped CSS. Remove Tailwind, PostCSS, and autoprefixer. This resolves discovery Open Question 4 (Tailwind vs. scoped CSS) in favor of scoped CSS, overriding the story packet's tentative "keep Tailwind" default. The cost is a one-time utility-to-CSS rewrite and a parity check; scoped CSS is not required by SvelteKit or by the CSP.
- Authorize SvelteKit's inline bootstrap script by hash, and split the policy: `kit.csp` hashing emits the script, style, and asset directives into each page; `_headers` carries the header-only directives. Prove the built output against the policy.
- Keep the single crawl hardcoded as a typed module. No provider, YAML, routing, per-crawl state, or theming — those are later stories.
- Stand up the target toolchain: TypeScript, Vitest, `@testing-library/svelte`, `svelte-check`, and `npm run test` / `npm run check` scripts.
- Record two architecture decisions: static-first SvelteKit, and the CSP hashing mechanism.

## Capabilities

### New Capabilities

- `crawl-shell`: the four-tab phone screen (Schedule, Map, Venues, Tasks) that renders one crawl's schedule, venues, scavenger checklist, quick links, and map.
- `deployment`: the static build and serving contract — `adapter-static` output, the SPA fallback, the strict CSP proven on the built output, self-hosted fonts, and same-origin assets.

### Modified Capabilities

<!-- None. This is the first change; no specs exist yet. -->

## Impact

- **Framework and build**: `src/main.jsx`, `src/App.jsx`, `index.html`, and `vite.config.js` give way to `svelte.config.js`, `vite.config.ts`, `src/app.html`, `src/routes/+layout.*`, `src/routes/+page.svelte`, and `src/lib/**`.
- **Styling**: `src/index.css` and the inline Tailwind classes move into scoped component `<style>` blocks plus one shared token stylesheet. `tailwind.config.js` and `postcss.config.js` are removed.
- **Data**: `src/data.js` and `src/config.js` port to a typed crawl module under `src/lib/` — still a module, not yet a provider.
- **Dependencies**: remove `react`, `react-dom`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`. Add `@sveltejs/kit`, `svelte`, `@sveltejs/adapter-static`, `@sveltejs/vite-plugin-svelte`, `typescript`, `svelte-check`, `vitest`, `@testing-library/svelte`, `jsdom`.
- **CSP and deploy**: the `_headers` file moves to SvelteKit's static input (`static/_headers`) so the build emits it; `svelte.config.js` carries `kit.csp`. `wrangler.jsonc` gains `not_found_handling: "single-page-application"` for the fallback.
- **Docs**: two new ADRs under `docs/decisions/` record the static-first SvelteKit decision and the CSP hashing mechanism.
