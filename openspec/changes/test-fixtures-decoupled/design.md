## Context

See proposal.md for why. This section covers only what shapes the approach.

The suite couples to the live crawl in two ways:

- **Direct file reads.** Five tests read `static/crawls/cory-trent.yaml` from disk: `seed.test.ts`, `yaml-seed.test.ts`, `richText.test.ts`, `Shell.seed-theme.test.ts`, and `tests/static-build.test.ts` (which reads the built copy).
- **A hand-kept mirror.** `tests/fixtures/cory-trent.json` copies the crawl's definition. `cory-trent.ts` and `seed-provider.ts` wrap it. Nine test files import these wrappers: the Shell, Schedule, Places, and Tasks tests, plus `Shell.parity.test.ts`.

Some tests already build small crawls inline, for example `Shell.theme.test.ts` and `ScheduleView.generic.test.ts`. Each one repeats its own full `CrawlDefinition` literal. The real provider has two layers: `createCrawlProvider(retrieve)` checks identity, and `createYamlCrawlProvider(fetch)` adds retrieval and YAML parsing. Both accept injected inputs, so tests need no global stubs.

## Goals / Non-Goals

**Goals:**

- Give every behavior test one place to get a valid crawl, with invented defaults and per-test overrides.
- Keep the YAML parsing path under test without reading any authored file.
- Make any content edit to a valid authored crawl pass the suite with no test change.
- Stop a later test from quietly reading authored crawls again.

**Non-Goals:**

- Random or property-based data. The builders return the same values on every run.
- Rewriting tests that already use inline data. They may adopt the builders, but this change does not require it.
- Changing the validator, the provider, the schema, or the default crawl id.

## Decisions

### D1. Builders live in one test-only module

`tests/fixtures/crawl-builders.ts` exports small functions: `buildDefinition`, `buildRecord`, and item builders such as `stopEntry`, `moveEntry`, `placeStop`, `location`, `task`, and `link`. Each returns a fresh, valid, JSON-clean object. A test passes a partial object to override only what it asserts on.

- **Defaults are invented and neutral.** One fictional town, made-up names, `example.com` links. No value comes from `cory-trent`, and none names a transit agency. The defaults cover each shape the views branch on: a `stop`, a `move` with a free-text mode, a `note`, a stop with a `Train` and a `Bar` location, a location with no label, and at least two tasks with points.
- **Tests assert against the values they pass in,** or read them back from the built object. A test never hard-codes a default it did not set. So a later change to a default cannot break an unrelated test.
- **Why not static fixture files:** a file is one more fixed dataset that tests then assert against. Builders put each test's data next to its assertions.
- **Why not reuse each test's inline literal:** those literals repeat the full shape. A schema change today needs an edit in every one of them.

### D2. Generated records reach the YAML provider in memory

`tests/fixtures/crawl-provider.ts` exports two helpers:

- `toCrawlYaml(record)` serializes a record with the `yaml` package's stringify.
- `yamlProvider(records)` wraps `createYamlCrawlProvider` with a fake fetch. The fake fetch serves `/crawls/<id>.yaml` from a map of generated records and returns 404 for any other id.

Shell and route tests use `yamlProvider`, so every rendered crawl passes through real parsing and identity checks. Pure view tests (Schedule, Places, Tasks) pass a built `Crawl` straight to the view, as they do today. One test in `seed.test.ts` keeps covering the production `getCrawl` binding: it stubs the global `fetch` to serve a generated record.

- **Why not stub the global `fetch` everywhere:** injection is already supported, it needs no cleanup, and it cannot leak between tests.

### D3. One contract test owns the authored crawls

`tests/authored-crawls.test.ts` finds every `static/crawls/*.yaml` file. For each file it checks two things:

- `validateCrawlSource` accepts the file.
- `createYamlCrawlProvider` resolves the file's logical id to `found` with that id. Its fake fetch reads the file from disk.

