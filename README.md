# Last Train Home

Mobile-first coordinator app for timed outings, with Schedule, Map, Venues,
and localStorage-backed Tasks. SvelteKit builds the app as fully self-hosted
static files under a strict Content Security Policy with no inline scripts.

## Edit the content

Each crawl is one file under `static/crawls/`. Copy
`static/crawls/cory-trent.yaml`, give the copy a lowercase hyphenated filename,
and edit its title, schedule, venues, tasks, links, and map URLs. The filename is
the crawl's URL id: `static/crawls/evening-out.yaml` loads at `/evening-out`.

`npm run build` validates every crawl before producing deployable files.

## Build

```bash
npm install     # first time only
npm run build   # outputs the deployable site to build/
```

`npm run dev` runs a local dev server while you edit.

> Note: on npm 10+, the first `npm install` may block esbuild's install script.
> If a build complains esbuild is missing, run `npm rebuild esbuild` once.

## Deploy to Cloudflare

The site deploys as Cloudflare static assets. `wrangler.jsonc` points Cloudflare
at `build/` and serves `index.html` as the SPA fallback for direct crawl URLs.

Run `npm run build`, then deploy with Wrangler. The build Node version is pinned
by `.nvmrc`.

> **Keep Rocket Loader OFF** and don't enable Cloudflare Web Analytics'
> auto-injection for this project — both inject inline `<script>` that the
> `script-src 'self'` policy (below) blocks by design. If a beacon ever fails to
> load, that CSP is why.

## Content-Security-Policy

Every script, style, and font is same-origin. The app runs under a strict policy
with no CDN and no `'unsafe-inline'` scripts. This is a deliberate security
posture, not a host requirement.

SvelteKit writes the script policy and its build-time bootstrap hash into the
HTML. [`static/_headers`](static/_headers) supplies the header-only
`frame-ancestors` directive and the other security headers. The build copies it
to the site root for Cloudflare:

```
/*
  Content-Security-Policy: frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

Notes:
- **`script-src 'self'`** — no `'unsafe-inline'` needed. This is the win over the
  previous CDN/in-browser-Babel version, and why fonts are self-hosted rather
  than pulled from Google Fonts.
- **`style-src 'self' 'unsafe-inline'`** — the UI uses inline style attributes.
  Inline styles cannot execute scripts.
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
