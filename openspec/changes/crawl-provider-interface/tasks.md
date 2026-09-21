## 1. Define the provider contract

- [x] 1.1 Move the existing data types into `src/lib/types.ts`; add `CrawlIdentity`, `CrawlDefinition`, `Crawl`, and the four `CrawlResult` variants from the design. Preserve every existing definition field and subtype; verify `npm run check` and the existing component tests pass.
- [x] 1.2 Add `CrawlProvider` and its factory in `src/lib/data/provider.ts`, with an injected retrieval function. Work test-first: verify the real factory returns a promise containing `found` for an available record and sets the **crawl** id from the requested **logical id**.
- [x] 1.3 Make the **provider** return `not-found` when retrieval returns `undefined`. Write the failing test first; verify the resolved result carries the requested id.
- [x] 1.4 Make the provider convert exceptions during retrieval or validation to `error`. Write failing tests against the real factory first; verify the call never throws and its promise resolves with the requested id rather than rejecting.

## 2. Validate identity and preserve the definition

- [x] 2.1 Require a string `title` in the **identity**. Work test-first through missing and non-string titles, including `null`; verify each resolves to `invalid` with the requested id.
- [x] 2.2 Add regression tests for empty and whitespace titles. Verify each authored string survives in the `found` result unchanged; correct any failure without adding length checks or trimming.
- [x] 2.3 Validate optional `date` and `color` by type alone. Work test-first through absent fields, strings, and present non-string values, including `null` and `undefined`; verify absent fields and strings are accepted while present non-strings resolve to `invalid`.
- [x] 2.4 Add regression tests for uninterpreted date and color strings. Verify an unrecognized color and a non-date string survive unchanged; correct any failure without adding interpretation or palette resolution.
- [x] 2.5 Carry the **definition** through unchanged, without validating its contents. Write failing tests first; verify every source field is preserved and valid identity still resolves to `found` when the scavenger list is `null`.
- [x] 2.6 Wrap today's record as the sole production crawl, keyed by `cory-trent`, with identity `title` equal to `definition.appTitle`. Capture today's values in test expectations before changing the record; verify the production provider preserves them and other ids, including `constructor` and `toString`, resolve to `not-found`.

## 3. Render through the shell

- [x] 3.1 Make `Shell.svelte` call `getCrawl('cory-trent')` once on mount and pass the found crawl to all four views as a typed prop. First add failing tests using content different from the seed, with identity `title` distinct from `definition.appTitle`; verify the header uses the definition. Adapt direct view tests to pass props and shell tests, including `tests/csp-browser.test.ts`, to await resolution; verify the navigation and view tests pass.
- [x] 3.2 Show a loading state while the provider promise is pending. Write a failing test with a controllable promise first; verify no view mounts before it resolves and the Schedule view appears after a `found` result.
- [x] 3.3 Show a fallback for each of `not-found`, `invalid`, and `error`. Write failing tests for each result first; verify a message appears and none of the four views mounts.
- [x] 3.4 Add a regression test for keeping the resolved crawl across tab switches. Navigate through all four tabs and back, then verify the provider received exactly one call with `cory-trent`.

## 4. Verify content and behavior parity

- [x] 4.1 Verify the default Schedule tab through the real production provider: assert the seed `appTitle`, route line, schedule entries in authored order, and quick-link destinations. Add missing assertions before correcting any integration gaps.
- [x] 4.2 Verify the Venues tab after navigation: assert every seed venue's name, address, and directions destination. Add missing assertions before correcting any integration gaps.
- [ ] 4.3 Verify the Tasks tab after navigation: assert every seed task's label and points, the scavenger rules, and that the seed's placeholder album link is hidden. Verify a configured album link with a separate fixture. Keep tally, reset, and persistence tests passing with the existing `crawl-checks-v1` storage key.
- [ ] 4.4 Verify the Map tab after navigation: assert the iframe `src` and viewer link `href` match the seed definition. Add missing assertions before correcting any integration gaps.
- [ ] 4.5 Verify the retrieval boundary with a source inspection: the shell imports only the provider for retrieval; views receive props and import neither source data nor the provider. Confirm no YAML, routing, state-key, palette, dependency, or deployment changes entered this refactor.
- [ ] 4.6 Run `npm run check`, `npm run build`, then `npm test` so the CSP tests inspect a fresh build; verify all succeed. Preview the built app at phone width and confirm the four tabs retain their layout and behavior.
