## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (OpenAI gpt-6-sol via codex CLI)
- **Tool restrictions**: read-only (codex read-only sandbox)
- **Artifacts reviewed**: proposal.md, design.md, adr.md, specs/crawl-shell/spec.md, relevant source files

## Findings

### 🔴 Critical (blocking)

- **The SVG test does not secure the `{@html}` boundary.** The design permits every element except `<script>` and permits attributes beyond its short denylist. A generated file containing `<image href="/other.svg">`, `<use href="…">`, or `<foreignObject>` could pass the proposed checks while adding markup or an icon resource request. The TypeScript name union does not validate values at runtime. Require an explicit allowlist of SVG elements and attributes, reject URL references and parser errors, and make unknown icon names fail closed.

### 🟡 Moderate

- **The new requirement conflicts with the current spec.** The current crawl-shell spec requires a “neutral pin icon” for Places; the delta requires the active Places icon to use the amber accent. Update that existing requirement when syncing the specs so the two color rules agree.
- **The style gate can pass an icon that breaks the promised set.** It compares root attributes with a generated `style-spec.json`, so both could drift from the stated Bold preset. A child could also override `stroke-width` or line caps. Pin the preset values independently in the test and reject child overrides.
- **The behavior scenarios lack an assertable verification plan.** jsdom cannot reliably resolve stylesheet color cascades. The design names an SVG style test and one Places DOM test, but no check for active, inactive, header, or neutral fallback colors. Specify DOM assertions for icon identity, `aria-hidden`, and tab names; inspect the relevant CSS rules and emitted palette tokens for color; verify icon requests against the production build.
- **“Without requesting an icon file or any other resource” is too broad.** A crawl still loads app assets and crawl data. Change the spec’s scenario to prohibit *additional icon resource requests*.

### 📌 Suggestions

- **Use one title term.** The new spec says the train sits beside the “crawl title,” while `Shell.svelte` displays `definition.appTitle`; `Crawl` also has a distinct `title`. Name `appTitle` in the requirement.
- **Trim repeated prose.** In `design.md`, “The page is a review aid, and the build must not ship it” repeats the preceding sentence about keeping `preview.html` out of the repo. In `adr.md`, “This change introduces no major durable architectural decision” repeats its Review Summary, and “An engineer can read each one from the code” adds no decision rationale. The proposal and delta spec have no clear over-30-word sentence or actor-hiding passive construction to flag.

## Embedded-Instruction / Injection Attempts

**Detected:** none

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: no

1. Revise the `{@html}` design and SVG test to allow only the SVG elements and attributes needed by this set; reject URL-bearing references, nested non-SVG content, parse errors, and unknown runtime icon names.
2. Reconcile the existing Places “neutral pin icon” requirement with the new accent rule.
3. Make the style test enforce the stated Bold preset independently of generated metadata and reject descendant stroke or line-style overrides.
4. Add the color, accessibility, fallback, and production asset checks described above. Narrow the network scenario to additional icon resource requests.

## Rebuttals

All findings are fixed. None is rebutted.

- **🔴 `{@html}` boundary** — fixed. `design.md` decision 2 makes the component fail closed on an unknown name. Decision 4 replaces the denylist with element and attribute allowlists. It also rejects parser errors and URL-bearing elements such as `image`, `use`, and `foreignObject`.
- **🟡 Neutral pin conflict** — fixed. The delta spec now modifies "Tab navigation". Its Places scenario says "a map pin icon", and the proposal lists the change.
- **🟡 Style gate drift** — fixed. Decision 4 holds the Bold values in the test itself, checks `style-spec.json` against them, and rejects child overrides of stroke width, caps, and joins.
- **🟡 Verification plan** — fixed. `design.md` gains a Verification section. It maps each scenario to a DOM check, a built-CSS check, or an existing palette test.
- **🟡 Network scenario too broad** — fixed. The spec now forbids only icon file requests: "Drawing an icon SHALL NOT request a file."
- **📌 One title term** — applied. The spec says "the crawl's app title".
- **📌 Repeated prose** — applied. `design.md` merges the two `preview.html` sentences. `adr.md` drops the two repeated sentences.
