## Context

See `proposal.md` — Why. Today the app is React 18 + Vite + Tailwind. One `App.jsx` holds four views, a `useChecks` localStorage hook, and the tab shell. `data.js` holds one hardcoded event. `config.js` holds the map and link URLs. `index.css` holds CSS-variable tokens and component styles. The strict CSP ships from `public/_headers`, and the deploy is Cloudflare static assets via `wrangler.jsonc`.

Two constraints shape the approach. First, `script-src` is `'self'` with no `'unsafe-inline'`, so no inline script runs unless the build authorizes it by hash. Second, the site ships no server code, so the policy must be decided at build time and travel inside the built files. The sibling `../hero-slate` set the `adapter-static` pattern we copy, but it ships no CSP, so the CSP work here is new.

## Goals / Non-Goals

**Goals:**

- Re-platform to SvelteKit `adapter-static` at visual parity, checked against a fixed parity matrix.
- Authorize SvelteKit's inline bootstrap script by hash under `script-src 'self'`, and prove it on the built output.
- Convert styling to native Svelte scoped CSS, remove Tailwind, and keep color resolving through the existing tokens.
- Stand up the target toolchain: TypeScript, Vitest, `@testing-library/svelte`, `svelte-check`.

**Non-Goals (design-level):**

- No `getCrawl(id)` provider, YAML loading, `/<id>` routing, or default-crawl concept (stories 2–3).
- No per-crawl checklist isolation — the single global localStorage key stays (story 4).
- No palette generation, per-crawl theming, or generic-itinerary schema change (stories 5–6).
- No nonce CSP (a nonce needs a per-request server; this build is prerendered) and no Tailwind v4 upgrade.

## Decisions

### Decision 1: `adapter-static`, client-rendered, with an SPA fallback

Use `@sveltejs/adapter-static` with `fallback: 'index.html'`. Set `ssr = false` and `prerender = true` in `src/routes/+layout.ts`, mirroring `../hero-slate`. The one route is `src/routes/+page.svelte`, which renders the ported shell. Update `wrangler.jsonc` with `not_found_handling: "single-page-application"`, and point `assets.directory` at the adapter's `build/` output.

*Output strategy (resolves the fallback/prerender overlap):* with `ssr = false`, the prerendered `/` page carries no server-baked data, so it is the same client-only shell as the SPA fallback. Story 1 has only `/`, so the build emits one `index.html` that serves both direct loads of `/` and the fallback for unmatched paths. During the build we confirm which step writes that final `index.html` and that it boots at `/`, since matching content is what matters, not merely the absence of server data. We verify the CSP hash on the shipped file. Receiving fallback HTML at an unknown path is not the same as rendering a crawl there — per-path crawls arrive in story 3.

*Why:* this is the sibling's proven static-first shape and the stated target. Client rendering keeps the running site a plain static app. Setting up the fallback now lets story 3 add `/<id>` without re-touching the deploy.

*Alternative considered:* a plain Svelte app with a hand-rolled router — lighter now, but it cannot render on a server later without a framework change. Rejected per the "swap the adapter, not the framework" constraint.

### Decision 2: authorize the bootstrap script by hash; split the policy by directive

Define the script, style, and asset directives in `svelte.config.js` under `kit.csp` with `mode: 'hash'`. SvelteKit computes a hash for its inline bootstrap script and writes a `<meta http-equiv="content-security-policy">` into each prerendered page, including the fallback. Place that `<meta>` in the document `<head>` before any script, so the policy is in force when scripts load.

Keep `_headers` for the directives a `<meta>` tag cannot express — `frame-ancestors 'none'` — plus the non-CSP security headers (HSTS, `nosniff`, `Referrer-Policy`). Move the file to SvelteKit's static input at `static/_headers` so the build copies it into `build/`. SvelteKit does not copy the old React `public/` directory, so leaving the file there would ship a build with no security headers.

Keep `script-src` out of the HTTP header. The browser enforces every delivered policy together, blocking a script unless *every* policy authorizes it. A header that named `script-src 'self'` without the build hash would therefore re-block the hashed inline script. Splitting the two sources by directive lets them compose: the `<meta>` policy authorizes scripts by hash, and the header adds only `frame-ancestors`.

```
  kit.csp -> <meta>            default-src 'self'; script-src 'self' 'sha256-<bootstrap>';
  (per build, in the HTML)     style-src 'self' 'unsafe-inline'; img-src 'self' data:;
                               font-src 'self'; frame-src https://www.google.com;
                               base-uri 'none'; object-src 'none'
  static/_headers -> header    Content-Security-Policy: frame-ancestors 'none'
                               + Strict-Transport-Security, X-Content-Type-Options,
                                 Referrer-Policy
```

*Contract, stated precisely:* `script-src` has no `'unsafe-inline'`. An inline script runs only when a same-build hash authorizes it. An external script must be same-origin. The claim has limits. The policy stops an injected inline script, whose hash differs, and any cross-origin script. It does not stop a same-origin script, which `'self'` allows. It does not cover content the browser parses before the `<meta>` tag, which is why that tag comes first.

*Style note:* `style-src` keeps `'unsafe-inline'`. The posture protects scripts; the ported components still set token-driven color through inline `style="..."`, exactly as today.

