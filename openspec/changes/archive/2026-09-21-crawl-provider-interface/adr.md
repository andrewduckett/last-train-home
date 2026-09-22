# ADR Review Manifest

- Status: completed
- Review date: 2026-09-21

## Review Summary

The change author completed the ADR review for this change against the in-force ADRs
listed below. This change introduces the crawl provider interface — a system boundary
that later stories depend on to swap the crawl's source without changing the screens.
That is an expensive-to-reverse call, so it earns a durable ADR.

## In-Force ADRs Reviewed

- `0001-static-first-sveltekit-on-cloudflare-static-assets.md` — static-first SvelteKit
  with `adapter-static`; still in force and unaffected.
- `0002-strict-csp-via-build-time-script-hashing.md` — strict CSP via build-time script
  hashing; still in force and unaffected.

## New Durable ADRs Created

- `0003-crawl-behind-a-provider-interface.md` — the shell obtains the crawl through
  `getCrawl(id)` and passes it to its views; the provider validates identity and carries the
  definition through, so the source can change without rewriting the screens.
