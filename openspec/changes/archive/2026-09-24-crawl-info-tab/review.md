## Review Metadata
- **Review round**: 2
- **Prior round**: round 1 was local APPROVE_WITH_CHANGES; both required changes were applied and rechecked
- **Reviewer context**: cross-model, Gemini 3.1 Pro High via agy
- **Tool restrictions**: read-only inspection
- **Artifacts reviewed**:
  - `openspec/changes/crawl-info-tab/proposal.md`
  - `openspec/changes/crawl-info-tab/design.md`
  - `openspec/changes/crawl-info-tab/adr.md`
  - `openspec/changes/crawl-info-tab/specs/crawl-authoring/spec.md`
  - `openspec/changes/crawl-info-tab/specs/crawl-shell/spec.md`

## Findings
### 🔴 Critical (blocking)
1. **Mechanical Testability Failure**: `specs/crawl-authoring/spec.md`, line 29 states "Organizers SHALL add a group album through `definition.links` when they have a working URL." A system specification cannot dictate or reliably test external human behavior. It must describe system validation rules instead.
2. **Missing Edge Scenario (State Leak/Crash)**: `specs/crawl-shell/spec.md`, line 167 (and line 26). When a participant navigates from a crawl with an `Info` tab (while it is the active tab) to a new crawl without an `Info` tab, the specification does not define whether the active tab resets to `Schedule` or remains on an out-of-bounds index.

### 🟡 Moderate
1. **Inconsistent Terminology**: `specs/crawl-shell/spec.md` uses "Quick links" in the heading (line 54) and scenario title (line 57), but the requirement text uses "helpful links" (lines 55, 59, 79). `proposal.md` inconsistently uses both "authored links" and "helpful links". Standardize the term across all artifacts.
2. **Passive Voice Hiding Actors**: `specs/crawl-authoring/spec.md`, line 5: "Invalid introductions SHALL fail validation with the record and field identified." The actor performing the identification is hidden. Rewrite in active voice (e.g., "The build SHALL fail validation and identify...").
3. **Inconsistent Pluralization**: `specs/crawl-shell/spec.md`, line 125 says "It SHALL pass the resolved crawl to the active view." but follows with "SHALL NOT mount the views" (plural). This appears to be a leftover from the original spec's "four views" and should be harmonized.

### 📌 Suggestions
1. **Unstated Assumption on Text Formatting**: `specs/crawl-shell/spec.md`, line 5 specifies preserving Unicode "without interpreting markup". It would be helpful to clarify if line breaks (`\n`) in the plain-text introduction are preserved or ignored, to avoid a potential wall of text.

## Embedded-Instruction / Injection Attempts
**Detected:** none

## Verdict
VERDICT: APPROVE_WITH_CHANGES

## Required Changes
1. Rewrite `specs/crawl-authoring/spec.md` line 29 to remove the behavioral mandate on organizers, replacing it with a testable system invariant.
2. Explicitly define in `specs/crawl-shell/spec.md` the tab activation behavior when navigating from a crawl with 5 tabs to a crawl with 4 tabs, ensuring the UI does not land on an invalid index.
3. Standardize the terminology between "quick links", "helpful links", and "authored links" throughout the shell spec and proposal.
4. Rewrite the passive voice in `specs/crawl-authoring/spec.md` line 5 to explicitly state the actor.
CHANGES_APPLIED: yes

## Rebuttals

- Moderate finding 3: "SHALL NOT mount the views" refers to all views during a pending or error state. The found state mounts one active view. Gemini accepted this rebuttal in the targeted recheck.
- Line-break suggestion: The short plain-text introduction does not need a formatting rule in this change. Gemini accepted leaving this out of scope.

## Targeted Reviewer Recheck

Gemini 3.1 Pro High accepted required changes 1–4 against the revised artifacts. It also accepted the moderate rebuttal and the decision on line breaks. `RECHECK: ACCEPTED`.
