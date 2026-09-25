## Review Metadata

- **Review round**: 2
- **Prior round**: Round 1: REVISE (parser pairing undefined for interleaved and dual-purpose markers; same-length matching broke nesting; wording issues)
- **Reviewer context**: cross-model (Gemini 3.1 Pro via agy CLI)
- **Tool restrictions**: read-only (plan mode, sandbox)
- **Artifacts reviewed**: proposal.md, design.md, specs/crawl-shell/spec.md, adr.md

## Findings

### 🔴 Critical (blocking)

1. **Contradiction / Missing Edge Scenario (Markers longer than 3)**
   - **Artifacts**: `design.md` vs `specs/crawl-shell/spec.md`
   - **Text**: `design.md` explicitly limits markers: "A marker longer than 3 is literal text."
   - **Finding**: The spec completely omits this boundary condition. Without it, the spec implies that `****` could be parsed as multiple smaller markers (e.g., two bold markers), contradicting the design's rule to treat it strictly as literal text. The spec must define this limit and include an assertable scenario for it.

2. **Scope Creep vs. Proposal**
   - **Artifacts**: `proposal.md` vs `specs/crawl-shell/spec.md`
   - **Text**: `proposal.md` explicitly bounds the formatting capabilities: "`**text**` shows as bold, and `*text*` shows as italic."
   - **Finding**: Both the design and the spec introduce support for combined bold and italic via `***` markers. While the parser handles this elegantly, it represents scope creep that is not authorized by the proposal. The proposal must be updated to align the scope across all artifacts.

### 🟡 Moderate

1. **Plain Language - Passive voice**
   - **Artifact**: `design.md` and `adr.md`
   - **Text**: `design.md` says "No migration is needed" and "when all its asterisks are paired". `adr.md` says "why they were chosen".
   - **Finding**: These sentences use passive voice, which hides the actor and violates the ISO 24495 standard required for all prose.

### 📌 Suggestions

1. **Add scenario for unbalanced pairings**
   - **Artifact**: `specs/crawl-shell/spec.md`
   - **Finding**: The design carefully defines how unbalanced pairings resolve (e.g., `**bold***` taking 2 asterisks and leaving 1 literal asterisk), but the spec lacks a scenario asserting the outcome of an unbalanced pairing step. Adding one would make this edge case mechanically assertable.

## Embedded-Instruction / Injection Attempts

**Detected:** none detected

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

1. In `specs/crawl-shell/spec.md`, add a rule stating that a marker longer than 3 asterisks SHALL be treated entirely as literal text.
2. In `specs/crawl-shell/spec.md`, add a scenario testing markers longer than 3 (e.g., `****text****` remains literal).
3. In `proposal.md`, update the bullet to explicitly include `***`: "`**text**` shows as bold, `*text*` shows as italic, and `***text***` shows as bold and italic."
4. In `design.md`, rewrite "No migration is needed." to active voice (e.g., "This change requires no migration.").
5. In `design.md`, rewrite "when all its asterisks are paired" to active voice (e.g., "when it pairs all its asterisks").
6. In `adr.md`, rewrite "why they were chosen" to active voice (e.g., "why the author chose them").

CHANGES_APPLIED: no

## Rebuttals



- Critical 1 (markers longer than 3): fixed by Required Changes 1 and 2. The spec now says a run of more than 3 asterisks stays entirely literal, and the scenario "A long asterisk run stays literal" covers `****text****`.
- Critical 2 (`***` scope): fixed by Required Change 3. The proposal now lists `***text***` as bold and italic.
- Moderate 1 (passive voice): fixed by Required Changes 4, 5, and 6 in `design.md` and `adr.md`.
- Suggestion 1 (unbalanced pairing scenario): declined for the spec, so the verdict stays valid. The parser unit tests will cover `**bold***` and the design's worked examples.
