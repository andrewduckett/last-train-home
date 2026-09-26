# ADR Review Manifest

- Status: completed
- Review date: 2026-09-25

## Review Summary

ADR review completed for this change. The change makes no major durable architectural decision.

- Treating every location the same way, with an authored `label` instead of a kind the app understands, follows ADR 0006. That ADR already keeps travel words out of the app by making them authored text.
- Renaming keys and rejecting the retired ones at the build follows ADR 0004, which makes the build the check on authored records. It also follows ADR 0003, because the provider still carries the definition through without reading it.
- The tab name, its icon, and the tag styling are cheap to change later. `design.md` records why the author chose them.

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
