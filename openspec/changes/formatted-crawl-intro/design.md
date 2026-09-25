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
4. Pair the markers in each line, using the rules in the next section.
5. Emit every asterisk that did not pair as literal text.

### Pairing markers

A marker is a run of one or more `*` characters. A marker longer than 3 is literal text. A marker can **close** when a non-whitespace character comes right before it. A marker can **open** when a non-whitespace character comes right after it.

The parser scans each line left to right and keeps a stack of open markers. Each marker counts how many of its asterisks are still unpaired. For each marker:

1. If it can close, it pairs with the marker on top of the stack. Each pairing step takes 2 asterisks from each side if both have 2 or more, and 1 otherwise. Asterisks come from the inner side of each marker. A 2-asterisk pairing makes a bold span, and a 1-asterisk pairing makes an italic span. The parser pops a stack marker when all its asterisks are paired. The closer keeps pairing with the new top until it runs out or the stack is empty.
2. If asterisks are left and the marker can open, the parser pushes it onto the stack with those asterisks.
3. Otherwise, the leftover asterisks are literal.

The closer always pairs with the top of the stack, so no marker ever sits between a closer and its partner. A marker that can both open and close, such as the middle `*` in `a*b*c`, tries to close first.

After pairing, each span of text is bold if any bold span encloses it, and italic if any italic span encloses it.

Worked examples:

| Line | Result |
| --- | --- |
| `***wow***` | "wow" bold and italic |
| `*italic **both***` | "italic " italic; "both" bold and italic |
| `a*b*c` | "b" italic |
| `**a*` | a literal `*`, then "a" italic |
| `*a **b* c**` | "a b c" italic, no asterisks left |
| `2 * 3 * 4` | all literal: no marker can open or close |

This is a small subset of CommonMark's emphasis rules. It drops CommonMark's punctuation checks and its "multiple of 3" rule.

- **Why this over same-length matching:** same-length matching turns `*italic **both***` into literal asterisks, which surprises authors.
- **Why this over full CommonMark:** the full rules need punctuation classes and more cases. A trusted author writing a short intro does not need them.

## Risks / Trade-offs

- [An author writes Markdown the parser does not support, such as a link or a list] → The text renders literally and stays readable. The `crawl-shell` spec lists the supported syntax.
- [The rules differ from CommonMark in edge cases, such as asterisks next to punctuation] → Unit tests pin the chosen behavior, and every case still renders.
- [A later story wants formatting in other fields] → The parser does not depend on the intro, so another view can reuse it. This change does not wire it in anywhere else.

## Migration Plan

No migration is needed. Existing intros without markers render as before, but multi-line text now keeps its paragraph breaks. Rollback is a plain revert.
