# ADR Review Manifest

- Status: completed
- Review date: 2026-09-26

## Review Summary

This change makes no major durable architectural decision, and it conflicts with no ADR.

- **The design makes four choices, and each is cheap to reverse.** It generates the tiles from the palette, rasterizes with a dev dependency, leaves `start_url` out, and keeps the head tags in `app.html`. Each choice lives in one script, one JSON file, or a few template lines.
- **ADR 0001 (accepted) keeps the site static.** The manifest and icons are static files, and the generator runs only at build time. No server code ships, and the change adds no service worker.
- **ADR 0002 (accepted) sets the CSP posture.** The manifest and icons are same-origin, so `default-src 'self'` and `img-src 'self'` already cover them. The change adds no script and no policy source.
- **ADR 0005 (proposed) keeps checklist state per device behind a store.** On iOS, the full-screen app gets storage separate from Safari. So one phone can hold two checklists for a crawl: one in Safari and one in the home-screen app. Each still lives behind the same store and the same `crawl-checks:<id>` key. The ADR's decision holds. Its owner may want to name this platform effect in Consequences before accepting it.
- **ADR 0007 (proposed) keeps every UI color in one palette source.** The generator reads the tile colors from the palette. A test holds the one hand-written color, `theme-color` in `app.html`, equal to the palette's `board` color.
- **ADRs 0003, 0004, and 0006** cover the provider, crawl records, and the itinerary. This change touches none of them.

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

- None.
