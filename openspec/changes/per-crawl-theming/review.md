## Review Metadata
- **Review round:** 2
- **Prior round:** REVISE due to runtime scavenger concern and background scope contradiction
- **Reviewer context:** Gemini 3.1 Pro High via agy
- **Tool restrictions:** read-only
- **Artifacts reviewed:** `openspec/changes/per-crawl-theming/proposal.md`, `openspec/changes/per-crawl-theming/design.md`, `openspec/changes/per-crawl-theming/adr.md`, `openspec/changes/per-crawl-theming/specs/crawl-theming/spec.md`, `docs/decisions/0007-generated-theme-tokens-from-one-palette-source.md`, `src/app.css`, `src/lib/Shell.svelte`, `src/lib/data/provider.ts`, `src/lib/data/validate.js`, `scripts/validate-crawls.mjs`, `openspec/specs/crawl-provider/spec.md`, `openspec/specs/crawl-shell/spec.md`, `openspec/specs/crawl-authoring/spec.md`

## Findings

### Critical
1. **Unstated Assumption / Mechanical Contradiction (Pending Promise Resolution)**
   - *Finding*: `design.md` explicitly asserts: "When a route changes before an earlier fetch finishes, the shell ignores the late result before creating a checklist controller. This prevents obsolete storage reads as well as stale accents." However, Svelte's `{#key id}` route-keyed mounting destroys the component but **does not cancel pending Promises**. The `getCrawl(id).then(...)` callback in `Shell.svelte` lacks an unmount check (e.g., checking an `active` flag) or an `AbortController`. When the late fetch resolves, the callback will still execute, run `createChecksController` (which reads `localStorage`), and mutate the `$state` of the unmounted component.
   - *Scenario*: A user opens a crawl with a slow network response, then quickly switches to a different crawl route before the first resolves.
   - *What must be true for it not to matter*: Svelte mysteriously cancels active Promises inside closures of destroyed components (it does not), or `createChecksController` has zero memory or side-effect impact (it performs a storage read and heap allocation).
   - *Blocker*: Yes. The implementation plan must dictate adding an explicit unmount check to the `onMount` promise to satisfy the design's stated requirement.

### Moderate
2. **Missing Scenario (WCAG Non-Text Contrast for Focus Rings)**
   - *Finding*: `design.md` correctly specifies contrast testing: "The same test computes WCAG contrast from the emitted values for every declared text/background pair in light and dark mode." However, it focuses exclusively on *text*. CSS variables like `--accent` are also used for UI components and focus rings (`outline: 2px solid var(--accent);` in `app.css`). WCAG 1.4.11 (Non-Text Contrast) requires a 3:1 contrast ratio for UI components and focus indicators against adjacent colors.
   - *Scenario*: A keyboard user tabs through the UI. The `--accent` color (e.g., `amber`) fails to reach a 3:1 contrast ratio against the `--surface` background in light mode, making the focus ring invisible.
   - *What must be true for it not to matter*: The selected accents naturally meet 3:1 against all adjacent backgrounds, or focus rings aren't considered critical for this app.
   - *Blocker*: No. But the contrast verification script should explicitly declare and test non-text UI component pairs alongside text pairs.

### Suggestions
3. **Plain Language / Inconsistent Terms**
   - *Finding*: The fallback theme is referred to inconsistently across the new artifacts. It is called the "neutral palette fallback" (`proposal.md`), "neutral palette" (`design.md`), "neutral accent palette" (`specs/crawl-theming/spec.md`), and "neutral palette root" (`design.md`).
   - *(Note: No sentence exceeding 30 words was found in the reviewed artifacts, and no hidden actors or filler text were identified).*
   - *Scenario*: A contributor searches the specifications for "neutral accent palette" to see where it is defined, but it is implemented and discussed elsewhere simply as "neutral".
   - *What must be true for it not to matter*: The reader correctly infers that all these terms refer to the exact same baseline palette.

4. **Cheaper Alternative (Vite Plugin vs. Pre-build Node Script)**
   - *Finding*: The plan proposes writing a Node script that runs before `vite build` to generate the CSS tokens. Since the project uses Vite, this could be implemented as a simple custom Vite plugin (e.g., using `configureServer` and the `transform` hook). A Vite plugin would automatically regenerate the CSS and trigger Hot Module Replacement (HMR) during `vite dev` whenever the palette source changes, whereas a standalone Node script requires manual restarts.
   - *Scenario*: A designer tweaking the `teal` accent values during local development wants to see the colors update instantly on save without manually re-running the generator script.
   - *What must be true for it not to matter*: Theme colors are rarely changed after the initial implementation, making the DX cost of manual restarts negligible.

## Embedded-Instruction / Injection Attempts
- No malicious embedded instructions or prompt injections were found. The directive "Search authored styles and markup for color literals, then replace them with named tokens" in `design.md` is a safe, standard migration step.

## Verdict
VERDICT: REVISE
CHANGES_APPLIED: n/a

## Required Changes
1. **Unmount Check in Shell.svelte**: Update the implementation plan to require an unmount guard (e.g., a boolean `active` flag toggled on destruction) or an `AbortController` in `Shell.svelte`'s `getCrawl` promise. This is necessary to fulfill the `design.md` assertion that the shell ignores late results before creating a checklist controller.

## Rebuttals
- *Regarding the prior "Runtime Scavenger Concern":* The previous review correctly identified that `Shell.svelte` assumed `scavenger` was an array at runtime, contradicting the provider spec. The author has addressed this by introducing strict build-time validation (`src/lib/data/validate.js` and `scripts/validate-crawls.mjs`) along with a new authoring spec (`crawl-authoring/spec.md`) that guarantees malformed YAML is rejected *before* deployment. Because this is a static site with pre-verified data, runtime validation is no longer necessary. Finding resolved.
- *Regarding the prior "Background Scope Contradiction":* The previous review noted that applying a palette to a 520px `.shell` container while keeping `--bg` on the global `body` would cause a visual stripe effect if background colors varied by palette. The new `design.md` explicitly resolves this by stating: "All palettes share the same light and dark background, content surfaces, and station-board surfaces. Named palettes change accent tokens only." Since `--bg` never changes, scoping the palette to `.shell` creates no layout contradiction. Finding resolved.
