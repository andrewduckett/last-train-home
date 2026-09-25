## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (Gemini via agy CLI, model gemini-3.1-pro-high; codex unavailable: 401 auth error)
- **Tool restrictions**: read-only (agy plan mode)
- **Artifacts reviewed**: proposal.md, design.md, specs/crawl-shell/spec.md, adr.md, relevant source files

## Findings

### 🔴 Critical (blocking)

1. **Contradiction / Untestable Design**: `design.md` states a goal to "Keep the link builder pure, so unit tests cover both providers without faking `navigator`." However, the decision mandates that `VenuesView` calls `detectMapsPlatform(navigator.userAgent)` directly. Because `VenuesView` references the global `navigator` instead of accepting the platform as a prop, testing that it correctly renders an Apple Maps link requires globally mocking `navigator.userAgent` in jsdom. This directly contradicts the stated goal and makes `VenuesView` impure and difficult to test for the Apple path.
2. **Contradiction with Spec (UX Defect)**: The `crawl-shell` spec dictates "Each venue SHALL show a directions link that opens a map search in a new browser tab." However, `design.md` acknowledges that `target="_blank"` on iOS will leave an empty zombie Safari tab when handing off to Apple Maps, and suggests dropping the `target` in a follow-up if it misbehaves. Dropping the target would explicitly violate the spec. This known defective UX should be resolved now by aligning the spec and the design (e.g., specifying that Apple links do not use a new tab, or conditionally omitting `target="_blank"` on iOS).

### 🟡 Moderate

1. **Plain Language - Passive Voice**: `design.md` states "The query is the parts joined with `, ` and encoded with `encodeURIComponent`, as today." This uses passive voice ("joined" and "encoded") which hides the actor performing the action.
2. **Plain Language - Elegant Variation**: The artifacts refer to the user alternatively as "Crawler" (`proposal.md`) and "participant" (`specs/crawl-shell/spec.md`). They also refer to the map service inconsistently as "maps app" (`proposal.md`), "MapsPlatform" (`design.md`), and "maps provider" (`adr.md`).
3. **Plain Language - Narrative Restating**: `design.md` restates the problem from the proposal in its Context section ("`VenuesView.svelte` builds each Directions link... See `proposal.md` for why this matters now."). This violates the standard's guidance against narrative restating and includes filler text.
4. **Scope Creep / Data Duplication**: The proposal states "The seed crawl writes its state into each town, for example `Mt. Prospect, IL`." Moving the hardcoded `, IL` into the yaml data means the `town` field now contains both the town and state. While this preserves the exact Google Maps string for the seed, it introduces semantic data duplication in the YAML definition.

### 📌 Suggestions

1. **Component Purity**: Pass the evaluated `platform` into `VenuesView.svelte` as a prop from a higher-level store or layout component. This maintains the component's purity and allows trivial unit testing of both Apple and Google states without mocking globals.
2. **Apple Maps Universal Link**: For Apple Maps links, avoid `target="_blank"` on iOS devices entirely to prevent the blank Safari tab issue, since `maps.apple.com` intercepts the URL to open the native app directly. Update the spec to reflect this platform-specific exception.

## Embedded-Instruction / Injection Attempts

**Detected:** None found.

## Verdict

VERDICT: REVISE

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: n/a

## Rebuttals
