## Context

`InfoView.svelte` places the raw `intro` string in one `<p>`. The browser collapses its line breaks and shows its asterisks. See `proposal.md` for why this matters now.

Three project constraints shape the fix:

- The CSP allows no inline scripts. The app must not inject authored text as HTML.
- The provider carries `intro` through without interpreting it. A domain layer owns its meaning, as `schedule.ts` and `urls.js` already do for their data.
- A bad value must never break the page.

## Goals / Non-Goals

**Goals:**

- Keep the parser pure, so unit tests can cover every rule without rendering.
- Give Svelte a shape it can render with plain `{#each}` blocks.
- Make every input render. The parser never throws.

**Non-Goals:**

- Full CommonMark behavior. The parser borrows only the flanking idea.
- A shared formatter for other text fields. Schedule, venue, and task text stay plain.

## Decisions

### A pure parser in `src/lib/crawl/richText.ts`

The module exports one function. It takes the intro string and returns paragraphs:

```ts
type Run = { text: string; strong: boolean; em: boolean };
type Line = Run[];
type Paragraph = Line[];
function parseRichText(source: string): Paragraph[];
```

`InfoView` renders each paragraph as a `<p>`, puts a `<br>` between lines, and wraps each run in `<strong>`, `<em>`, both, or neither.

- **Why this over `{@html}` with a small Markdown library:** every piece of output is a Svelte text node, so the app never has an injection path. It also adds no dependency, and the CSP stays unchanged.
- **Why this over parsing inside the component:** a pure function is easy to test with many small inputs. It also follows the rule that domain layers interpret definition data.

### Flat runs, not a nested tree

Each run carries its own `strong` and `em` flags. So `**a *b* c**` becomes three runs: bold, bold and italic, then bold.

- **Why:** Svelte renders flat runs without a recursive snippet or component. Two formats cannot nest more than two levels deep, so a tree would buy nothing.
- **Alternative considered:** a CommonMark-style inline tree. It is more general, but it costs recursion in both the parser and the view.

### Parsing steps

1. Normalize `\r\n` to `\n`.
2. Split into paragraphs on one or more blank lines, where a blank line is empty or holds only whitespace. Drop empty paragraphs at the start and end.
3. Split each paragraph into lines. Trim trailing whitespace from each line.
4. Scan each line for delimiter runs of `*`. A run of length 1, 2, or 3 can open when the next character is not whitespace and it is not at the end of the line. It can close when the previous character is not whitespace.
5. Match each closer with the nearest open opener of the same length, using a stack. A length-3 run toggles both flags.
6. Emit unmatched runs, and runs longer than 3, as literal text.

Each run's flags come from the set of open, matched spans that cover it.

### Delimiter details kept simple

- Delimiter runs must match in length. `**a*` does not match, so it renders literally. This avoids CommonMark's rule for splitting runs.
- Intraword markers such as `Cory*and*Trent` follow the flanking rule and render as italic. Authors rarely write this, and it matches what they would expect from Markdown.

## Risks / Trade-offs

- [An author writes Markdown the parser does not support, such as a link or a list] → The text renders literally and stays readable. The `crawl-shell` spec lists the supported syntax.
- [The rules differ from CommonMark in edge cases, such as unequal delimiter lengths] → Unit tests pin the chosen behavior, and every case still renders.
- [A later story wants formatting in other fields] → The parser does not depend on the intro, so another view can reuse it. This change does not wire it in anywhere else.

## Migration Plan

No migration is needed. Existing intros without markers render as before, but multi-line text now keeps its paragraph breaks. Rollback is a plain revert.
