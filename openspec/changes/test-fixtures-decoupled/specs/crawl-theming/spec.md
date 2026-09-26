## ADDED Requirements

### Requirement: Keep shared surfaces consistent across crawls

Shared station-board surfaces and semantic checklist success styling SHALL stay the same across crawls. Only the accent and on-accent colors SHALL vary with a crawl's authored `color`.

#### Scenario: Two crawls with different colors open

- **WHEN** a crawler opens one crawl whose color is `amber` and another whose color is `teal`
- **THEN** both crawls show the same surface and checklist success styling, and only their accents differ

## REMOVED Requirements

### Requirement: Preserve the first crawl's accent

**Reason**: This requirement pinned one authored record's `color` value. The color is an authoring choice, so an author must be able to change it without breaking verification.

**Migration**: None for authors or crawlers. "Resolve an authored color to a crawl palette" still defines how any crawl's `color` selects its palette. "Keep shared surfaces consistent across crawls" keeps the shared-surface rule that this requirement also carried.
