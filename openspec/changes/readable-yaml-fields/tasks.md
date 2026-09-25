## 1. Build validation (test-first)

- [x] 1.1 Move the inline test data to the new keys: `validSource` in `src/lib/data/validate.test.ts` and the fixture in `src/lib/data/validate-generic.test.ts`. Update the field paths in the wrong-type table to `places[0].address`, `scavenger[0].title`, and `scavenger[0].description`, and add `places[0].name` and `scavenger[0].points`. Update the duplicate-place and points-total tests to expect `places.name` and `scavenger.points`. Verify that these tests fail against the current validator.
- [x] 1.2 Add failing tests in `validate.test.ts` for each retired key: `n` and `a` on a place, and `t`, `p`, and `d` on a task. Each test expects the error to name the file, the old field path, and `renamed to <new key>`. Verify that the tests fail for the right reason.
- [x] 1.3 In `src/lib/data/validate.js`, add the retired-key tables from the design and check them before each place and task. Validate `name`, `address`, `title`, `points`, and `description`, and rename the two error labels. Verify that all `validate*.test.ts` tests pass. Commit as `feat:`.

## 2. Seed data

- [x] 2.0 Restore a green baseline. Commit `e5103fe` changed the seed `appTitle` on `main` without updating `tests/fixtures/cory-trent.json`, so `yaml-seed.test.ts` and `seed.test.ts` failed before this change. Sync the fixture's `appTitle`, and drop the parity assertion that pins the old title, since the retitle was deliberate. Verify that `npm test` passes. Commit as `test:`.
- [x] 2.1 Rename the keys in `static/crawls/cory-trent.yaml` (4 places, 7 tasks) and in `tests/fixtures/cory-trent.json`. Leave every value and task `id` unchanged. Verify with `npm run validate:crawls` and `npx vitest run src/lib/data/yaml-seed.test.ts src/lib/data/seed.test.ts`. Commit as `feat:`.
- [x] 2.2 Leave `tests/fixtures/cory-trent-before.json` unchanged. In `src/lib/Shell.parity.test.ts`, map each old place and task to the new keys before comparing with the seed, and read rendered text from the new fields. Verify that the venue and task parity tests fail until the views change.

## 3. Types and views

- [x] 3.1 Rename the fields of `VenuePlace` and `ScavengerTask` in `src/lib/types.ts`. Update `VenuesView.svelte` (keyed list, name, address, directions link) and `TasksView.svelte` (total, earned, title, description, points). Verify that `npm run check` passes.
- [x] 3.2 Update `src/lib/VenuesView.test.ts` and `src/lib/Shell.provider.test.ts` to the new keys. Verify that these tests and `Shell.parity.test.ts` pass. Commit as `refactor:`.
- [x] 3.3 Add a test in `src/lib/Shell.checks.test.ts` that saves checks for two seed task ids under the `cory-trent` crawl, opens Tasks, and finds those two rows checked with the matching earned points. Verify that it passes. Commit as `test:`.

## 4. Docs

- [x] 4.1 In `openspec/discovery.md`, update the Author's "pain today" note and the journey step that cite #15, so neither says the keys are one-letter. Commit as `docs:`.

## 5. Verify

- [ ] 5.1 Run `npm test`, `npm run check`, and `npm run build`, and confirm all three pass.
- [ ] 5.2 Search `src/`, `static/`, and `tests/fixtures/` for the retired keys with `rg -n "\b(n|a|t|p|d):|\.(n|a|t|p|d)\b|\"(n|a|t|p|d)\":"`. Confirm that the only hits are the retired-key tables, their tests, `cory-trent-before.json`, and unrelated code such as `palette.test.ts`.
- [ ] 5.3 Run `npm run preview` and open Venues and Tasks for `cory-trent` at phone width. Confirm that names, addresses, directions links, task text, points, and the 85-point total look as before.
