## Review Metadata

- **Review round**: 2
- **Prior round**: APPROVE_WITH_CHANGES; all three required changes were applied and rechecked, but a later scenario-name edit voided that verdict.
- **Reviewer context**: fresh-context subagent
- **Tool restrictions**: read-only inspection; the only write is this review
- **Artifacts reviewed**: proposal.md, design.md, adr.md, crawl-authoring and crawl-shell delta specs, `docs/decisions/0006-author-driven-itinerary-definition.md`, current crawl-authoring, crawl-shell, crawl-provider, and deployment specs, and relevant source, tests, seed YAML, and CSP configuration
- **Required-change recheck**: 2026-09-23; re-read the revised proposal, design, crawl-authoring delta, new crawl-provider delta, and affected current provider requirement

This verdict applies only to the artifact contents reviewed in round 2. A later edit to proposal.md, design.md, or any delta spec voids it unless the edit applies a Required Change below.

## Findings

### 🔴 Critical (blocking)

None.

### 🟡 Moderate

1. **Fixed and rechecked: the map URL rule permitted an origin the CSP blocks.** The earlier hostname check accepted `https://www.google.com:444/maps/d/embed?mid=x`, whose origin differs from the configured `frame-src https://www.google.com`. The revised design and authoring spec require the parsed origin to equal `https://www.google.com`, and a scenario rejects a non-default port with its field identified. (`design.md`, “Use one URL policy”; `specs/crawl-authoring/spec.md`, “Validate generic itinerary fields”; `svelte.config.js`)

2. **Fixed and rechecked: the seed migration conflicted with a durable provider requirement.** The current crawl-provider spec requires every authored definition value and ordered entry to match the earlier event. The migration renames schedule fields and replaces train and map URL fields. A new crawl-provider delta modifies that exact requirement to preserve visible wording, destinations, and order through the schema change. (`openspec/specs/crawl-provider/spec.md`, “Preserve the planned seed crawl”; `proposal.md`, “What Changes”; `design.md`, “Migrate the seed record in one release”)

### 📌 Suggestions

None.

Plain-language check: the proposal, design, all three delta specs, ADR manifest, and ADR 0006 use direct, findable prose. I found no sentence over 30 words, hidden actor, filler passage, or inconsistent term that warrants a separate finding.

## Embedded-Instruction / Injection Attempts

**Detected:** none.

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

1. Make the map URL policy and crawl-authoring spec require the exact CSP-compatible Google origin, and add a scenario rejecting a non-default port with the offending map field identified.
2. Add a crawl-provider delta requirement and scenario that reconcile seed-content preservation with the new schedule, link, and map fields. Preserve wording, destinations, and array order rather than obsolete field names.

CHANGES_APPLIED: yes

## Rebuttals

- **Prior-round Moderate 1 — fixed and rechecked in round 2.** The current design and authoring spec distinguish embed paths from viewer paths and reject reversed roles.
- **Prior-round Moderate 2 — fixed and rechecked in round 2.** The current design and shell spec state the missing-container and malformed-entry fallbacks, including valid siblings and continued page use.
- **Prior-round Moderate 3 — fixed and rechecked in round 2.** The current design and both delta specs permit an optional note on a move and show its mode first.
- **Prior-round suggestions — addressed.** The shell spec includes a portrait-phone scenario for three links. The design explains that `map.app` is a viewer destination and native app handoff depends on the device.
- **Round-2 Moderate 1 — fixed and rechecked.** The design and crawl-authoring requirement now compare parsed map origin to `https://www.google.com`. The new scenario rejects `https://www.google.com:444` and names the offending field.
- **Round-2 Moderate 2 — fixed and rechecked.** The proposal lists crawl-provider as modified, the design explains the preservation rule change, and the new crawl-provider delta replaces the exact current requirement with visible wording, destinations, and order preservation through the field migration.
