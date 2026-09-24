# Crawl Authoring Specification

## Purpose

Crawl authoring prevents an organizer from publishing YAML that the current app cannot render. It keeps hand-edited records safe without moving definition validation into the runtime provider.

## Requirements

### Requirement: Validate every crawl before publication

The build SHALL parse every YAML crawl record and validate the fields required by the current views. It SHALL fail before deployment when any record is malformed or unsafe to render.

#### Scenario: Every authored record is valid

- **WHEN** the build checks the static crawl directory and every record matches the current renderable shape
- **THEN** crawl validation passes

#### Scenario: A definition field has the wrong type

- **WHEN** any authored record contains a value that a current view cannot safely render
- **THEN** crawl validation fails and identifies the record and field

#### Scenario: YAML syntax is invalid

- **WHEN** any authored record cannot be parsed as YAML
- **THEN** crawl validation fails and identifies the record

### Requirement: Match crawl filenames to logical ids

The build SHALL derive each crawl's logical id from its filename. The id SHALL contain lowercase alphanumeric segments separated by single hyphens. The build SHALL reject any filename that does not match the provider's accepted id grammar.

#### Scenario: A filename cannot become a logical id

- **WHEN** a crawl filename contains uppercase letters, underscores, adjacent hyphens, or an empty segment
- **THEN** crawl validation fails and identifies the file

### Requirement: Enforce current rendering invariants

The build SHALL reject definitions that violate the current views' keyed-list and score requirements. Venue stop labels SHALL be unique. Place names SHALL be unique within each venue. Scavenger task ids SHALL be unique. Scavenger points SHALL produce a finite total greater than zero.

#### Scenario: A rendered key is duplicated

- **WHEN** a record repeats a venue stop label, a place name within one venue, or a scavenger task id
- **THEN** crawl validation fails and identifies the record and duplicated field

#### Scenario: Task points cannot produce a usable tally

- **WHEN** a record's scavenger points produce a non-finite or non-positive total
- **THEN** crawl validation fails and identifies the record and points field

### Requirement: Keep provider validation limited to identity

Build validation SHALL NOT change the runtime provider contract. The provider SHALL continue to validate identity and carry the definition through unchanged.

#### Scenario: Runtime provider reads a build-validated record

- **WHEN** the runtime provider resolves an authored record
- **THEN** it applies the existing identity checks without repeating definition validation

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

### Requirement: Validate optional crawl introduction

The build SHALL accept an omitted introduction. When present, `definition.intro` SHALL be a non-empty string after trimming whitespace. The build SHALL accept Unicode characters, including emoji, in the introduction. The build SHALL reject an invalid introduction and identify its record and field.

#### Scenario: A crawl omits the introduction

- **WHEN** an otherwise valid crawl omits `definition.intro`
- **THEN** build validation accepts the crawl

#### Scenario: An introduction contains emoji

- **WHEN** an otherwise valid crawl has an introduction with emoji
- **THEN** build validation accepts the crawl

#### Scenario: An introduction has the wrong type

- **WHEN** an authored introduction is a number, list, or object
- **THEN** build validation fails and identifies `definition.intro`

#### Scenario: An introduction is blank

- **WHEN** an authored introduction contains only whitespace
- **THEN** build validation fails and identifies `definition.intro`

### Requirement: Validate album links through the quick-link list

The build SHALL accept a crawl without an album link. It SHALL accept a group album in `definition.links` under the same rules as other quick links. The build SHALL reject the obsolete `definition.albumUrl` field so an author does not publish an invisible album destination.

#### Scenario: The seed has no album destination

- **WHEN** cory-trent has Ventra and Metra links but no album URL
- **THEN** build validation accepts its link list

#### Scenario: An organizer adds an album link

- **WHEN** an organizer adds an album label and valid HTTP or HTTPS URL to `definition.links`
- **THEN** build validation accepts that link under the existing link rules

#### Scenario: An album link uses an unsafe URL

- **WHEN** an album link uses a URL scheme other than HTTP or HTTPS
- **THEN** build validation fails and identifies that link's URL field

#### Scenario: An old album field remains

- **WHEN** an authored crawl contains `definition.albumUrl`
- **THEN** build validation fails and identifies `definition.albumUrl`
