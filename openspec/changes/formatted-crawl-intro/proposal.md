## Why

The Info tab shows the crawl introduction as one plain paragraph. In the live seed crawl, its three paragraphs run together, and `**Don't forget**` appears with its asterisks. The fix should land before #16 copies this intro pattern into a second crawl.

## What Changes

- In the introduction, a blank line starts a new paragraph. A line that holds only spaces counts as blank.
- A single line break inside a paragraph becomes a line break on screen.
- `**text**` shows as bold, and `*text*` shows as italic.
- A marker counts only when it hugs its text: an opening marker is not followed by a space, and a closing marker is not preceded by one. So `2 * 3 * 4` stays literal.
- A marker with no partner stays as literal text and never breaks the page.
- Markers pair only within one line.
- Raw HTML in the introduction stays literal text, as it does today.
- The app renders the result as Svelte elements. It adds no `{@html}`, no new dependency, and no change to the content security policy.

Out of scope:

- Links, lists, headings, `_italic_`, `\*` escapes, and raw HTML. The Info tab already has quick links, and each extra piece of syntax grows the parser.
- Formatting in schedule, venue, and task text. Those are short labels that people read at a glance.
- Any change to how the build validates `intro`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `crawl-shell`: the "Crawl introduction" requirement changes. Today it says Info shows plain text and does not interpret markup. After this change, Info renders paragraphs, line breaks, bold, and italics, and keeps all other markup literal.

`crawl-authoring` does not change. It covers build validation, and the validation rules for `intro` stay the same.

## Impact

- `src/lib/InfoView.svelte`: renders parsed paragraphs instead of one `<p>`.
- New pure module `src/lib/crawl/richText.ts`, with its own unit tests.
- `src/lib/InfoView.test.ts` and `src/lib/Shell.info.test.ts`: cover the new rendering.
- `static/crawls/cory-trent.yaml`: needs no edit, because it already uses the supported syntax.
- The provider, types, validation, and CSP do not change.
