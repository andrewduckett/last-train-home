## ADDED Requirements

### Requirement: Validate generic itinerary fields

The build SHALL require a schedule list, a quick-link list, and a map in each crawl definition. Each schedule entry SHALL have a supported kind, a non-empty time, and a non-empty title. A move SHALL have a non-empty, author-written mode. Every kind SHALL allow an optional note or tag, which SHALL be non-empty when present. Each link SHALL have a non-empty label, an optional hint, and an HTTP or HTTPS URL. The parsed origin of each map URL SHALL equal `https://www.google.com`. Embed paths SHALL equal `/maps/d/embed` or `/maps/embed`, or sit beneath those path segments. Viewer paths SHALL begin `/maps/` and SHALL NOT be embed paths. Validation SHALL identify the record and field when these rules fail.

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

#### Scenario: A map points outside the allowed provider

- **WHEN** a map embed URL is not an HTTPS URL on `www.google.com`
- **THEN** build validation fails and identifies the map's embed field

#### Scenario: Map URLs have reversed roles

- **WHEN** a record puts a Google Maps viewer URL in `map.embed` or an embed URL in `map.app`
- **THEN** build validation fails and identifies the field with the wrong role

#### Scenario: A map URL uses a non-default port

- **WHEN** a map URL uses `https://www.google.com:444` as its origin
- **THEN** build validation fails and identifies the offending map field

#### Scenario: A link uses an unsafe scheme

- **WHEN** a quick link uses a URL scheme other than HTTP or HTTPS
- **THEN** build validation fails and identifies the link's URL field

#### Scenario: An authored container is missing

- **WHEN** a record lacks a schedule list, a link list, or a map object
- **THEN** build validation fails and identifies the missing field
