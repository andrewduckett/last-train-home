## MODIFIED Requirements

### Requirement: A found result guarantees identity, not the definition

A found result SHALL guarantee only that the crawl identity is present and correctly typed. It SHALL NOT guarantee the definition is well formed. Authored YAML provides the definition in this release. Domain layers SHALL validate the fields whose meaning they own.

#### Scenario: Valid identity with a malformed definition still resolves to found

- **WHEN** the provider resolves valid identity with a malformed definition
- **THEN** the promise resolves to found

### Requirement: Expose the in-repo crawl by its id

The in-repo provider SHALL expose each authored YAML crawl by its requested logical id. It SHALL resolve cory-trent as the seed crawl. It SHALL return not-found when no authored record matches the logical id.

#### Scenario: The seed crawl resolves by its id

- **WHEN** a caller calls getCrawl with cory-trent
- **THEN** the promise resolves to a found result whose crawl id is cory-trent

#### Scenario: Another authored crawl resolves by its id

- **WHEN** a caller calls getCrawl with the logical id of another authored record
- **THEN** the promise resolves to that crawl

#### Scenario: Another id is not found

- **WHEN** a caller calls getCrawl with an unknown logical id
- **THEN** the promise resolves to not-found

## ADDED Requirements

### Requirement: Distinguish missing records from unreadable records

The provider SHALL return not-found when no YAML record exists for a requested logical id. It SHALL return invalid for malformed YAML and error for a failed retrieval. Each result SHALL carry the requested logical id.

#### Scenario: The host returns the app shell for a missing file

- **WHEN** a missing YAML request receives the static app shell with HTTP 200
- **THEN** the provider returns not-found

#### Scenario: The authored YAML cannot be parsed

- **WHEN** an existing YAML record has invalid syntax
- **THEN** the provider returns invalid

#### Scenario: Retrieval fails

- **WHEN** the YAML request fails before a record can be read
- **THEN** the provider returns error

### Requirement: Keep lookup within crawl records

The provider SHALL treat a requested logical id as a key. It SHALL accept only lowercase alphanumeric segments separated by single hyphens. It SHALL NOT let the id select a file outside the crawl record location.

#### Scenario: An id contains path syntax

- **WHEN** a caller requests an id containing path separators or parent-directory syntax
- **THEN** the provider returns not-found without retrieving a file outside the crawl records

#### Scenario: An id contains uppercase letters

- **WHEN** a caller requests a mixed-case id
- **THEN** the provider returns not-found without retrieving a file

#### Scenario: An id contains an invalid separator

- **WHEN** a caller requests an id containing an underscore, a leading or trailing hyphen, or adjacent hyphens
- **THEN** the provider returns not-found without retrieving a file

### Requirement: Preserve the planned seed crawl

The YAML seed SHALL preserve every authored value and array order from the existing planned event. Its schedule, venues, tasks, links, and map URLs SHALL stay unchanged.

#### Scenario: The seed record matches the existing event

- **WHEN** the cory-trent YAML record is compared with the existing seed event
- **THEN** every authored definition value and ordered entry matches
