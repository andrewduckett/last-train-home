## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (Gemini 3.1 Pro via agy CLI)
- **Tool restrictions**: read-only (plan mode, sandbox)
- **Artifacts reviewed**: proposal.md, design.md, specs/, relevant source files

## Findings

### 🔴 Critical (blocking)

1. **Parser ambiguity for overlapping runs (Stack operations)**
   - **Artifact**: `design.md` (Decision: Parsing steps)
   - **Text**: "Match each closer with the nearest open opener of the same length, using a stack."
   - **Finding**: This describes searching deep into a stack but fails to specify what happens to unclosed openers above the match. For example, in `*a **b* c**`, when the length-1 closer is matched, is the length-2 opener popped and discarded (rendered as literal text)? If it is left in place, the structure is not a stack. The design must explicitly define how interleaved markers resolve.

2. **Parser ambiguity for dual-purpose runs (Intra-word markers)**
   - **Artifact**: `design.md` (Decision: Parsing steps)
   - **Text**: "A run of length 1, 2, or 3 can open... It can close..."
   - **Finding**: The steps do not specify precedence when a run is both preceded and followed by non-whitespace (e.g., the middle `*` in `a*b*c`). It must state whether the run attempts to close first, and if no match is found, whether it then acts as an opener. Without this, the parsing of intra-word formatting is undefined.

### 🟡 Moderate

1. **Broken nesting by design**
   - **Artifact**: `design.md` (Decision: Delimiter details kept simple) and `specs/crawl-shell/spec.md`
   - **Text**: "Delimiter runs must match in length... This avoids CommonMark's rule for splitting runs."
   - **Finding**: By rejecting run-splitting, standard nesting like `*italic **both***` breaks because the string ends with a length-3 run, which will not match the length-1 and length-2 openers. The `***` will thus render literally, which will surprise authors. The spec does not document this edge case, nor is there a scenario covering it.

2. **Plain Language - Contradictory phrasing**
   - **Artifact**: `design.md` (Decision: Parsing steps)
   - **Text**: "Each run's flags come from the set of open, matched spans that cover it."
   - **Finding**: A span cannot be both "open" (unmatched/ongoing) and "matched" (closed) at the same time. This violates the ISO 24495 understandability principle.

3. **Plain Language - Elegant Variation & Contradiction**
   - **Artifact**: `proposal.md` vs `specs/crawl-shell/spec.md`
   - **Text**: `proposal.md` states "A line that holds only spaces counts as blank", while the spec states "A line that holds only whitespace SHALL count as blank."
   - **Finding**: Using two different terms (spaces vs whitespace) for the same concept is elegant variation and introduces a technical contradiction, since whitespace includes tabs.

4. **Plain Language - Passive voice**
   - **Artifact**: `specs/crawl-shell/spec.md` (Requirement: Crawl introduction)
   - **Text**: "An opening marker SHALL NOT be followed by whitespace, and a closing marker SHALL NOT be preceded by whitespace."
   - **Finding**: This uses passive voice. Rewrite in active voice (e.g., "Whitespace SHALL NOT follow an opening marker...").

### 📌 Suggestions

1. **Add spec scenario for intra-word formatting**
   - **Artifact**: `specs/crawl-shell/spec.md`
   - **Finding**: `design.md` explicitly supports intra-word markers like `Cory*and*Trent`, but the spec lacks a scenario asserting this behavior. Adding one would make this requirement mechanically assertable.

## Embedded-Instruction / Injection Attempts

**Detected:** none detected

## Verdict

VERDICT: REVISE

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: n/a

## Rebuttals
