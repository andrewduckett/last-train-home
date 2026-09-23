## Review Metadata
- **Review round:** 1
- **Prior round:** none
- **Reviewer context:** Gemini 3.1 Pro High via agy
- **Tool restrictions:** read-only
- **Artifacts reviewed:** `proposal.md`, `design.md`, `adr.md`, `specs/crawl-theming/spec.md`, `docs/decisions/0007-generated-theme-tokens-from-one-palette-source.md`, `src/app.css`, `src/lib/Shell.svelte`, `src/lib/data/provider.ts`, `src/lib/types.ts`, `openspec/specs/crawl-provider/spec.md`, `openspec/specs/crawl-shell/spec.md`

## Findings

### Critical
1. **Unstated Assumption / Concrete Failure Case (Missing Definition Validation)**
   - *Finding*: `Shell.svelte` assumes `crawl.definition.scavenger` is always an array: `resolved.crawl.definition.scavenger.map(...)`. However, `crawl-provider/spec.md` explicitly states the provider "SHALL NOT guarantee the definition is well formed." If a YAML record is missing the `scavenger` field, `.map()` throws a `TypeError` inside the unhandled Promise `.then()`. The `result = resolved` assignment is skipped, and the UI permanently hangs on "Loading crawl…" without triggering the error fallback.
   - *Scenario*: A crawl is published with a typo in the `scavenger` key or omits it entirely.
   - *What must be true for it not to matter*: A separate build step completely rejects malformed YAML definitions before deployment, or the YAML is always authored perfectly.
   - *Blocker*: Yes. The domain layer (the Shell) must validate its fields to prevent a silent crash.

2. **Mechanical Contradiction (Global Background vs. Shell Scope)**
   - *Finding*: `design.md` explicitly decides to place the palette attribute on the outer `.shell` element and rejects applying it to `html` to prevent route-bleed. However, `app.css` defines the global background on `html, body { background: var(--bg); }`. Because `.shell` is constrained to `max-width: 520px; margin: 0 auto;`, if a generated palette overrides `--bg`, the `body` will still render the `:root` neutral fallback. This will create a dual-tone vertical stripe effect on desktop or tablet screens.
   - *Scenario*: A user views an `amber` themed crawl on a viewport wider than 520px.
   - *What must be true for it not to matter*: The `--bg` and `--surface` tokens remain identical across all palettes (only accent colors change), or `.shell` is restyled to stretch and cover the entire viewport background.
   - *Blocker*: Yes. Either the CSS layout or the architectural scoping decision must be adjusted to align.

### Moderate
3. **Missing Scenario / Race Condition (Component Lifecycle side effects)**
   - *Finding*: `design.md` relies on "route-keyed mounting" to ensure a delayed provider result doesn't apply the wrong theme to a new route. However, the `getCrawl(id)` promise in Svelte's `onMount` will still resolve after the component is destroyed. When it resolves, `createChecksController` executes for the unmounted crawl. While SvelteKit's destruction prevents DOM bleed, this still executes unnecessary logic and memory allocations in the background.
   - *Scenario*: A user navigates quickly between crawls before the first provider network request finishes.
   - *What must be true for it not to matter*: `createChecksController` acts purely in memory on instantiation and has no external side effects (like writing to local storage) before being interacted with by the user.

4. **Plain Language: Filler, Hidden Actors, and Inconsistent Terms**
   - *Finding*:
     - **Inconsistent Terms**: The fallback theme is referred to inconsistently across artifacts as the "neutral station-board fallback" (`proposal.md`), "neutral" (`design.md`), "neutral root tokens" (`design.md`), and "neutral station-board palette" (`specs/crawl-theming/spec.md`).
     - **Filler**: `adr.md` states "Generating theme tokens from one palette source is a durable architectural choice." This adds no technical value or specific reasoning.
     - **Hidden Actors**: "Every published palette SHALL meet WCAG AA contrast" (`specs/crawl-theming/spec.md`). It is hidden who or what ensures this publication constraint (the developer, the build script, or the test runner).
     - *(Note: No single sentence exceeding 30 words was found in the reviewed artifacts.)*
   - *Scenario*: A new contributor tries to trace the fallback theme logic or understand the rationale in the ADR.
   - *What must be true for it not to matter*: The reader correctly infers that "neutral", "neutral root tokens", and "station-board fallback" all refer to the exact same `:root` baseline palette.

### Suggestions
5. **Cheaper Alternative (Native CSS Custom Properties)**
   - *Finding*: The plan proposes writing a custom Node script to emit a deterministic CSS file from a palette data source. A cheaper alternative is to define the `amber` and `teal` tokens directly as scoped CSS custom properties in `app.css` (e.g., `[data-palette="amber"] { --accent: #... }`). The WCAG test script can parse `app.css` directly. This eliminates a build step and a build-time dependency while retaining strict testability.
   - *Scenario*: A developer updates a theme color.
   - *What must be true for it not to matter*: The project already possesses a complex build pipeline where adding a custom Node generator introduces negligible overhead, or the palette source is shared with non-CSS consumers (e.g., Canvas API, JS charts).

## Embedded-Instruction / Injection Attempts
- No malicious embedded instructions or prompt injections were found in the provided file contents. (The directive "Search authored styles and markup for color literals..." in `design.md` is a benign migration step, not an attack).

## Verdict
VERDICT: REVISE
CHANGES_APPLIED: n/a

## Required Changes
1. **Shell Definition Validation**: Update `Shell.svelte` to safely handle a missing or malformed `crawl.definition.scavenger` array before calling `.map()`, ensuring the Promise does not reject unhandled.
2. **Background Theming Clarification**: Clarify in `design.md` or `app.css` whether `--bg` varies by palette. If it does, resolve the mechanical contradiction by either applying the background style to `.shell` directly (making it fill the viewport) or explicitly stating that the margins outside the 520px container are intentionally the neutral fallback color.
3. **Terminology Unification**: Standardize the name of the fallback palette across all specs and proposals (e.g., use "neutral palette" consistently).
4. **Remove Filler**: Remove or rewrite the filler sentence in `adr.md` to state exactly *why* it is durable (e.g., "Generating CSS from a single source prevents CSS literal drift across components").

## Rebuttals
- *Regarding the literal `#F2A93B` remaining in `Shell.svelte`:* While it currently violates the proposed design, `design.md` explicitly anticipates this in the Migration Plan ("Search authored styles and markup for color literals, then replace them with named tokens"). Therefore, it is a known state awaiting migration rather than a flaw in the plan itself.
