## Why

The app can render only its in-repo event at `/`. An organizer cannot add a crawl as data or share a direct link to it. This change makes each crawl a YAML record addressed by a stable logical id.

## What Changes

- Load crawl records from YAML through `getCrawl(id)`.
- Validate every authored YAML record during the build before it can be published.
- Move the current event to `cory-trent.yaml`, preserving its times, stop order, wording, venues, tasks, links, and map URLs exactly.
- Render an available crawl at `/<id>` and the configured default, `cory-trent`, at `/`.
- Pass the route-selected logical id into the shell instead of hardcoding it there.
- Show the existing loading and failure states when a crawl is missing, invalid, or unavailable, including when the host returns its app shell for a missing YAML file.
- Revalidate YAML records on each request so a redeployment does not leave stale event data in browser or edge caches.
- Keep crawls reachable by direct link without adding a public crawl list.

## Capabilities

### New Capabilities

- `crawl-routing`: Select a crawl from a direct URL or the app's default logical id.
- `crawl-authoring`: Reject authored YAML records that the current app cannot render before deployment.

### Modified Capabilities

- `crawl-provider`: Resolve YAML records by logical id while retaining the four result outcomes and identity checks.
- `crawl-shell`: Receive the selected logical id, resolve it for each route change, and render that crawl across all four views.
- `deployment`: Require revalidation for stable YAML asset URLs while keeping the existing static build and SPA fallback.

## Impact

This change affects the provider, SvelteKit routes, shell input, build validation, response headers, app-level default setting, and static crawl files. It adds the `yaml` package. Cloudflare's existing SPA fallback continues to serve clean paths. Checklist storage, schedule shape, and theming remain in their later stories.
