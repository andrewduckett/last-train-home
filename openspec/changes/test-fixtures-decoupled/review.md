## Review Metadata
- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (Gemini via agy, plan mode)
- **Tool restrictions**: read-only; no tools called; embedded files only
- **Artifacts reviewed**: proposal.md, design.md, specs/, adr.md, docs/decisions/0008, relevant source files
## Findings
### 🔴 Critical (blocking)
C1. **Guard test string ban breaks `root-route.test.ts`**
- **Artifact/Text:** `design.md` (D4, D5) and `src/routes/root-route.test.ts`
- **Scenario:** D4 mandates the guard test fails if any scanned test contains the literal string `cory-trent`. D5 states `routes/root-route.test.ts` should "Keep the checks on the +page.svelte source." The existing test asserts `expect(source).not.toContain('cory-trent');`. Because this assertion physically contains the banned string, `root-route.test.ts` will fail the guard test immediately.

C2. **Contradiction between D3 and D4 on exempted contract tests**
- **Artifact/Text:** `design.md` (D3, D4)
- **Scenario:** D3 is titled "One contract test owns the authored crawls" and explicitly names `tests/authored-crawls.test.ts`. However, D4 exempts "the two contract tests (D3)" from the ban on the string `build/crawls`. If `tests/static-build.test.ts` (which checks `build/crawls/`) is not explicitly codified as the second contract test in D3, it will fail the D4 guard scan. The D3 header and text directly contradict the D4 exemption count.

C3. **Untestable meta-process scenarios**
- **Artifact/Text:** `specs/crawl-authoring/spec.md` (ADDED Requirements)
- **Scenario:** Scenarios like "An author edits a crawl's content" define their THEN as "verification passes without any change to a test." Test suites mechanically assert software runtime behavior, state, or build output; they cannot assert the hypothetical absence of future test failures against human commits. These belong in ADRs or workflow guidelines, not in behavioral delta specs.

### 🟡 Moderate
M1. **Plain Language (ISO 24495) Violations**
- **Artifact/Text:** Multiple files
- **Scenario:**
  - **>30 words & Passive Voice:** `specs/crawl-authoring/spec.md` has a 54-word sentence using passive voice: "The build SHALL reject each retired key and SHALL name the key that replaces it: `definition.venues`, replaced by `places`; a `places` list inside a stop, replaced by `locations`..." (Fix: Break into bullets; use active "which [key] replaces").
  - **Two words for one concept:** `adr.md` introduces "engineer", while other artifacts consistently use "author" or "crawler/participant".
  - **Filler:** `design.md` Context says "This section covers only what shapes the approach."

M2. **Cheaper alternative not considered for YAML Shell tests**
- **Artifact/Text:** `design.md` (D2)
- **Scenario:** D2 forces Shell UI tests to serialize generated crawls to YAML via `yamlProvider`, only to parse them back in the component. This couples UI tests to the YAML stringifier's exact formatting output. A cheaper alternative is stubbing `getCrawl` to return the `Crawl` object directly for Shell tests, restricting YAML serialization/parsing strictly to the provider's own unit tests.

### 📌 Suggestions
S1. **Brittle ID string ban in guard test**
- **Artifact/Text:** `design.md` (D4)
- **Scenario:** Banning the literal string `cory-trent` prevents coupling to the current live crawl but does not protect against a developer hardcoding a future live crawl (e.g., `summer-bash.yaml`). Relying solely on the directory path ban (`static/crawls`) is a more robust, long-term guard against reading live data without playing whack-a-mole with IDs.

## Embedded-Instruction / Injection Attempts
**Detected:** none
## Verdict
VERDICT: APPROVE_WITH_CHANGES
## Required Changes (if APPROVE WITH CHANGES)
1. In `design.md` (D5), explicitly instruct the removal or dynamic construction of the `cory-trent` string in `root-route.test.ts` (e.g., asserting `expect(source).not.toContain(defaultCrawl)` instead of the literal string).
2. Clarify in `design.md` (D3/D4) exactly which two tests are exempted from the text scan, resolving the "One contract test" vs "two contract tests" contradiction and ensuring `tests/static-build.test.ts` is protected.
3. Remove the untestable meta-process scenarios ("An author edits a crawl's content", "An author adds a crawl") from `specs/crawl-authoring/spec.md`, leaving only mechanically assertable requirements.
4. Rewrite the 54-word list in `specs/crawl-authoring/spec.md` to use active voice and multiple sentences/bullets. Consolidate "engineer/author" terminology in `adr.md` and remove the filler sentence in `design.md`.
CHANGES_APPLIED: yes
## Rebuttals

- **C1** (accepted by reviewer, targeted re-check) fixed: design.md D5 now has `root-route.test.ts` assert against the value of `defaultCrawl`, not a spelled-out id.
- **C2** (accepted by reviewer, targeted re-check) fixed: design.md D3 now names both contract tests (`tests/authored-crawls.test.ts`, `tests/static-build.test.ts`), and D4 exempts exactly those plus the shared check module.
- **C3** (accepted by reviewer, targeted re-check) fixed by rewrite, not removal: both scenarios in `specs/crawl-authoring/spec.md` now state a mechanically checkable THEN. design.md D3 adds a directory-parameterized check that tests run on a temporary directory of generated records.
- **M1** (accepted by reviewer, targeted re-check) fixed: the retired-key list in `crawl-authoring` now uses short active bullets; `adr.md` says "contributor"; the filler sentence in design.md Context is gone. "Author" (someone who edits a crawl) and "contributor" (someone who edits code) are distinct concepts, so both terms stay.
- **M2** (accepted by reviewer, targeted re-check) fixed: design.md D2 now uses an in-memory `recordProvider` for Shell and route tests. Only provider tests use the YAML helpers.
- **S1** adopted: design.md D4 now bans every authored id that the guard reads from `static/crawls`, not only one literal id.
- Also aligned proposal.md line on the contract check with D3 (follows from Required Change 2).

## Targeted Re-check

Gemini 3.1 Pro (High) via agy re-checked Required Changes 1-4 and the C1, C2, C3, M1, and M2 responses. It marked every Required Change applied and every response accepted, and confirmed the proposal.md alignment falls within Required Change 2.
