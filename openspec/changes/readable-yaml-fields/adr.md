# ADR Review Manifest

- Status: completed
- Review date: 2026-09-25

## Review Summary

ADR review completed for this change. The change makes no major durable architectural decision.

- The new key names are a requirement, not a fork between approaches. The `crawl-authoring` spec owns them.
- Rejecting the retired keys at the build, rather than translating them in the provider, follows ADR 0003 and ADR 0004. Those ADRs keep the provider free of definition knowledge and make the build the check on authored records.
- Keeping task ids stable, so saved checks survive, follows ADR 0005.
- The retired-key table and the error text are cheap to change later. `design.md` records why the author chose them.

## In-Force ADRs Reviewed

No ADR supersedes another, so all seven are in force.

- 0001 Static-first SvelteKit on Cloudflare static assets (accepted)
- 0002 Strict CSP via build-time script hashing (accepted)
- 0003 Crawl behind a provider interface (accepted)
- 0004 Hand-edited YAML crawl records (accepted)
- 0005 Per-crawl device checks behind a store (proposed)
- 0006 Author-driven itinerary definition (proposed)
- 0007 Generated theme tokens from one palette source (proposed)

## New Durable ADRs Created

- None. This change introduces no major durable architectural decision, and it creates no new repository-level ADR file.
