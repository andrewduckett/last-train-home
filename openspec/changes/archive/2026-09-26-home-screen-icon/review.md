## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (OpenAI gpt-6-sol via codex CLI)
- **Tool restrictions**: read-only (codex read-only sandbox)
- **Artifacts reviewed**: proposal.md, design.md, adr.md, specs/deployment/spec.md, relevant source files

## Findings

### 🔴 Critical (blocking)

None.

### 🟡 Moderate

1. **Android installation is underspecified.** The [proposal](/home/andrew/Git/last-train-home/openspec/changes/home-screen-icon/proposal.md) promises an installable home-screen app while the manifest deliberately omits `start_url`. Chrome permits installation from its menu without a service worker, but its [published install-promotion criteria](https://web.dev/articles/install-criteria) still require `start_url`. The plan must distinguish a user-initiated menu installation from browser promotion and verify that the installed shortcut actually opens `/cory-trent` in standalone mode on Android Chrome. Checking JSON fields cannot establish that outcome.

2. **The stale-file gate can be erased by the build.** The [design](/home/andrew/Git/last-train-home/openspec/changes/home-screen-icon/design.md) says `build` regenerates icons and then a test detects stale committed files. The repo’s local gate runs build before tests, so regeneration would make that test pass even when the committed files were stale. Specify a check that runs *before* regeneration in the required local and CI workflow.

3. **The reopen claim is too strong.** The design says, “a reopen always fetches the latest.” [Shell.svelte](/home/andrew/Git/last-train-home/src/lib/Shell.svelte) fetches the crawl on mount; returning to an installed app may resume the existing page without mounting it again. `Cache-Control: no-cache` governs a request if one occurs. Revise the risk and acceptance text to require a fresh page load for author fixes to appear, unless foreground revalidation becomes part of this change.

4. **Plain-language edits are needed across the artifacts.** The proposal’s “at little cost” and the [ADR](/home/andrew/Git/last-train-home/openspec/changes/home-screen-icon/adr.md)’s “each is cheap to reverse” assert costs without evidence. The [spec](/home/andrew/Git/last-train-home/openspec/changes/home-screen-icon/specs/deployment/spec.md) alternates among “app-icon tile,” “tile files,” and “icon file” for the same asset. Use “icon” consistently and replace the cost claims with concrete reasons. The ADR’s four-choice recap largely repeats the design; shorten it to the decision-record consequence.

### 📌 Suggestions

- The full-screen, status-bar, home-screen icon, and launch-path outcomes need the planned phone checks. Vitest with jsdom cannot verify those rendered system surfaces; label the device checks as acceptance evidence in the spec.
- Add an explicit online-launch scenario. The change excludes a service worker, so an installed icon does not promise that a crawl loads without a connection.

## Embedded-Instruction / Injection Attempts

**Detected:** none.

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: yes

1. In proposal, design, and spec, state that Android acceptance uses Chrome’s user-initiated installation path, with no promise of browser install promotion. Require a device check that installs from `/cory-trent`, launches the icon, and confirms both `/cory-trent` and standalone display. State that a failed check requires revising the manifest strategy and spec before implementation is accepted.
2. Make `generate:icons --check` run before any icon-generating build in the required local and CI verification sequence; document that order in the design. Keep the test’s stale-file assertion, but do not present a post-build test as the gate for committed files.
3. Replace “a reopen always fetches the latest” with the accurate fresh-page-load condition. Update the corresponding risk text to tell the implementer how to verify an author fix after a full reload.
4. Apply the plain-language edits identified above in proposal, design, ADR, and spec.

## Rebuttals

All four required changes are applied. The first suggestion is applied, and the second is declined with a reason.

- **🟡 1. Android installation** — fixed. The proposal, design (decision 3 and Risks), and spec now say that Android uses Chrome's menu install, with no promise of an install prompt. The spec requires checks on a real iPhone and a real Android phone. They must confirm that the installed icon opens `/cory-trent` full screen. A failed check pauses the work until the manifest plan and the spec change.
- **🟡 2. Stale-file gate** — fixed. `build` now runs `generate:icons --check` first and fails on a stale file. Only `npm run generate:icons` rewrites the files. Design decision 1 documents the order and why it differs from the palette script. The spec scenario now says the build fails. The Verification table adds a check that plants a stale file and confirms the build fails before Vite runs.
- **🟡 3. Reopen claim** — fixed. The Risks entry now says a fix appears only after a fresh page load, such as closing the app from the app switcher. It also tells the implementer how to verify an author fix.
- **🟡 4. Plain language** — fixed. The spec, proposal, and design now use "app icon" for the asset throughout. The proposal's cost claim now gives a concrete reason: no new drawing. The ADR's four-choice recap is now one line on what reversal touches.
- **📌 Label device checks as acceptance evidence** — applied in the spec: "Checks on a real iPhone and a real Android phone SHALL confirm the home-screen scenarios before the change is accepted."
- **📌 Add an online-launch scenario** — declined. The proposal already lists offline support as out of scope (#17), and no requirement promises an offline launch. A scenario that only restates an exclusion adds no testable behavior.

Round-1 re-check (same reviewer) confirmed items 1 to 4 and accepted the declined suggestion. It flagged one actor-hiding passive: "before the change is accepted". The author fixed the phrase in the spec, the proposal, and the design. Each now says "before the repository owner merges the change", and the proposal and design name the implementer as the one who revises the plan.

Round-1 second re-check (same reviewer, gpt-6-sol via codex): `RECHECK: PASS`. Required Changes 1 to 4 are applied, the applied suggestion adds no problem, and the reviewer accepts the declined suggestion.
