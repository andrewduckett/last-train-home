# Last Train Home

Mobile-first coordinator app for a suburban Metra bar crawl — Schedule, Map,
Venues, and localStorage-backed Tasks. Built with Vite + React + Tailwind and
compiled to **fully self-hosted static files**, so it serves cleanly under a
strict `Content-Security-Policy` with no `'unsafe-inline'` and no CDN.

## Edit the content

- **Map link / quick links:** `src/config.js` — paste your Google My Maps `mid`
  into `myMapsEmbedUrl` **and** `myMapsAppUrl`. Swap Ventra/Metra URLs if you like.
- **Schedule / venues / tasks data:** `src/data.js`.

## Build

```bash
npm install     # first time only
npm run build   # outputs the deployable site to dist/
```

`npm run dev` runs a local dev server while you edit.

> Note: on npm 10+, the first `npm install` may block esbuild's install script.
> If a build complains esbuild is missing, run `npm rebuild esbuild` once.

## Deploy to Cloudflare Pages

The site is a static build served from GitHub. In the Cloudflare dashboard,
create a **Pages** project connected to the GitHub repo and set:

| Setting | Value |
| --- | --- |
| Framework preset | Vite (or None) |
| Build command | `npm run build` |
| Build output directory | `dist` |

The build Node version is pinned by `.nvmrc` (20). Every push to the production
branch triggers a rebuild and deploy; add your custom domain under the project's
**Custom domains** tab.

> **Keep Rocket Loader OFF** and don't enable Cloudflare Web Analytics'
> auto-injection for this project — both inject inline `<script>` that the
> `script-src 'self'` policy (below) blocks by design. If a beacon ever fails to
> load, that CSP is why.

## Content-Security-Policy

Because JSX and Tailwind are compiled at build time, nothing is generated in the
browser and every script/style/font is same-origin, so the app runs under a
tight policy with **no CDN and no `'unsafe-inline'` scripts**. This is why the
build is shaped the way it is — it's a deliberate posture, not a host
requirement.

The policy and other security headers ship with the build in
[`public/_headers`](public/_headers), which Vite copies to the site root where
Cloudflare Pages applies it:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-src https://www.google.com; frame-ancestors 'none'; base-uri 'none'; object-src 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

Notes:
- **`script-src 'self'`** — no `'unsafe-inline'` needed. This is the win over the
  previous CDN/in-browser-Babel version, and why fonts are self-hosted rather
  than pulled from Google Fonts.
- **`style-src 'self' 'unsafe-inline'`** — the app uses React inline `style`
  attributes for theming. Inline *styles* can't execute code, so this is low-risk;
  removing it would mean refactoring those into classes.
- **`img-src 'self' data:`** — the favicon is an inline SVG data URI.
- **`frame-src https://www.google.com`** — allows the embedded My Maps iframe on
  the Map tab. Drop it if you don't use the map.
- **`frame-ancestors 'none'`** — blocks the site from being iframed (clickjacking).
- **`Strict-Transport-Security`** — safe because Cloudflare terminates TLS for
  every request.

## Legacy

`legacy-singlefile.html` is the earlier single-file (CDN + in-browser Babel)
build, kept for reference. It requires `script-src ... 'unsafe-inline'` and the
CDN hosts allowlisted, which is why we moved to this build.
