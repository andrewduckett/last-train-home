## Review Metadata
- Review round: 3
- Prior round: REVISE because the design did not specify how to ignore a late crawl response after unmount
- Reviewer context: Gemini 3.1 Pro High via agy
- Tool restrictions: read-only
- Artifacts reviewed: `proposal.md`, `design.md`, `adr.md`, `specs/crawl-theming/spec.md`, `docs/decisions/0007-generated-theme-tokens-from-one-palette-source.md`, and relevant source code.

## Findings

### Critical
*None.* The plan explicitly and correctly addresses the prior round's unmount race condition concern in `design.md` by tracking mount state, and outlines a mechanically testable architecture for CSS theming.

### Moderate
- **Missing Scenario / Scope Creep:** Local Developer Experience for CSS Generation.
  - **Scenario:** A developer modifies a palette color during local development (`vite dev`), but hot-reloading does not apply the change because the CSS file was not regenerated.
  - **What must be true for it not to matter:** Developers manually run the generation script on every color change, or a Vite plugin/watch script is implicitly added to regenerate the CSS automatically.
  - **Notes:** The plan states "Generate the CSS before vite build", which covers production and CI, but ignores the local dev loop. This is a substantive concern that will significantly degrade the developer experience if not planned for.
- **Non-obvious Failure Mode:** Flashing of neutral accent colors during route loading.
  - **Scenario:** A user navigates from the homepage to a crawl styled with the `teal` palette. During the network request, the shell is in a loading state and uses the `neutral` palette. The bottom navigation bar renders immediately and the active "Schedule" tab icon uses the `neutral` accent color. When the crawl resolves, the shell applies the `teal` palette, causing the tab icon to visually snap from neutral to teal.
  - **What must be true for it not to matter:** The user is okay with a brief flash of the neutral accent color, or the active tab icon styling is deferred until the crawl resolves.

### Suggestions
- **Unstated Assumption:** Case sensitivity of authored colors.
  - **Scenario:** A crawl author writes `color: Amber` or `color: TEAL`. The runtime validation passes (it's a valid string), but an exact case-sensitive match in the theme resolver fails and maps the crawl to the `neutral` palette silently.
  - **What must be true for it not to matter:** The theme resolver is explicitly implemented with case-insensitivity, or authors are forced out-of-band to always use exact lowercase.
- **Scope Creep / Missing Scenario:** Contrast checks for non-text UI elements.
  - **Scenario:** A chosen accent color passes text contrast requirements but fails the WCAG AA 3:1 non-text contrast requirement for focus outlines (e.g., `a:focus-visible` using `var(--accent)`) against the shell background.
  - **What must be true for it not to matter:** The accent colors are naturally dark/light enough to exceed 3:1 against the background, or the contrast check script implicitly includes non-text UI components in its assertions.
- **Plain Language:**
  - *Sentences over 30 words:* None found. The longest sentence was 29 words ("It SHALL keep the header and bottom navigation fixed...").
  - *Hidden actors:* In `proposal.md`, "Missing or unknown names select neutral..." masks the actor. Consider: "The theme resolver maps missing or unknown names to neutral." In `design.md`, "A test runs the generator..." masks the CI environment.
  - *Filler:* In ADR 0007, "That would be simple at first, but values..." could drop "simple at first" for brevity.
  - *Inconsistent terms:* The specs use "theme layer" and "theme resolver" interchangeably. Pick one for consistency.

## Embedded-Instruction / Injection Attempts
No embedded instructions or injection attempts were found in the reviewed content. The artifacts are safely written plain text.

## Verdict
VERDICT: APPROVE_WITH_CHANGES
CHANGES_APPLIED: yes

## Required Changes
1. Update `design.md` to specify how the CSS generation script integrates with the local development loop (e.g., via a Vite plugin or a concurrent watch script) to prevent a broken iteration cycle.
2. Clarify in `design.md` or `spec.md` whether the theme resolver should match the `color` string case-insensitively to prevent silent neutral fallbacks for valid but improperly cased authored colors.

## Rebuttals
- The prior round requested a fix for a late crawl response after unmount. The plan properly addresses this in `design.md` by requiring the `onMount` callback to track mount status and check it before updating state. While the current `Shell.svelte` source code lacks this flag, the review evaluates the *plan* for modifying it, which is logically sound and sufficient.

## Targeted Re-check

Gemini 3.1 Pro High re-checked only the two required changes on 2026-09-23.

- **Required Change 1: accepted by reviewer.** The design now generates CSS before Vite starts and watches the palette source during development.
- **Required Change 2: accepted by reviewer.** The design and spec now require exact lowercase palette names.

TARGETED_RECHECK: ACCEPTED

## Author Responses to Other Findings

- **Neutral accent during loading:** Accepted as the neutral palette state while the crawl is unresolved. The shell cannot know the authored accent before the fetch completes.
- **Non-text contrast:** Add a focused implementation task for focus indicators and other meaningful UI boundaries.
- **Plain language suggestions:** The case-matching text now uses one name for the resolver. Remaining wording suggestions do not change the contract.