It also checks that the configured default id (`defaultCrawl`) has an authored file. The test asserts no title, text, link, place, task, or color value. It replaces `yaml-seed.test.ts`, the seed half of `seed.test.ts`, and the `defaultCrawl` value check in `root-route.test.ts`.

In `tests/static-build.test.ts`, the title check becomes "each authored file appears in `build/crawls/` with identical bytes". That still proves the build publishes the crawls, without naming any content.

### D4. A guard test keeps the coupling from coming back

`tests/test-isolation.test.ts` scans every `*.test.ts` file and every file under `tests/fixtures/`. It fails when a file other than the two contract tests (D3) contains `static/crawls` or `build/crawls`. It also fails when any scanned file contains the string `cory-trent`. The guard skips its own source.

- **Why:** without it, the next test that needs "a real crawl" will likely reach for the live file again. A plain text scan is cheap, and its failure message can name the file and the fix.
- **Limit:** the scan finds literal paths only. It does not catch a path built from string pieces. This is acceptable for a guard aimed at accidental reuse.

### D5. Rewrite or delete each coupled test

| Test | Action |
|---|---|
| `Shell.parity.test.ts`, `tests/fixtures/cory-trent-before.json` | Delete. The migration they guarded has shipped. |
| `tests/fixtures/cory-trent.json`, `cory-trent.ts`, `seed-provider.ts` | Delete after every importer moves to the builders. |
| `data/yaml-seed.test.ts` | Delete. D3 covers it. |
| `data/seed.test.ts` | Keep the unsafe-id and missing-id cases. Serve a generated record for the production-binding case. Drop the intro and links content checks. |
| `crawl/richText.test.ts` | Replace the seed case with a built intro of three paragraphs and one bold phrase. |
| `Shell.seed-theme.test.ts` | Rename to cover any crawl. Render `/` and `/<id>` for a generated `amber` record served under the default id. |
| `Shell.test.ts`, `Shell.layout.test.ts`, `Shell.checks.test.ts` | Use `yamlProvider` with a generated record. The rename-era check becomes "saved checks follow task ids after the titles change". |
| `ScheduleView`, `PlacesView`, `TasksView` tests | Use builders. Assert against the values the test passed in. |
| `routes/root-route.test.ts` | Keep the checks on the `+page.svelte` source. Move the default-id check to D3. |

The new theming requirement ("Keep shared surfaces consistent across crawls") is already covered by `theme/palette.test.ts`, in the test that shares page, board, and success colors across palettes. No new theming test is needed.

### D6. Keep the old scenario names in the delta specs

OpenSpec 1.12 cannot drop one scenario from a MODIFIED requirement. It also rejects a requirement that is removed and re-added under the same name. So the delta specs keep each old scenario name, such as "The seed introduction appears", and rewrite its body with no seed content. The names are slightly dated, but the bodies set the contract.

## Risks / Trade-offs

- **[Risk] Builder defaults drift from what authors write.** → The contract test still runs every real crawl through validation and the provider. The builders only need to produce valid shapes, and `validateCrawlSource` can check that in one builder test.
- **[Risk] Deleting parity loses a regression net for the rendering of real content.** → Each behavior the parity test touched (header, schedule order, places, tasks, links) keeps a test against built data. Only the check that the content matches the old event goes away, and that one was temporary by design.
- **[Trade-off] The guard's `cory-trent` string ban also blocks legitimate mentions** in test names or comments. → That is acceptable. A test that needs the default id imports `defaultCrawl` and never spells it out.
- **[Trade-off] Scenario names keep the word "seed"** (D6). → The bodies are generic. A later spec cleanup can rename them when OpenSpec supports it.

## Migration Plan

This change touches tests and specs only, so it has no deployment step. Implementation runs in this order, keeping the suite green after each step:

1. Add the builders, then the provider helper, each with its own tests.
2. Add the contract test.
3. Move each test file to the builders, one commit per file or group.
4. Delete the old fixtures and the parity test.
5. Add the guard test last, so it passes on arrival.

To roll back, revert the branch. Nothing outside the test tree and the specs changes.
