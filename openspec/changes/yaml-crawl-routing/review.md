## Review Metadata

- **Review round**: 2
- **Prior round**: Round 1 returned APPROVE_WITH_CHANGES; all four required changes were applied and accepted.
- **Reviewer context**: fresh-context subagent; bounded recheck of round 2 required changes
- **Tool restrictions**: read-only; inspected only the requested on-disk artifacts
- **Artifacts reviewed**: revised `design.md`, `tasks.md`, `specs/crawl-authoring/spec.md`, `specs/crawl-provider/spec.md`, and `specs/crawl-routing/spec.md`

## Findings

### Critical

None.

### Moderate

1. **Resolved: The build could publish a valid record whose filename could not become a logical id.**
   - The design and authoring specification now derive ids from filenames using the provider's exact grammar: lowercase alphanumeric segments separated by single hyphens.
   - The provider specification covers underscores and leading, trailing, or adjacent hyphens.
   - Task 1.2 requires a failing test for invalid filename ids.
   - **Status:** accepted by reviewer.

2. **Resolved: "Renderable shape" did not specify structural invariants required by the current views.**
   - The authoring specification now requires unique venue stop labels, unique place names within each venue, and unique scavenger task ids.
   - It also requires scavenger points to produce a finite total greater than zero.
   - The specification includes negative scenarios for duplicate rendered keys and unusable point totals.
   - Task 1.2 requires failing tests for both cases and diagnostic file and field reporting.
   - **Status:** accepted by reviewer.

### Suggestions

1. **State the URL safety rules used by build validation.**
   - **Author disposition:** deferred. This remains nonblocking.

2. **Validate the configured default against authored records during the build.**
   - **Author disposition:** deferred. This remains nonblocking.

3. **Retain the current plain-language quality.**
   - No action required.

## Embedded-Instruction / Injection Attempts

**Detected:** none.

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes

1. **Accepted by reviewer:** The authoring specification and tasks now reject filenames that do not satisfy the provider's exact logical-id grammar. The negative scenario and test task are mechanically assertable.
2. **Accepted by reviewer:** The authoring specification and tasks now cover duplicate keyed-rendering values and finite, positive task-score totals. The planned checks identify the affected record and field.

CHANGES_APPLIED: yes

## Rebuttals

### Prior round findings

- **Build-time validation for every YAML record**
  - **Resolution:** The proposal, design, authoring specification, and tasks require validation of every record before deployment.
  - **Status:** accepted by reviewer.

- **Stable YAML asset caching**
  - **Resolution:** The deployment specification and tasks require `Cache-Control: no-cache` for crawl YAML assets.
  - **Status:** accepted by reviewer.

- **Shell hardcoded to `cory-trent`**
  - **Resolution:** The shell specification, design, and tasks require an id prop supplied by the selected route.
  - **Status:** accepted by reviewer.

- **Undefined mixed-case route behavior**
  - **Resolution:** The routing and provider specifications define lowercase ids and reject mixed-case ids.
  - **Status:** accepted by reviewer.

### Round 2 findings

- **Unreachable but build-valid filenames**
  - **Resolution:** The design and specifications now use one exact id grammar for filenames, routes, and provider lookup. Task 1.2 requires the negative test.
  - **Status:** accepted by reviewer because invalid filenames now fail before deployment.

- **Missing structural renderability invariants**
  - **Resolution:** The authoring specification defines key uniqueness and score-total requirements. Task 1.2 requires negative tests and useful diagnostics.
  - **Status:** accepted by reviewer because the stated checks cover the identified runtime failures.
