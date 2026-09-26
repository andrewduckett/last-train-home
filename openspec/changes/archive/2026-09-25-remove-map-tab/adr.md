# ADR Review Manifest

- Status: completed
- Review date: 2026-09-25

## Review Summary

ADR review completed for this change. The change makes no major durable architectural decision, but it contradicts one sentence of a proposed ADR.

- **ADR 0006 (proposed) says each crawl supplies "its own Google map URLs".** This change removes the map from the definition, so that sentence no longer holds. The map is a minor detail next to 0006's real decision, which gives schedule entries three authored meanings. Removing a map is also cheap to reverse. So this change does not write a new ADR. Because 0006 is still proposed, its owner can drop the map sentence before accepting it. This manifest records the conflict until then.
- **ADRs 0003 and 0004 mention "a map" in their Context sections,** when they describe what a crawl contains. That is background, not a decision, so nothing conflicts.
- **ADR 0002 (accepted) sets the CSP posture.** `frame-src 'none'` tightens the policy within that posture. It adds no inline script and no cross-origin source, so 0002 holds as written.
- Rejecting a leftover `map` key at the build follows ADR 0004. The provider still carries the definition through without reading it, as ADR 0003 requires.

## In-Force ADRs Reviewed

No ADR supersedes another. ADRs 0001 to 0004 are accepted and in force. ADRs 0005 to 0007 are proposed, and the author read them as context.

- 0001 Static-first SvelteKit on Cloudflare static assets (accepted)
- 0002 Strict CSP via build-time script hashing (accepted)
- 0003 Crawl behind a provider interface (accepted)
- 0004 Hand-edited YAML crawl records (accepted)
- 0005 Per-crawl device checks behind a store (proposed)
- 0006 Author-driven itinerary definition (proposed)
- 0007 Generated theme tokens from one palette source (proposed)

## New Durable ADRs Created

- None. This change introduces no major durable architectural decision, and it creates no new repository-level ADR file.
