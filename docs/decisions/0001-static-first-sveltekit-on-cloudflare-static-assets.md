# 0001. Static-first SvelteKit on Cloudflare static assets

- Status: accepted
- Date: 2026-09-20
- Supersedes: none
- Superseded by: none

## Context

Last Train Home renders themed, timed outings — "crawls" — from hand-edited data files. It must stay static this release: no backend, no server state, data loaded from files. A later phase may add a hosted database, accounts, and cross-device sync, and we do not want this choice to block that move.

The question this decision settles is whether pages can ever be computed on a server or at the edge. A client-only single-page app cannot. Reaching that ability later would mean adopting a server framework, which changes routing and the build. A framework that supports both static output and server rendering avoids that later change, at the cost of more setup now.

We are also migrating off a working React single-page app. This is the first step, so every later feature builds on the framework we pick here.

## Decision

We use SvelteKit built with `adapter-static`. This release runs fully static. The shell is prerendered, the client renders the app (`ssr = false`), an SPA fallback serves clean paths, and there is no server code. Cloudflare static assets serve the fallback shell with HTTP 200 for any path that matches no file.

We chose this over a plain Svelte app with a small client-side router. The plain app is lighter to set up, but it cannot render on a server. Adding server or edge rendering later would force a framework change; SvelteKit does not. To add a server route later, we swap the adapter to a server adapter on the same framework and deploy target.

The adapter swap keeps the framework, but it is not the whole job. Routes that need server rendering must drop `ssr = false`, and any browser-only code — such as reading device storage — must move behind a guard. So the framework choice carries forward for free; specific rendering changes still need their own work.

## Consequences

- Moving some pages to server or edge rendering later needs no framework change — an adapter swap plus the work on the routes that change.
- We accept more setup now than a minimal router would need, in exchange for removing that later framework migration.
- The site stays cheap and simple while static: no server code, no functions, no server state.
- Client rendering shows a brief loading state on first paint. This is acceptable for a phone-first tool and can be softened later.
- The SPA fallback lands now, so adding per-crawl paths later needs no change to how the site is served.
