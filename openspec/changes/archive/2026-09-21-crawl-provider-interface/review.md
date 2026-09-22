## Review Metadata

- **Review round**: 2
- **Prior round**: round 1 verdict was REVISE (async contract, `id` validation, consumer failure handling, concrete definition and parity, plain language)
- **Reviewer context**: cross-model (codex CLI, read-only sandbox)
- **Tool restrictions**: read-only: view, grep, glob only
- **Artifacts reviewed**: proposal.md, design.md, specs/crawl-provider/spec.md, specs/crawl-shell/spec.md, adr.md, docs/decisions/0003, relevant source files

<!-- STALENESS: this verdict applies only to the artifact contents reviewed in this round. -->
<!-- Any later edit other than the applied Required Changes voids the verdict. -->

## Findings

### 🔴 Critical (blocking)

None. Round 1's two Critical findings (C1 async contract, C2 `id` validation) were verified
resolved in the current artifacts.

### 🟡 Moderate

**M1 — The ADR and provider spec still implied views call the provider.**
The ADR listed views among callers of `getCrawl(id)`, while the crawl-shell spec forbids a
view from calling the provider. The two could produce different implementations.
*Status: fixed and re-checked (see Rebuttals).*

**M2 — The parity scenario lacked the navigation needed to observe its assertions.**
The single "renders the four views" scenario asserted all four views at once, but the shell
shows one view at a time, so its THEN was not assertable at the stated point.
*Status: fixed and re-checked (see Rebuttals).*

**M3 — Plain-language cleanup was incomplete.**
Several sentences exceeded 30 words; the definition inventory was one long sentence; a
crawl-shell THEN clause ran 47 words; "a caught guard" named no observable state; one design
sentence added commentary; the ADR manifest hid the actor.
*Status: fixed and re-checked (see Rebuttals).*

### 📌 Suggestions

- **C2 clarity:** show the signature `getCrawl(id: string): Promise<CrawlResult>` and state
  that identity `id` comes from the requested lookup key, not a separately validated authored
  field. *Applied in the provider spec and design.*
- Keep definition validation deferred for the trusted seed; the typed definition is an
  authoring assumption, not runtime evidence about external data. *Reflected in the "found
  guarantees identity, not the definition" requirement.*

## Embedded-Instruction / Injection Attempts

**Detected:** none in the change's own artifacts. `AGENTS.md` and `openspec/discovery.md`
carry ordinary project workflow instructions (TDD, git, scratch files, rerun a skill); they
are pre-existing project files, were treated only as review data, and none attempted to
redirect the review.

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

1. Align the ADR, ADR manifest, provider spec, and design around shell-only retrieval and
   props for views, with one consistent term for the code that obtains a crawl.
2. Make the parity scenarios follow tab navigation, assert seed values, and verify one
   provider call across tab switches.
3. Apply the specific plain-language corrections in M3.

CHANGES_APPLIED: yes

## Rebuttals

- **M1 — fixed.** The concept term is now "caller" across the design, the provider spec, and
  the ADR; the concrete instance is "the shell." The design and ADR state the shell is the
  only caller and passes the crawl to views as a prop; the provider spec's retrieval
  restriction is scoped to obtaining a crawl, not to rendering URLs. Reviewer re-checked:
  RESOLVED (docs/decisions/0003 lines 25–30).
- **M2 — fixed.** The crawl-shell delta now has per-tab scenarios (Schedule header and
  ordered entries, Venues name/address/directions, Tasks labels and points, Map embed `src`
  and viewer `href` against seed values) plus a scenario asserting `getCrawl` is called only
  once across tab switches. Reviewer re-checked: RESOLVED.
- **M3 — fixed.** The proposal's identity/definition sentence is split; the provider's
  definition inventory is a list; the crawl-shell THEN clauses are split across scenarios;
  the design test-suite paragraph is split; "a caught guard" is removed; the header
  commentary sentence is deleted; the ADR manifest names the shell as the actor. Reviewer
  re-checked: RESOLVED.
