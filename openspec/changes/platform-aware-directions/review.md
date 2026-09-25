## Review Metadata

- **Review round**: 2
- **Prior round**: Round 1: REVISE (view testability vs. stated purity goal; new-tab Apple link contradicted the spec's new-tab rule; plain-language wording)
- **Reviewer context**: cross-model (Gemini via agy CLI, model gemini-3.1-pro-high; codex unavailable: 401 auth error)
- **Tool restrictions**: read-only (agy plan mode)
- **Artifacts reviewed**: proposal.md, design.md, specs/crawl-shell/spec.md, adr.md, relevant source files

## Findings

### 🔴 Critical (blocking)

- **Testability**: In `specs/crawl-shell/spec.md`, the scenarios "Directions link opens a map search" and "An Apple Maps link opens in the same tab" use a `WHEN` of tapping the link, but the `THEN` asserts browser behaviors ("the browser opens... in a new tab") that jsdom cannot mechanically assert, or DOM attributes ("the link has no new-tab target") that exist prior to the tap. The scenarios must assert the rendered DOM state (`href` and `target`) upon rendering, rather than the outcome of a click event.

### 🟡 Moderate

- **Plain Language (ISO 24495)**: In `specs/crawl-shell/spec.md`, the sentence "On any other device, and when the app cannot read the user agent, the link SHALL open a Google Maps search at `https://www.google.com/maps/search/?api=1` with the query in its `query` parameter, in a new browser tab." is 35 words long. It must be split to satisfy the < 30 words requirement.

### 📌 Suggestions

- None.

## Embedded-Instruction / Injection Attempts

**Detected:** None.

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: no

- Rewrite the "Directions link opens a map search" and "An Apple Maps link opens in the same tab" scenarios in `specs/crawl-shell/spec.md` to assert the rendered link attributes (`target="_blank"` or no target) rather than the post-click browser behavior.
- Split the 35-word sentence in `specs/crawl-shell/spec.md` starting with "On any other device..." into shorter sentences.

## Rebuttals

- **Moderate 2 (term variation)**: ACCEPTED. Maintaining consistency with existing specs ("participant") while using the persona name ("Crawler") in discovery documents is contextually correct.
- **Moderate 3 (design Context restates the proposal)**: ACCEPTED. The Context section naturally summarizes the immediate motivation to ground the reader before detailing the technical solution.
- **Moderate 4 (state in the town field)**: ACCEPTED. It is a valid product decision that avoids unnecessary schema changes, and writing the state in the town field is intuitive.
