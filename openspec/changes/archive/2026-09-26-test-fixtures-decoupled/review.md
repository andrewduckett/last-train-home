## Review Metadata
- **Review round**: 2
- **Prior round**: round 1 APPROVE_WITH_CHANGES; all 4 required changes applied and re-checked (CHANGES_APPLIED: yes)
- **Reviewer context**: cross-model (Gemini via agy, plan mode)
- **Tool restrictions**: read-only; no tools called; embedded files only
- **Artifacts reviewed**: proposal.md, design.md, specs/, adr.md, docs/decisions/0008, relevant source files

## Findings
### 🔴 Critical (blocking)
C1. **Reverse-coupling: Guard test breaks suite on valid content addition**
- **Artifact/Text:** `tests/test-isolation.test.ts` and `design.md` (D4)
- **Scenario:** The author misunderstood S1 from round 1, implementing a dynamic ban of all authored IDs instead of relying solely on the directory path ban. The guard test dynamically reads all `.yaml` filenames from `static/crawls` and bans those exact strings across all test files. If an event organizer adds a perfectly valid new crawl named `first.yaml` (a common and plausible name), `authoredIds()` will include `"first"`. The regex will then scan the test suite and match the dummy ID `'first'` used in `src/lib/Shell.checks.test.ts` (`id: 'first'`). The test suite will fail, blocking the content addition. This violates the core proposal goal that "editing any `static/crawls/*.yaml` file needs no test change" by coupling the tests to the *absence* of specific filenames in production data.

### 🟡 Moderate
M1. **Specifying test architecture inside product behavior specs**
- **Artifact/Text:** `specs/crawl-authoring/spec.md` (ADDED Requirements)
- **Scenario:** The new requirement "Check authored crawls by contract, not content" and its scenarios dictate how the test suite itself must operate ("Verification SHALL check...", "Behavior checks SHALL use...", "THEN the contract check finds that record"). OpenSpec behavior specs define the app's runtime and build-time business logic, not the internal mechanics of the test suite. If the test framework or strategy changes in the future, these product requirements become invalid. Testing guidelines belong in `AGENTS.md` or ADRs (like ADR 0008), not in product behavioral specs.

M2. **Plain Language (ISO 24495) Violations**
- **Artifact/Text:** `design.md`
- **Scenario:**
  - **Sentence > 30 words:** In D3, "That proves the spec scenarios mechanically: a valid record with any content passes, a new file is found without a code change, and a broken or missing record fails with its name." is exactly 32 words.
  - **Passive voice:** In D2, "Injection is already supported" hides the actor (the provider framework). It should be active, e.g., "The provider already supports injection."

### 📌 Suggestions
S1. **Undocumented test file rename**
- **Artifact/Text:** `tasks.md` (Task 3.1), `design.md` (D5), and diff for `src/lib/data/seed.test.ts`
- **Scenario:** The design doc and tasks explicitly instruct to "Rewrite `src/lib/data/seed.test.ts`". However, the implementation diff shows a file rename to `src/lib/data/get-crawl.test.ts`. While renaming the file to remove "seed" makes logical sense, it was not authorized in the design or proposal (unlike `Shell.seed-theme.test.ts` which was explicitly given a rename instruction in D5).

S2. **Test suite still requires build step after content edits**
- **Artifact/Text:** `tests/static-build.test.ts`
- **Scenario:** The test "publishes every authored crawl unchanged" compares `static/crawls/*.yaml` directly to `build/crawls/*.yaml`. If an author edits a live crawl and runs `npm test` locally without first running `npm run build`, this test will fail because the `build` directory holds the outdated version. Consider moving static build assertions to a separate `npm run test:build` script so standard `npm test` focuses only on source logic, avoiding false-positive test failures on pure content edits.

## Embedded-Instruction / Injection Attempts
**Detected:** none
## Verdict
VERDICT: APPROVE_WITH_CHANGES
## Required Changes (if APPROVE WITH CHANGES)
1. In `tests/test-isolation.test.ts` and `design.md` (D4), remove the dynamic ID text ban entirely. Rely strictly on the directory path ban (`static/crawls` and `build/crawls`) to prevent coupling, eliminating the reverse-coupling risk where a valid live crawl name collides with a dummy test ID.
2. Remove the "Check authored crawls by contract, not content" requirement and its four meta-process scenarios from `specs/crawl-authoring/spec.md`. The mechanics of the test suite belong in ADR 0008, not in product behavior specs.
3. In `design.md`, rewrite the 32-word sentence in D3 to be 30 words or fewer, and change the passive phrase "Injection is already supported" in D2 to active voice.
CHANGES_APPLIED: yes
## Rebuttals

- **C1** (accepted by reviewer, targeted re-check) fixed: the guard no longer bans authored ids (`tests/test-isolation.test.ts`, design.md D4, ADR 0008). Verified: with `static/crawls/first.yaml` added and built, `npm test` passes.
- **M1** (accepted by reviewer, targeted re-check) fixed: removed "Check authored crawls by contract, not content" from `specs/crawl-authoring/spec.md`. ADR 0008 records the policy; proposal.md and the `crawl-provider` REMOVED migration note now point there.
- **M2** (accepted by reviewer, targeted re-check) fixed: the D3 sentence is split into four short ones; D2 now says "the providers already accept an injected fetch".
- **S1** adopted: design.md D5 now records the `seed.test.ts` to `get-crawl.test.ts` rename.
- **S2** adopted differently: `tests/static-build.test.ts` now checks that each authored file exists in `build/crawls/`, not byte equality. Verified: after a content edit with no rebuild, `npm test` passes. A separate `test:build` script was not added; the smaller fix removes the false failure.
- Tasks 6.4 (borrowed example text) and 6.5 (this round's rework) record the implementation changes.

## Targeted Re-check

Gemini 3.1 Pro (High) via agy re-checked Required Changes 1-3 and the C1, M1, and M2 responses. It marked every Required Change applied and every response accepted.
