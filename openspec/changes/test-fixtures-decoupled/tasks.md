## 1. Builders and provider helpers

- [x] 1.1 Write `tests/fixtures/crawl-builders.test.ts` first. It checks that `buildRecord()` passes `validateCrawlSource`, that its defaults name no transit agency, that overrides replace only the given fields, and that each call returns a fresh object. Verify it fails.
- [x] 1.2 Add `tests/fixtures/crawl-builders.ts` with `buildDefinition`, `buildRecord`, and the item builders from design D1. Verify 1.1 passes.
- [x] 1.3 Write tests for `recordProvider`, `toCrawlYaml`, and `yamlProvider`: a known id resolves to found with the given content, and an unknown id returns not-found. Verify they fail.
- [x] 1.4 Add `tests/fixtures/crawl-provider.ts` with the three helpers from design D2. Verify 1.3 passes.

## 2. Contract check for authored crawls

- [x] 2.1 Write `tests/authored-crawls.test.ts` first. Against a temporary directory of generated records, it checks that valid records with any content pass, that a new file is found, that a broken record fails and names its file, and that a missing default id fails and names the id. Against `static/crawls`, it checks that the directory passes. Verify it fails.
- [x] 2.2 Add `checkAuthoredCrawls(directory, defaultId)` in `tests/fixtures/authored-crawls.ts`, per design D3. Verify 2.1 passes.
- [x] 2.3 In `tests/static-build.test.ts`, replace the title check with "each authored file appears in `build/crawls/` with identical bytes". Verify with `npm run build` then `npx vitest run tests/static-build.test.ts`.

## 3. Move tests to generated crawls

- [x] 3.1 Rewrite `src/lib/data/seed.test.ts`: keep the missing-id and unsafe-id cases, and serve a generated record as YAML for the production-binding case. Delete `src/lib/data/yaml-seed.test.ts`. Verify both data test files pass or are gone.
- [x] 3.2 Replace the seed case in `src/lib/crawl/richText.test.ts` with a built intro of three paragraphs and one bold phrase. Verify the file passes.
- [x] 3.3 Rewrite `src/lib/Shell.seed-theme.test.ts` to render `/` and `/<id>` for a generated record with a chosen color, served under `defaultCrawl`. Rename it to describe any crawl. Verify it passes.
- [x] 3.4 Move `src/lib/Shell.test.ts` and `src/lib/Shell.layout.test.ts` to `recordProvider` with a generated record. Verify both pass.
- [x] 3.5 Move `src/lib/Shell.checks.test.ts` to generated records. Replace the rename-era case with "saved checks follow task ids after titles change". Verify it passes.
- [x] 3.6 Move `ScheduleView.test.ts`, `PlacesView.test.ts`, and `TasksView.test.ts` to builders. Each test asserts only against values it passed in. Verify all three pass.
- [x] 3.7 In `src/routes/root-route.test.ts`, drop the default-id value check, and assert that `+page.svelte` does not contain the value of `defaultCrawl`. Verify it passes.

## 4. Remove the seed fixtures

- [x] 4.1 Delete `src/lib/Shell.parity.test.ts` and `tests/fixtures/cory-trent-before.json`. Verify `npm test` passes.
- [x] 4.2 Delete `tests/fixtures/cory-trent.json`, `cory-trent.ts`, and `seed-provider.ts`. Verify that no file imports them and that `npm test` and `npm run check` pass.

## 5. Guard against new coupling

- [x] 5.1 Write `tests/test-isolation.test.ts` per design D4. Confirm it fails on a temporary test file that contains `static/crawls` or an authored id, then remove that file. Verify the guard passes on the real tree.

## 6. Verify

- [x] 6.0 Check once, not as a standing test, that no builder default string appears in any authored crawl, so the builders copy no authored content. Record the result in the PR description.
- [x] 6.1 Confirm the theming requirement "Keep shared surfaces consistent across crawls" is covered by the existing test in `src/lib/theme/palette.test.ts`. Record the test name in the PR description.
- [x] 6.2 Temporarily change the title, intro, a link, and the color in `static/crawls/cory-trent.yaml`, then run `npm test`. Verify the suite passes, then restore the file.
- [x] 6.3 Run `npm test`, `npm run check`, and `npm run build`. Verify all three succeed.
