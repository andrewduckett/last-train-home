# ADR Review Manifest

- Status: completed
- Review date: 2026-09-26

## Review Summary

This change makes no major durable architectural decision, and it conflicts with no ADR.

- **The design makes four choices, and each is cheap to reverse.** It uses the Bold preset, renders icons inline through one component, colors each tab button with a token, and tests the SVG style rules. Each choice lives in a few files. Replacing the icons later touches only the icon folder and `Shell.svelte`.
- **ADR 0002 (accepted) sets the CSP posture.** Inline SVG markup is not a script. The icons add no inline script and no cross-origin source, so 0002 holds as written. The icon test also rejects `<script>` elements and `on*` attributes in the SVG files.
- **ADR 0007 (proposed) keeps every UI color in one palette source.** The SVGs carry no color values, only `currentColor`. The shell colors them with existing tokens, so the palette source stays the only place colors live. The existing contrast pairs already cover the two tokens the icons use.
- **ADRs 0001 and 0003 to 0006** cover hosting, the provider, crawl records, device checks, and the itinerary. This change touches none of them.

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
