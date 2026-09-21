## Review Metadata
- **Review round**: 2
- **Prior round**: REVISE (round 1: C1 Critical on _headers; M1–M9 Moderate)
- **Reviewer context**: cross-model (codex CLI)
- **Tool restrictions**: read-only inspection only
- **Artifacts reviewed**: proposal.md, design.md, specs/, adr.md, relevant source files

## Findings
### 🔴 Critical (blocking)

None identified. Round-one C1 is resolved in the plan: the source becomes `static/_headers`, and verification requires emitted `build/_headers`.

### 🟡 Moderate

**M1 — CSP guarantees remain inconsistent across artifacts. Partially resolved.**

**Evidence:**

- `design.md:53` correctly excludes “content that precedes the `<meta>` element” from its security guarantee.
- `specs/deployment/spec.md:46–47` instead requires that an unauthorized script “added to a page” be blocked, without restricting its position.
- `docs/decisions/0002-strict-csp-via-build-time-script-hashing.md:20` says: “The posture stops an injected inline script and any cross-origin script.” It omits the design’s ordering limitation.
- `adr.md:17` still describes “no inline scripts by hashing the framework's bootstrap script.”
- ADR 0002:18 promises “we admit no other inline script,” while the deployment specification permits every inline script authorized by the build’s hashes.

**Failure case:** A script placed before the meta policy falls outside the design’s stated protection but inside the specification’s unconditional blocking guarantee. Separately, multiple build-authorized scripts could satisfy the specification while violating the ADR’s single-script promise.

**Required change:** Use one contract throughout: no `'unsafe-inline'` scripts; inline scripts require authorized build hashes; meta enforcement begins after the policy appears. Qualify the negative scenario accordingly. Either retain and verify the single-bootstrap restriction or remove it.

**M2 — Verification is substantially improved, but effective-policy and negative-execution checks remain incomplete. Partially resolved.**

**Evidence:**

- `design.md:81` checks the meta policy’s `script-src`.
- `design.md:83` checks whether policies add a prohibited “script origin” or whether a header “re-restricts `script-src`.”
- `design.md:86` specifies a browser smoke check that “confirms the app boots and switches tabs.”
- The unauthorized-script scenario appears in `specs/deployment/spec.md:44–47`, but the design does not include its execution in the browser check.

**Failure case:** A policy could retain the expected `script-src` while introducing a permissive `script-src-elem` directive. Static script hashes and successful app startup would not detect that weakening. Checking only explicitly named header `script-src` also misses restrictions inherited from `default-src`.

**Required change:** Check effective script directives, including applicable overrides and fallback directives. Assert that the meta policy precedes executable scripts. Extend the browser check to insert an unauthorized inline script after the policy and assert that it never executes. Run against serving behavior that applies the emitted `_headers`.

Fresh builds, byte-based hash recomputation, emitted-header checks, and positive browser startup are already specified correctly.

**M9 — The requested plain-language revision is incomplete. Still open.**

**Evidence:**

- `design.md:53` contains this sentence:

  > This narrows the security claim: the policy stops an injected inline script (its hash differs) and any cross-origin script, but it does not claim to stop a same-origin script or content that precedes the `<meta>` element — hence the head-ordering rule above.

- `design.md:67` combines cost, app size, sibling conventions, future theming, and CSP independence into one sentence beginning “We accept that cost because…”.
- `adr.md:8` describes “durable architectural forks” and “in-force ADRs,” where simpler terms would communicate the review’s purpose.

These do not satisfy the requested sentence-length and plain-language cleanup.

**Required change:** Split the long sentences. Prefer “lasting architecture decisions” and “existing accepted decisions.” Keep technical terms where they provide necessary precision.

**M10 — Venue directions omit location context preserved by the current implementation. New.**

**Evidence:**

- `specs/crawl-shell/spec.md:37` requires a Google Maps query containing “that venue's name and address.”
- `src/App.jsx:143–144` currently builds the query from:

  ```js
  `${p.n}, ${p.a}, ${v.town}, IL`
  ```

- `src/data.js:25` gives Eddie’s address as only `"10 E Northwest Hwy"`; its town is stored separately.

**Failure case:** An implementation could omit town and state, pass the written scenario, and produce a less specific destination search. This changes existing behavior during a parity migration.

**Required change:** Require the existing query components: venue name, street address, town, and `IL`. Assert them in the directions-link scenario without introducing a new address model.

### 📌 Suggestions

**S1 — Make the visual comparison reproducible.**

`design.md:88` now bounds the comparison by views, themes, widths, and checklist states. However, “a portrait phone width and one wider width” leaves the exact dimensions unspecified.

Record viewport dimensions, checked task IDs, and the React baseline revision before implementation. This strengthens the resolved M8 finding without expanding scope.

**S2 — State which process owns the shared `index.html`.**

