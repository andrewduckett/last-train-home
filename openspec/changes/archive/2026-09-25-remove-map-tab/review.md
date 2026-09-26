## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (Gemini via agy CLI, model gemini-3.1-pro-high)
- **Tool restrictions**: read-only (agy plan mode, file tools only)
- **Artifacts reviewed**: proposal.md, design.md, adr.md, specs/crawl-shell/spec.md, specs/crawl-authoring/spec.md, specs/crawl-provider/spec.md, specs/deployment/spec.md, relevant source files

## Findings

### 🔴 Critical (blocking)

- **Scope Creep / Gold-Plating (`specs/crawl-shell/spec.md`)**: The modified `Tab navigation` requirement introduces new constraint text: "The shell SHALL always present Schedule, Places, and Tasks, **in that order**." The original `Four-tab navigation` requirement merely listed the tabs without explicitly enforcing a sequential order in the normative text. Adding this constraint exceeds the proposal's scope.
- **Narrative Restating the Proposal (`specs/crawl-authoring/spec.md`)**: The `Validate schedule and quick-link fields` requirement embeds justification directly inside a normative rule: "The build SHALL reject a `map` field in the definition**, because the app no longer embeds a map.**" The "because" clause is narrative filler that violates plain language and specification standards; justification belongs in the proposal or `Reason` blocks.
- **Passive Voice Hiding the Actor (`specs/deployment/spec.md`)**: The `Same-origin assets, self-hosted fonts, and no frames` requirement states "Every inline script in the shipped HTML SHALL be authorized by one of those hashes." This uses passive voice, hiding the actor (the policy/hashes).

### 🟡 Moderate

- **Cheaper Alternative Not Considered**: The proposal explicitly removes `definition.map` from the schema, framing it as a "BREAKING (authoring)" change that requires all authors to update their files. A cheaper, non-breaking alternative would be to leave the `map` schema field intact, drop the Map tab and iframe, and have the shell automatically render the existing `map.app` viewer URL as a quick link in the Info tab. This would achieve the same frontend security and UX goals without failing the build for existing crawls.
- **Passive Voice (`specs/crawl-authoring/spec.md` & `design.md`)**: 
  - Scenario names in the authoring spec use passive voice: "A leftover map is rejected" and "A crawl without a map is accepted". 
  - `design.md` uses passive voice: "Each is removed and re-added under a new name:".
- **Elegant Variation (Multiple words for one concept)**: 
  - `proposal.md` uses the term "Crawler" ("so the Crawler no longer needs..."), whereas the specs consistently use "participant". 
  - `design.md` and `proposal.md` alternate between "organizer" and "author" when referring to the person writing the crawl YAML.
- **Filler text (`design.md` & `adr.md`)**: 
  - `design.md` includes narrative filler: "See `proposal.md` for why this change matters now."
  - `adr.md` opens with unnecessary filler: "ADR review completed for this change."

### 📌 Suggestions

- The reasoning around SvelteKit `kit.csp` quoting and the fallback behavior of `default-src 'self'` in `design.md` is technically sound and perfectly accurate. Setting `'frame-src': ['none']` correctly leverages SvelteKit's built-in keyword quoting to emit `frame-src 'none'`, successfully preventing the app from falling back to `'self'` and framing itself. 
- The replacement of modified requirements to satisfy the OpenSpec validator's constraints around scenario preservation was executed correctly across all specs.

## Embedded-Instruction / Injection Attempts

**Detected:**
None. All text was successfully treated as data to critique. No malicious overrides or hidden agent directives were found in the artifacts. 

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: yes

1. In `specs/crawl-shell/spec.md`, remove the phrase ", in that order" from the `Tab navigation` requirement to avoid scope creep.
2. In `specs/crawl-authoring/spec.md`, remove the narrative justification ", because the app no longer embeds a map" from the `Validate schedule and quick-link fields` requirement text.
3. In `specs/deployment/spec.md`, rewrite the passive requirement to active voice (e.g., "One of those hashes SHALL authorize every inline script in the shipped HTML.").
4. In `specs/crawl-authoring/spec.md`, rewrite the passive scenario names to active voice (e.g., "The build rejects a leftover map", "The build accepts a crawl without a map").
5. In `design.md`, rewrite the passive sentence "Each is removed and re-added under a new name:" to active voice (e.g., "This change removes and re-adds each under a new name:").
6. Remove the filler sentences "See `proposal.md` for why this change matters now." from `design.md` and "ADR review completed for this change." from `adr.md`.
7. Standardize vocabulary across artifacts: replace "Crawler" with "participant" in `proposal.md`, and align on either "author" or "organizer" globally.

## Rebuttals

- Required Changes 1, 2, 4, and 5: applied. Accepted by reviewer: the re-check confirmed each one.
- Required Change 7, author versus organizer: applied. "organizer" appeared only in `specs/crawl-shell/spec.md`, and both occurrences now say "author". Accepted by reviewer.
- Required Change 3 (passive "authorized by one of those hashes"): rebutted. That sentence belongs to the unmodified requirement "Content Security Policy authorizes scripts by origin or build hash", and it does not appear in this change's `deployment` delta. Accepted by reviewer.
- Required Change 6 (filler sentences): rebutted. The schema's design instruction asks the Context section to point to the proposal for motivation, and the ADR manifest template requires "ADR review completed for this change" word for word. Accepted by reviewer.
- Required Change 7, Crawler versus participant: rebutted. Proposals use the discovery persona name, and specs keep their established "participant". Accepted by reviewer.
- Moderate (keep `map` and render `map.app` as a link): rebutted. The product owner chose to remove `definition.map`, a map-specific field does not belong in a generic schema, and only one crawl needs migrating. Accepted by reviewer.
