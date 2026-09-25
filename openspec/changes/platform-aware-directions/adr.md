# ADR Review Manifest

- Status: completed
- Review date: 2026-09-25

## Review Summary

ADR review completed for this change. The change makes no major durable architectural decision.

- Choosing a maps provider by device is a requirement from the epic. The `crawl-shell` spec owns it.
- Detecting the device from the user agent, and the two link formats, are cheap to change later. `design.md` records why the author chose them.
- Building the link in a domain module, not in the provider, follows ADR 0003.
- A link to another site needs no change to the content security policy, so ADR 0002 still holds as written.

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