*Alternatives considered:* (a) a per-request nonce — impossible without a server; (b) a single hand-maintained header CSP carrying the script hash — brittle, since the hash changes each build and a stale value breaks the site; (c) generating the whole `_headers` policy, hash included, from the final build output — this restores header-level enforcement but adds a build step that re-reads and re-hashes the emitted HTML. We chose `kit.csp` hashing because SvelteKit already owns the hash and injects it, so nothing external can drift. Revisit (c) if a header-delivered policy becomes a requirement.

### Decision 3: Tailwind → native Svelte scoped CSS

Remove `tailwindcss`, `postcss`, and `autoprefixer`. Move layout, spacing, and typography from Tailwind utilities into each component's scoped `<style>` block. Keep the CSS-variable tokens (`--accent`, `--surface`, and the rest) and the shared component styles (`.time-pill`, `.rail-track`, `.check-row`) in one global stylesheet the root layout imports.

Reproduce the Tailwind base styles the app relies on — chiefly `box-sizing: border-box` and element margin resets — in that global stylesheet, since removing Tailwind also removes its preflight.

*Color handling, stated accurately:* the app today mixes token colors (`var(--accent)`) with literal colors (for example `#F2A93B`, `#fff`, and `rgba(...)` in `App.jsx` and `index.css`). This story ports both forms as-is, preserving their exact values; token colors stay on tokens and literal colors stay literal. Turning literal colors into palette tokens is story 6's work, not this one.

*Cost, stated plainly:* this adds a one-time rewrite of every Tailwind utility into scoped CSS, plus the parity check in Decision 5. We accept that cost for three reasons. The app is small, so the rewrite is short. Scoped CSS is the sibling's idiom and a clean base for the theming story. And the CSP work does not depend on the styling idiom either way.

*Alternative considered:* keep Tailwind through the port. It avoids the rewrite, but it ships a mixed styling model (utilities, inline color styles, and component CSS) and leaves a later story to remove Tailwind for little saving.

### Decision 4: keep the crawl hardcoded as a typed module

Port `data.js` and `config.js` into a typed module under `src/lib/` that the shell imports directly. No provider interface, no runtime fetch.

*Why:* the provider seam is story 2's whole point. Adding it here would blur two stories. A direct import preserves today's behavior and keeps this story a pure re-platform.

### Decision 5: prove the CSP and parity, not just configure them

Add a build-output test that runs after a fresh `npm run build` and asserts:

1. The effective script policy allows only `'self'` and the build hashes, and no `'unsafe-inline'`. Check the effective value, not just a literal `script-src`: fold in `script-src-elem` and the `default-src` fallback, so a permissive override or an inherited directive cannot slip through.
2. Every inline `<script>` in the shipped `index.html` matches a hash the policy lists. Recompute each hash from the script's bytes rather than trusting the attribute.
3. The `<meta>` policy appears in the head before any executable script.
4. No delivered policy — `<meta>` or `_headers` — adds a script source the contract disallows, across all script directives, not only a named `script-src`.
5. The emitted `build/` directory contains `_headers` with the header-only directives.

Add a browser-level check that serves the built shell the way production does, so the emitted `_headers` apply. Confirm the app boots and switches tabs, proving no real script was blocked. Then insert an inline script whose hash is not authorized, after the policy's `<meta>` tag, and confirm it never runs. Add component tests with `@testing-library/svelte` for tab switching and checklist toggling.

Verify visual parity against the current React build across a fixed matrix: all four views, light and dark, one portrait phone width and one wider width, and the checklist in unchecked and checked states. Record the exact widths, the checked task ids, and the React baseline revision before the port begins, so the comparison is reproducible. Treat only intended differences as acceptable and record them.

*Why:* the deployment spec requires the CSP be proven on the built output. A fresh-build test is the durable guard that a later change cannot silently ship a blocked or unhashed inline script, or drop the header file.

## Risks / Trade-offs

- **The `_headers` file is dropped from the build** → put it in `static/_headers`, and let the build-output test fail when `build/_headers` is missing. If Cloudflare stops honoring `_headers` for static assets, move the header-only directives into `wrangler.jsonc` asset headers — still no server code.
- **A SvelteKit or adapter upgrade changes the bootstrap script's bytes** → `kit.csp` hash mode regenerates the hash from those bytes, so no hand-maintained value goes stale; the build-output test recomputes hashes to confirm.
- **Scoped-CSS conversion drifts from pixel parity** → check against the parity matrix in Decision 5 before merge, and reproduce Tailwind's preflight resets explicitly.
- **`ssr = false` shows a brief loading state on first paint** → acceptable for a phone-first tool; the shell is small and same-origin.

## Migration Plan

1. Scaffold SvelteKit on a branch: `svelte.config.js`, `vite.config.ts`, `src/app.html`, `src/routes/+layout.*`, `src/routes/+page.svelte`, `src/lib/**`, `tsconfig.json`.
2. Port the token stylesheet and component styles, then the four views and the shell, to Svelte 5 at parity.
3. Wire `kit.csp` hash mode, move and split `static/_headers`, and update `wrangler.jsonc`.
4. Add the toolchain and tests; run `npm run check`, `npm run test`, and `npm run build`, then run the build-output CSP test and the parity matrix.
5. Remove React, Tailwind, and their config once parity is confirmed.

**Rollback:** the work lives on one branch and merges only when parity and the build are green, so rollback is closing the branch. `main` keeps the working React app throughout.
