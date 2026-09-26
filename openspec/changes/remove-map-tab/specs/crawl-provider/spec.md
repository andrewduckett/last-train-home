## MODIFIED Requirements

### Requirement: Carry the definition through unchanged

The provider SHALL carry the crawl definition through unchanged. The definition contains the
header, schedule, places, scavenger tasks and rules, and quick links. The provider
SHALL NOT interpret, reshape, add, drop, or validate definition fields.

#### Scenario: The found crawl exposes its definition unchanged

- **WHEN** a caller reads a found crawl's definition
- **THEN** each value matches the source record without reshaping

#### Scenario: Color stays an unresolved name

- **WHEN** a found crawl carries a `color`
- **THEN** the provider exposes the authored string, not a resolved palette

### Requirement: Preserve the planned seed crawl

The YAML seed SHALL preserve the planned event's visible schedule wording, times, and entry order when its fields move to the generic itinerary schema. It SHALL preserve place and task content, link labels and destinations, and their authored order. The seed's route map SHALL survive as a quick link to the earlier map viewer URL. The seed SHALL use the new generic itinerary fields rather than retaining obsolete field names.

#### Scenario: The seed record matches the existing event

- **WHEN** the migrated cory-trent YAML record is compared with the earlier seed event
- **THEN** its rendered schedule wording, times, and order match the earlier event
- **THEN** its place, task, and link content and destinations match the earlier event
- **THEN** its Route map link opens the earlier map viewer URL
