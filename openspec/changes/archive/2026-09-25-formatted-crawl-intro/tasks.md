## 1. Restore a green baseline

- [x] 1.1 Update the `intro` in `tests/fixtures/cory-trent.json` and the expected intro in `src/lib/data/seed.test.ts` to match the current seed YAML. Verify that `npx vitest run src/lib/data/seed.test.ts` passes. Commit as `test:`.

## 2. Parser (test-first)

- [x] 2.1 Write failing unit tests in `src/lib/crawl/richText.test.ts` for paragraphs and line breaks. Cover blank lines, whitespace-only lines, single line breaks, `\r\n`, trailing whitespace, and leading or trailing blank lines. Verify that the tests fail for the right reason.
- [x] 2.2 Implement paragraph and line splitting in `src/lib/crawl/richText.ts`, following the design's parsing steps 1–3. Verify that the 2.1 tests pass. Commit as `feat:`.
- [x] 2.3 Write failing unit tests for marker pairing. Cover every row of the design's worked examples, plus `**bold**`, `*italic*`, `**a *b* c**`, `**bold***`, `****text****`, unmatched `**` and `*`, and markers split across two lines. Verify that the tests fail for the right reason.
- [x] 2.4 Implement marker pairing and flat-run flags, following the design's "Pairing markers" section. Verify that all `richText` tests pass. Commit as `feat:`.
- [x] 2.5 Add a test that parses the seed intro from `static/crawls/cory-trent.yaml`. It expects three paragraphs, with "Don't forget" as one bold run. Verify that it passes. Commit as `test:`.

## 3. Info view

- [x] 3.1 Write failing tests in `src/lib/InfoView.test.ts` for the rendered DOM. Expect one `<p>` per paragraph, `<br>` between lines, `<strong>` and `<em>` for runs, and no literal asterisks around formatted text. Keep the existing test that shows `<strong>` HTML as literal text. Verify that the new tests fail.
- [x] 3.2 Render `parseRichText` output in `src/lib/InfoView.svelte` with `{#each}` blocks, Svelte text nodes, and no `{@html}`. Keep the intro card styling on a wrapper around the paragraphs. Verify that the `InfoView` tests pass. Commit as `feat:`.
- [x] 3.3 Confirm that `src/lib/Shell.info.test.ts` and `src/lib/CrawlRoute.test.ts` still pass without changes. Unusable intros must still hide the Info tab.

## 4. Verify

- [x] 4.1 Run `npm test`, `npm run check`, and `npm run build`, and confirm all three pass.
- [x] 4.2 Confirm that `src/` contains no `{@html}` and that `static/_headers` and the CSP config are unchanged, using `git diff main -- static/_headers svelte.config.js`.
- [x] 4.3 Run the app with `npm run preview` and open Info for `cory-trent` at phone width. Confirm three paragraphs, a bold "Don't forget", and no visible asterisks.
