## 1. Generic schedule

- [ ] 1.1 Write failing tests for stop, move, and note entries, fallback tags, visual distinctions, free-text modes, optional notes, and malformed entries; verify the focused tests fail for the current schedule view.
- [ ] 1.2 Add the generic schedule types and resolver, then render the new timeline and empty-state message; verify the focused tests pass and a malformed entry leaves valid siblings visible.

## 2. Authored links and map

- [ ] 2.1 Write failing tests for HTTP and HTTPS links, exact Google map origins, embed and viewer roles, non-default ports, and unsafe URLs; verify the focused URL tests fail first.
- [ ] 2.2 Add the shared URL policy and link and map resolvers; verify URL tests pass and malformed containers resolve without throwing.
- [ ] 2.3 Write failing Schedule view tests for zero, one, and at least three links on a phone, plus a missing-label link; render authored cards and verify labels, hints, hrefs, order, new-tab attributes, and no horizontal overflow.
- [ ] 2.4 Write failing Map view tests for configured URLs and missing or invalid maps; render the map or unavailable message and verify no unsafe frame or viewer link appears.

## 3. Authored record and publication checks

- [ ] 3.1 Write failing build-validation tests for generic schedule fields, empty links, map URL roles, non-default ports, and missing containers; update validation and verify each failure identifies the record and field.
- [ ] 3.2 Migrate `cory-trent.yaml` and the seed fixture to the new schedule, links, and map fields; verify the seed parity tests preserve wording, times, destinations, and order.
- [ ] 3.3 Update provider and shell fixtures for the new definition shape; verify the provider still carries the definition unchanged and the shell keeps other tabs usable when itinerary data is malformed.

## 4. Integration

- [ ] 4.1 Run `npm test`, `npm run check`, `npm run validate:crawls`, and `npm run build`; verify all pass and the built CSP still permits only the supported Google map frame origin.
