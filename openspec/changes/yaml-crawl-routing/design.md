## Context

See proposal.md for the motivation and the delta specs for required behavior. The shell now asks an in-memory provider for cory-trent. That provider validates identity and leaves the definition untouched. The root route is prerendered with client rendering disabled on the server. Cloudflare already serves the app shell for unmatched paths.

## Goals / Non-Goals

**Goals:**

- Keep the provider as the only source boundary seen by the shell.
- Keep the planned event's authored content and order exactly unchanged.
- Make direct links work with the current static build and CSP.

**Non-Goals:**

- Change the schedule model, links model, checklist storage, or theme.
- Publish a crawl directory or ship a second event.
- Add server code or a hosted data source.

## Decisions

### Keep the current record shape in YAML

The seed file will hold top-level identity fields and a nested definition. The definition will keep today's field names and values. This matches the current provider contract and keeps the four views unchanged. The authored title and definition appTitle will both retain the current display title.

A flat file would read more simply, but splitting it into identity and definition would reshape the record at the provider boundary. A new field schema would also pull the generic-itinerary story into this change. We will defer both changes.

### Fetch YAML inside the provider implementation

A YAML loader will fetch a same-origin file from static/crawls using the requested logical id. The shell and views will receive only the existing CrawlResult. The loader will parse YAML with the yaml package and pass the parsed mapping to the current identity validation logic. It will not interpret schedule entries or resolve colors.

The loader will accept only lowercase alphanumeric ids with internal hyphens before constructing a file URL. An unsupported id will return not-found without a fetch. The route will not normalize mixed-case ids. This keeps URLs and file lookup case-sensitive across development and Linux hosting. It also keeps a logical id from becoming path syntax. The requested id remains authoritative even if a file contains an id field.

The loader will map HTTP 404 and a successful text/html response to not-found. The latter is Cloudflare's SPA fallback for a missing file. Invalid YAML syntax will map to invalid. Fetch failures, body-read failures, and other non-success HTTP responses will map to error. Each path will resolve a result without throwing.

Parsing YAML in a route component would expose the file layout to a consumer. Replacing CrawlResult with a fetch response would also make a later hosted source harder to swap. The new loader stays behind getCrawl(id).

### Select ids in routes and reload on selection changes

The shell will accept an id prop and will no longer hardcode cory-trent. The root page will pass one app-level default constant, cory-trent. A dynamic single-segment page will pass its route parameter. Both pages will render the same shell. The dynamic route will opt out of prerendering because the parent layout currently enables it. The existing static adapter fallback will serve direct paths. [SvelteKit documents route-level prerender overrides](https://svelte.dev/docs/kit/page-options) and [SPA fallback routing](https://svelte.dev/docs/kit/single-page-apps).

Each route page will key the shell by its selected id. A changed id will remount the shell, clear its prior result, and return to the Schedule tab. An earlier response can update only the unmounted instance, so it cannot replace the new view. Tab switches will continue to reuse the current result. Reading the URL inside every view would duplicate selection logic and break the existing one-call boundary.

### Check exact migration parity before removing the code seed

A focused test will compare the parsed seed YAML with a frozen copy of the current authored values. It will cover schedule order and text, venues, scavenger content, links, and map URLs. The production code seed can then be removed. The test fixture will stay outside production data loading.

### Validate every authored record during the build

A build gate will enumerate static/crawls and parse every YAML file. It will validate the identity and definition fields that the current views consume. A failure will name the file and field before deployment. This gate replaces the TypeScript checks lost when records move from code to YAML.

The runtime provider will retain its existing boundary. It validates identity and carries the definition unchanged. Later domain resolvers can replace the temporary whole-record build checks with rules that drop individual malformed entries.

Validating only cory-trent would leave the advertised add-a-file workflow unsafe. Validating the definition inside the runtime provider would assign domain meaning to the wrong layer.

### Revalidate stable YAML URLs

The static headers file will set Cache-Control: no-cache for /crawls/*.yaml. Browsers and Cloudflare may store a record, but they must revalidate it before reuse. This lets a redeployment replace event data at the same URL without adding build ids to the provider API.

Hashed YAML filenames would make updates reliable, but an id-to-hash manifest would add another generated source. A query parameter tied to the app build would couple the source path to the deployed bundle. Revalidation keeps the authored path stable.

## Risks / Trade-offs

- A missing YAML request can receive HTML with HTTP 200. → Check the response type before parsing; test this against the SPA fallback behavior.
- A route change can finish an older fetch after a newer one. → Key the shell by id so the older instance cannot paint over the new view.
- A hand-edited YAML file can contain valid identity but malformed definition fields. → Keep the current provider contract; domain resolvers own field meaning in later stories.
- A YAML file adds one network request after the app shell loads. → Keep the record small and same-origin; the static host can cache it.
- A new YAML record loses TypeScript's compile-time checks. → Validate every authored record as part of the build.
- A stable YAML URL can remain stale after redeployment. → Require cache revalidation for the crawl asset path.
- A partial deployment can serve the new shell before its YAML asset. → Show the existing not-found state and publish code and static assets in one deployment.

## Migration Plan

1. Add tests for source outcomes, safe ids, direct routes, route changes, cache headers, all-record validation, and seed parity.
2. Author cory-trent.yaml by copying the current planned event without changing values or order.
3. Add the YAML loader and route selection. Remove the production code seed after parity passes.
4. Run the test suite, type check, static build, and a built-output CSP check.
5. Verify root and direct paths against the static host fallback. Roll back the deployment if either path fails.