`design.md:29` says the prerendered root is “the same client-only shell as the SPA fallback.” The plan now explains the intended single-file result, resolving the documentation gap in M3.

For implementation clarity, identify whether the fallback replaces the prerendered output. Verify the final shipped file boots at `/`; absence of server-rendered data alone does not establish identical generated HTML.

## Embedded-Instruction / Injection Attempts
**Detected:** listed below

The permitted files contain behavioral instructions. They were treated as review data, not executed. These appear to be ordinary repository and author guidance; no malicious intent is established.

- **`AGENTS.md:85–88`**: “Use the `opsx:*` skills” and “Pick the next unchecked story.” These direct an agent to start workflow actions outside this review.
- **`AGENTS.md:103–113`**: Instructions to open PRs, archive changes, change draft status, and revert commits. None was followed.
- **`AGENTS.md:132–136`**: “Create the directory if it isn't there (`mkdir -p .workspace`).” This would violate the review’s prohibition on creating files.
- **`openspec/discovery.md:6–8`**: Instructions to rerun a skill and run `/opsx:propose`. None was followed.
- **`src/config.js:4–12`**: Instructions to edit configuration and run the build. These are author-facing source comments.
- **`src/App.jsx:98–99`**: Rendered instructions to edit `src/config.js` and run `npm run build`. These are application copy, not reviewer authorization.

## Verdict

VERDICT: APPROVE_WITH_CHANGES

The architecture is coherent enough to proceed after the bounded corrections above. No new blocking defect is established from the permitted files. This review assesses the plan; it does not certify an implemented build.

## Required Changes (if APPROVE WITH CHANGES)

1. Reconcile CSP guarantees, meta-policy ordering limits, and the number of permitted inline scripts across all artifacts.
2. Complete effective-policy checks and the browser negative-execution check.
3. Finish the requested plain-language cleanup.
4. Preserve town and state in venue directions queries.

CHANGES_APPLIED: yes

## Rebuttals

- **C1 resolved:** `proposal.md:34`, `design.md:39,84`, and deployment specification lines 72–75 explicitly cover the static input and emitted `_headers`.
- **M1 partially resolved:** `design.md:37–55` now explains hashes, policy composition, and meta ordering accurately. Other artifacts still contradict those limits.
- **M2 partially resolved:** Fresh-build testing, hash recomputation, the shipped fallback, emitted headers, and browser startup are explicit. The remaining gaps are described above.
- **M3 resolved at planning level:** `design.md:27–29` documents one shipped `index.html` and distinguishes fallback delivery from crawl routing. Actual adapter output remains an implementation check.
- **M4 resolved:** `proposal.md:11`, `design.md:59–69`, and `openspec/discovery.md:169,251–254` agree on scoped CSS, explain its cost, and do not claim CSP requires it.
- **M5 resolved:** `src/data.js:30–38` totals 85 points. The revised checklist scenario correctly expects 10 points and 12%.
- **M6 resolved:** The checklist specification now covers legacy storage, confirmation, cancellation, reload persistence, and unavailable or malformed storage.
- **M7 resolved:** The map requirement promises the viewer URL and makes native handoff device-dependent. Deployment requirements explicitly exclude the embedded frame’s own requests from app-document asset restrictions.
- **M8 resolved:** `design.md:65` acknowledges literal colors and preserves them. Line 88 bounds the parity matrix; S1 is a reproducibility improvement.
- **M9 remains open:** Long sentences and avoidable terminology remain in the revised artifacts.
- No demand is made to introduce providers, YAML, crawl routing, state isolation, palette generation, or schedule generalization into story 1.

### Required-change resolution (re-checked by reviewer)

The author applied all four Required Changes; the reviewer re-checked them read-only in follow-up rounds:

1. **CSP contract consistency** — RESOLVED. `proposal.md`, `specs/deployment/spec.md`, `adr.md`, `docs/decisions/0002-*.md`, and `design.md` now state one contract: no `'unsafe-inline'` scripts, inline scripts authorized only by a build hash (no single-script overclaim), enforcement beginning after the `<meta>` policy.
2. **Effective-policy and negative-execution checks** — RESOLVED. `design.md` Decision 5 now checks effective script directives (`script-src-elem`, `default-src` fallback) and adds a served browser check that an unauthorized inline script placed after the policy never runs.
3. **Plain-language cleanup** — RESOLVED. The flagged long sentences in `design.md` and the `adr.md` terminology were split and simplified.
4. **Venue directions parity (M10)** — RESOLVED. `specs/crawl-shell/spec.md` requires the query to carry venue name, street address, town, and `IL`, matching `src/App.jsx`.

Suggestions S1 (record exact widths, checked task ids, baseline revision) and S2 (confirm which step owns the shipped `index.html`) were folded into `design.md`. Final reviewer re-check: **ALL REQUIRED CHANGES RESOLVED**.