## REMOVED Requirements

### Requirement: App-loaded assets are same-origin, fonts self-hosted

**Reason**: Its scenario "The map frame is the only cross-origin frame" no longer applies, because the app frames nothing. OpenSpec cannot drop a scenario from a modified requirement, so this change replaces the requirement.

**Migration**: The added "Same-origin assets, self-hosted fonts, and no frames" requirement keeps the same-origin and font rules, and requires `frame-src 'none'`.

## ADDED Requirements

### Requirement: Same-origin assets, self-hosted fonts, and no frames

Every script, style, font, and image the app document loads SHALL be same-origin. Fonts SHALL be self-hosted and bundled at build time. The served Content Security Policy SHALL set `frame-src` to `'none'`, so the app document loads no frames from any origin, its own included.

#### Scenario: The app document loads only same-origin assets

- **WHEN** the built site loads its shell
- **THEN** the scripts, styles, fonts, and images the document itself requests come only from its own origin


#### Scenario: The policy allows no frames

- **WHEN** the served Content Security Policy is inspected
- **THEN** its `frame-src` directive is exactly `'none'`

#### Scenario: The policy names no map provider

- **WHEN** the served Content Security Policy is inspected
- **THEN** it lists no `https://www.google.com` source in any directive
