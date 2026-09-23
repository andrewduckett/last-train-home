## 1. YAML authoring boundary

- [x] 1.1 Add the `yaml` dependency and a shared JSON-clean parser, using failing tests first to verify malformed syntax and unsupported values are rejected.
- [x] 1.2 Add a build-time validator for every file under `static/crawls`, using failing tests first for invalid filename ids, duplicate rendered keys, unusable point totals, and errors that identify the file and field.
- [x] 1.3 Add `static/crawls/cory-trent.yaml`, using a parity test to verify every planned event value and ordered entry matches the existing fixture exactly.
- [x] 1.4 Run the validator before each production build, and verify `npm run build` stops when a crawl fixture is invalid.

## 2. YAML provider

- [x] 2.1 Specify the YAML loader with failing tests for valid ids, unsafe ids, mixed-case ids, HTTP outcomes, body-read failures, HTML fallbacks, and parse failures.
- [x] 2.2 Implement the YAML loader behind `getCrawl(id)`, and verify the provider tests preserve identity checks, named outcomes, and each unchanged definition.
- [x] 2.3 Replace the production code record with the YAML provider, remove obsolete code data sources, and verify cory-trent resolves only through its logical id.

## 3. Crawl routing

- [x] 3.1 Add the app-level `defaultCrawl` setting, and verify the root page passes cory-trent to the shell without a duplicate default.
- [x] 3.2 Change the shell to require an id prop, using failing component tests first to verify it resolves that id once per mount.
- [x] 3.3 Add the client-resolved `/[id]` route and key the shell by id, using route tests to verify direct loads, in-session changes, and stale responses.
- [x] 3.4 Verify unknown, unsafe, and mixed-case direct paths show the existing not-found state without publishing a crawl directory.

## 4. Static delivery

- [x] 4.1 Add `Cache-Control: no-cache` for `/crawls/*.yaml`, and verify a headers test limits the policy to crawl records.
- [x] 4.2 Build the app and verify the output contains the SPA fallback, `cory-trent.yaml`, security headers, and no server entry point.
- [x] 4.3 Run the built-output CSP test and verify every inline script remains hash-authorized without `unsafe-inline` in `script-src`.

## 5. Final verification

- [x] 5.1 Run `npm test`, `npm run check`, `npm run build`, and `openspec validate yaml-crawl-routing --strict`; record that all four commands pass.
- [x] 5.2 Serve the production output and verify both `/` and `/cory-trent` render the unchanged crawl while an unknown id shows the fallback state.
