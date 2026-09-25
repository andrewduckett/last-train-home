# ADR Review Manifest

- Status: completed
- Review date: 2026-09-25

## Review Summary

ADR review completed for this change. The change makes no major durable architectural decision.

- Rendering authored text only as Svelte text nodes, with no `{@html}`, follows the posture that ADR 0002 already records.
- Interpreting `intro` in a domain module, not in the provider, follows ADR 0003.
- The parser's syntax rules and its flat-run output are easy to change later. `design.md` records why the author chose them.

## In-Force ADRs Reviewed

No ADR supersedes another, so all seven are in force.

- 0001 Static-first SvelteKit on Cloudflare static assets (accepted)
- 0002 Strict CSP via build-time script hashing (accepted)
- 0003 Crawl behind a provider interface (proposed)
- 0004 Hand-edited YAML crawl records (proposed)
- 0005 Per-crawl device checks behind a store (accepted)
- 0006 Author-driven itinerary definition (proposed)
- 0007 Generated theme tokens from one palette source (accepted)

## New Durable ADRs Created

- None. This change introduces no major durable architectural decision, and it creates no new repository-level ADR file.
