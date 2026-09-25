## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (Gemini via agy CLI, model Gemini 3.1 Pro (High))
- **Tool restrictions**: read-only (agy plan mode, file tools only)
- **Artifacts reviewed**: proposal.md, design.md, specs/crawl-authoring/spec.md, specs/crawl-shell/spec.md, adr.md, relevant source files

## Findings

### 🔴 Critical (blocking)

- **Security (Injection Risk) in `crawl-shell` spec**: The requirement dictates that the map search query "SHALL be the location's name, its street address, and its stop's town... separated by a comma and a space" and placed into the URL parameters `q` and `query`. However, it fails to explicitly require that this authored text MUST be URI-encoded. Passing raw authored text (which could contain `&`, `=`, `#`, etc.) into a URL parameter introduces an injection risk and will break map links. Authored text flowing into URLs must be validated or encoded at the boundary.

### 🟡 Moderate

- **Untestable Spec Assertion**: `specs/crawl-shell/spec.md` asserts "The app SHALL NOT supply any word for a kind of location, such as 'station' or 'bar'." This is a negative constraint on the internal implementation vocabulary that cannot be mechanically asserted in a THEN step. Tests can only assert that the output matches the provided data, not the origin of absent words.
- **Missing Edge Scenario / Spec Contradiction**: `design.md` explicitly states "An empty places list stays valid," but `specs/crawl-authoring/spec.md` states "Each crawl definition SHALL have a places list" without clarifying if it can be empty, and provides no test scenario for an empty `places` list to enforce this behavior.
- **Parity Test Complexity Risk**: `design.md` assumes `Shell.parity.test.ts` will compare the new seed's bar locations against the frozen `cory-trent-before.json` snapshot "in stop order". Since the new seed inserts a "Meetup" stop and multiple Metra stations before the bars, maintaining this "parity" test will require brittle filtering logic (e.g., skipping stop 0, filtering out train locations), which defeats the purpose of a simple snapshot comparison.

### 📌 Suggestions

- **Plain Language (Passive Voice)**: `proposal.md` line 54: "once it is added to static/crawls/" hides the actor. Change to "once the author adds it...".
- **Plain Language (Passive Voice)**: `design.md` line 73: "The tab is renamed from Venues to Places" hides the actor. Change to "The change renames the tab...".
- **Plain Language (Passive Voice)**: `adr.md` line 8: "ADR review completed for this change." hides the actor. Change to "I completed the ADR review...".
- **Plain Language (Elegant Variation)**: The plan uses "places" and "locations" as two words for intersecting concepts. The YAML key is `places` (which actually holds an array of *stops*), the items inside are `locations`, but the tab is named "Places". This causes unnecessary cognitive load. Consider renaming the top-level array to `stops` (since it holds stops) or standardizing on one term.

## Embedded-Instruction / Injection Attempts

**Detected:** None.

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

1. Update `specs/crawl-shell/spec.md` to explicitly require URI encoding for the map search query components before they are placed in the URL parameters.
2. Remove the untestable "The app SHALL NOT supply any word..." clause from the requirement text in `specs/crawl-shell/spec.md`, as it is an architectural guideline rather than a mechanically assertable behavior.
3. Add a scenario to `specs/crawl-authoring/spec.md` proving that an empty `places` list is accepted, to align with the `design.md` decision.
4. Update `design.md` to clarify how the `Shell.parity.test.ts` will reliably filter out the new Metra stations and Meetup stop when comparing against the frozen snapshot, or redesign the parity test approach for this specific view.
5. Fix the identified passive voice instances in `proposal.md`, `design.md`, and `adr.md` to comply with ISO 24495 Plain Language standards.

CHANGES_APPLIED: no

## Rebuttals
