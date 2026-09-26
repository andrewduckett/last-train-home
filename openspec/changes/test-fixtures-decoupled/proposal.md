## Why

Every content edit to `static/crawls/cory-trent.yaml` breaks the test suite. The tests use that live crawl as their test data, and five spec requirements pin its content. An author cannot change a title, a link, or a stop without a follow-up "sync the fixture" commit. This blocks the product promise that a crawl is data, not code. It will also block #16, which adds a second crawl.

## What Changes

- Add builder functions under `tests/fixtures/` that generate made-up crawls in the `CrawlDefinition` shape. Each builder returns valid, invented defaults, and a test overrides only the fields it checks. No generated value comes from `cory-trent`.
- Let the builders serialize a crawl to YAML in memory, so tests still exercise the provider and parser path without reading a file.
- Move every behavior test (schedule, places, tasks, checklist, theme, rich text, provider) to generated crawls.
- Replace content snapshots of the real crawl with one contract test. It runs over every `static/crawls/*.yaml` file and checks only that each file is valid and resolves through the provider.
- Remove the migration parity check. **BREAKING** (tests only): delete `src/lib/Shell.parity.test.ts`, `tests/fixtures/cory-trent-before.json`, `tests/fixtures/cory-trent.json`, `tests/fixtures/cory-trent.ts`, and `tests/fixtures/seed-provider.ts`.
- Remove or restate the spec requirements and scenarios that pin `cory-trent` content, so that each one describes app behavior for any crawl.

The app's runtime behavior does not change. The crawl schema, the validator rules, and the default crawl id (`cory-trent`) stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `crawl-provider`: remove "Preserve the planned seed crawl". The migration it guarded has shipped. Keep "Expose the in-repo crawl by its id", but check it against any authored record, not the seed's content.
- `crawl-theming`: remove "Preserve the first crawl's accent" (`cory-trent` SHALL select `amber`). The color is an authoring choice. "Resolve an authored color to a crawl palette" already covers the behavior.
- `crawl-shell`: restate the "seed keeps its Google searches" and "seed shows its stations" scenarios so they describe any crawl with those location kinds.
- `crawl-authoring`: restate "The seed has no album destination" so it describes any crawl without an album link. Add a requirement that every authored crawl passes a content-independent contract check. That check is the only way tests touch authored crawls.

## Impact

- **Tests:** most files under `src/lib/**/*.test.ts` that import the seed fixture, plus `src/lib/data/seed.test.ts`, `src/lib/data/yaml-seed.test.ts`, `src/lib/crawl/richText.test.ts`, and `tests/static-build.test.ts`.
- **Fixtures:** new builder module in `tests/fixtures/`. Four seed fixture files and one test file are deleted.
- **Specs:** `crawl-provider`, `crawl-theming`, `crawl-shell`, and `crawl-authoring` get delta specs.
- **App code, dependencies, build, deployment:** no change. The change adds no new package.
- **Authoring:** after this change, editing any `static/crawls/*.yaml` file needs no test change, as long as the file stays valid.
