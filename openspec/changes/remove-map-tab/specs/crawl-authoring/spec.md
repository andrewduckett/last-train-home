## REMOVED Requirements

### Requirement: Validate generic itinerary fields

**Reason**: The app no longer embeds a map, so three of this requirement's scenarios check map URLs that no longer exist. OpenSpec cannot drop a scenario from a modified requirement, so this change replaces the requirement.

**Migration**: The added "Validate schedule and quick-link fields" requirement keeps the schedule and link rules, and rejects a leftover `map` field.

## ADDED Requirements

### Requirement: Validate schedule and quick-link fields

The build SHALL require a schedule list and a quick-link list in each crawl definition. Each schedule entry SHALL have a supported kind, a non-empty time, and a non-empty title. A move SHALL have a non-empty, author-written mode. Every kind SHALL allow an optional note or tag, which SHALL be non-empty when present. Each link SHALL have a non-empty label, an optional hint, and an HTTP or HTTPS URL. The build SHALL reject a `map` field in the definition, because the app no longer embeds a map. Its error SHALL tell the author to link a route map from `links`. Validation SHALL identify the record and field when these rules fail.

#### Scenario: A walking crawl has no quick links

- **WHEN** a record has a valid walking move and an empty quick-link list
- **THEN** build validation accepts that record

#### Scenario: A move lacks its mode

- **WHEN** a move has no non-empty mode
- **THEN** build validation fails and identifies the move's mode field

#### Scenario: A move has an optional note

- **WHEN** a move has a valid mode and a non-empty note
- **THEN** build validation accepts the entry

#### Scenario: An old schedule kind remains

- **WHEN** an entry uses `arrive`, `depart`, or `warning`
- **THEN** build validation fails and identifies the entry's kind field

#### Scenario: A link uses an unsafe scheme

- **WHEN** a quick link uses a URL scheme other than HTTP or HTTPS
- **THEN** build validation fails and identifies the link's URL field

#### Scenario: An authored container is missing

- **WHEN** a record lacks a schedule list or a link list
- **THEN** build validation fails and identifies the missing field

#### Scenario: A leftover map is rejected

- **WHEN** an authored crawl contains `definition.map`
- **THEN** build validation fails, identifies `definition.map`, and says to link a route map from `links`

#### Scenario: A crawl without a map is accepted

- **WHEN** an otherwise valid crawl has no `map` field
- **THEN** build validation accepts the crawl
