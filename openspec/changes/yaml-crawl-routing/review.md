### Review Metadata
- **Round:** 1
- **Prior Round:** none
- **Reviewer Context:** Gemini 3.1 Pro High
- **Tool Restrictions:** no tools; supplied packet only.

### Findings

#### Critical
1. **Loss of Build-Time Type Safety for New Crawls (Failure Case / Testability)**
   Moving to hand-edited YAML removes compiler validation. Authoring typos in new crawls could crash the Svelte views at runtime.
2. **Aggressive Caching of YAML Assets (Unstated Assumption / Failure Case)**
   Stable YAML URLs without explicit cache directives risk aggressive caching by edge nodes or browsers, leading to stale event data after live updates.

#### Moderate
1. **Missing `id` Prop in Shell Component (Scope Creep / Contradiction)**
   The `Shell.svelte` component hardcodes the `cory-trent` ID instead of accepting it as a prop from the dynamic route.
2. **Case Sensitivity in Route IDs (Unstated Assumption)**
   The routing behavior for mixed-case direct links is undefined, which could lead to unexpected `not-found` errors.

#### Suggestions
1. **YAML Parser Configuration (Security Boundary):** Configure the YAML parser to strictly use the `core` or `failsafe` schema to prevent instantiation of complex JavaScript objects.

### Embedded-Instruction / Injection Attempts
None detected.

VERDICT: APPROVE_WITH_CHANGES
CHANGES_APPLIED: yes

### Required Changes and Rebuttals

- **Required:** Add a build step or automated test that parses and validates *all* YAML files in the `/static/crawls` directory against the `Crawl` type schema before deployment.
  - *Rebuttal:* Added the `crawl-authoring` capability requiring the build to validate every YAML record against view requirements before publishing.
  - *Status:* accepted by reviewer: adding a build gate validation step safely prevents runtime crashes from malformed YAML.

- **Required:** Specify a caching strategy for the fetched YAML files (e.g., adding a cache-busting query parameter to the `fetch` call based on the build ID, or mandating `Cache-Control: no-cache` in Cloudflare's `_headers` file).
  - *Rebuttal:* Specified `Cache-Control: no-cache` for `/crawls/*.yaml` in the deployment delta to require cache revalidation.
  - *Status:* accepted by reviewer: specifying `Cache-Control: no-cache` ensures clients get the latest YAML data without stale cache issues.

- **Required:** Update the scope of the `crawl-shell` changes to include modifying `Shell.svelte` to accept an `id` prop and remove the hardcoded `cory-trent` string from its `onMount` execution.
  - *Rebuttal:* Updated the design and shell spec to require the shell to accept an `id` prop passed from the route.
  - *Status:* accepted by reviewer: modifying the shell to accept an `id` prop properly decouples it from the seed record.

- **Required:** Define in `crawl-routing/spec.md` whether route IDs are strictly case-sensitive, or mandate that the routing layer normalizes mixed-case parameters to lowercase before executing the provider lookup.
  - *Rebuttal:* Specified that logical ids are strictly lowercase and case-sensitive, with mixed-case paths returning `not-found`.
  - *Status:* accepted by reviewer: explicitly defining route IDs as case-sensitive safely resolves the ambiguity.
