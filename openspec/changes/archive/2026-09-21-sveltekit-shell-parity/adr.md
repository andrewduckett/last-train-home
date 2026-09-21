# ADR Review Manifest

- Status: completed
- Review date: 2026-09-20

## Review Summary

The author screened `design.md` for lasting architecture decisions and recorded the two that qualify. This is the first change in the repository, so no accepted decisions existed to review. The two decisions are the framework, hosting, and rendering stack, and the mechanism that upholds the strict Content Security Policy. Later work builds on both, and both would be costly to reverse. An independent cross-model reviewer (codex CLI) then checked these decisions and the ADR prose. That review is recorded in `review.md`. The author created the `docs/decisions/` directory and its template as part of this change.

## In-Force ADRs Reviewed

- None — `docs/decisions/` had no in-force ADRs before this change.

## New Durable ADRs Created

- `docs/decisions/0001-static-first-sveltekit-on-cloudflare-static-assets.md` — the static-first SvelteKit + `adapter-static` stack, rendering, and hosting choice.
- `docs/decisions/0002-strict-csp-via-build-time-script-hashing.md` — upholding `script-src 'self'` with no `'unsafe-inline'`, admitting only inline scripts the build authorizes by hash.
