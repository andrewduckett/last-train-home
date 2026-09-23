## Purpose

Crawl authoring prevents an organizer from publishing YAML that the current app cannot render. It keeps hand-edited records safe without moving definition validation into the runtime provider.

## ADDED Requirements

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
