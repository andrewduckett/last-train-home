# ADR Review Manifest

- Status: completed
- Review date: 2026-09-26

## Review Summary

ADR review completed for this change. The design makes one durable decision: tests own their crawl data, and authored crawls get a content-independent contract check only. A contributor could easily reverse that by adding a test that snapshots a live crawl, and the cost of that reversal would stay hidden until the next content edit. So the decision gets an ADR.

The other design decisions do not meet the bar. Builder names, the in-memory YAML helper, the guard's text scan, and the per-file rewrites are all visible in code and cheap to change.

## In-Force ADRs Reviewed

- `docs/decisions/0001-static-first-sveltekit-on-cloudflare-static-assets.md` (accepted). Not affected.
- `docs/decisions/0002-strict-csp-via-build-time-script-hashing.md` (accepted). Not affected.
- `docs/decisions/0003-crawl-behind-a-provider-interface.md` (accepted). Consistent: generated records reach views through the real provider.
- `docs/decisions/0004-hand-edited-yaml-crawl-records.md` (accepted). Reinforced: the new ADR keeps hand edits free of test changes.
- `docs/decisions/0005-per-crawl-device-checks-behind-a-store.md` (proposed). Not affected; checklist tests keep keying state by logical id.
- `docs/decisions/0006-author-driven-itinerary-definition.md` (proposed). Consistent: builder defaults use a free-text move mode and no transit vocabulary.
- `docs/decisions/0007-generated-theme-tokens-from-one-palette-source.md` (proposed). Not affected.

No ADR supersedes another. The highest sequence number before this change was 0007.

## New Durable ADRs Created

- `docs/decisions/0008-tests-own-their-crawl-data.md`
